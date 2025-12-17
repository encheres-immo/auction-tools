import { createSignal, createEffect, onCleanup, createMemo } from "solid-js";
import { AuctionType } from "@encheres-immo/widget-client/types";
import {
  parseDate,
  isAuctionNotStarted,
  isAuctionInProgress,
  isAuctionEnded,
} from "../utils.jsx";

type TimeRemaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  totalSeconds: number;
};

type DigressiveStepInfo = {
  /** Seconds remaining until next price step */
  secondsToNextStep: number;
  /** Formatted string for step countdown (e.g., "0j 0h 0m 25s") */
  formatted: string;
  /** Whether countdown is in warning state (≤10 seconds) */
  isWarning: boolean;
};

export function useAuctionTimer(auction: () => AuctionType) {
  const [currentTime, setCurrentTime] = createSignal(Date.now());
  const [timeRemaining, setTimeRemaining] = createSignal<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    formatted: "",
  });
  const [digressiveStepInfo, setDigressiveStepInfo] =
    createSignal<DigressiveStepInfo>({
      secondsToNextStep: 0,
      formatted: "",
      isWarning: false,
    });

  // These are derived from both auction status AND time calculations
  const [isNotStarted, setIsNotStarted] = createSignal(false);
  const [isInProgress, setIsInProgress] = createSignal(false);
  const [isEnded, setIsEnded] = createSignal(false);

  // Calculate time remaining to a target date
  function calculateTimeRemaining(targetDate: number): TimeRemaining {
    const totalSeconds = Math.max(0, (targetDate - currentTime()) / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return {
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      formatted: `${days}j ${hours}h ${minutes}m ${seconds}s`,
    };
  }

  /**
   * Calculate step countdown for digressive auctions.
   * Shows time until next price decrement.
   */
  function calculateDigressiveStepCountdown(
    startDate: number,
    stepIntervalSeconds: number,
    now: number
  ): DigressiveStepInfo {
    const elapsedMs = now - startDate;
    const elapsedSeconds = Math.max(0, elapsedMs / 1000);
    const secondsInCurrentStep = elapsedSeconds % stepIntervalSeconds;
    const secondsToNextStep = Math.ceil(
      stepIntervalSeconds - secondsInCurrentStep
    );

    return {
      secondsToNextStep,
      formatted: `0j 0h 0m ${secondsToNextStep}s`,
      isWarning: secondsToNextStep <= 10,
    };
  }

  // Memoize the actual auction data to reduce calculations
  const auctionData = createMemo(() => auction());

  // Track the last auction ID to detect when we're dealing with a new auction
  const [lastAuctionId, setLastAuctionId] = createSignal("");

  // Helper to check if auction is digressive
  const isDigressive = createMemo(() => auctionData().type === "digressive");

  // Update timer and determine status based on both auction state and time
  createEffect(() => {
    const currentAuction = auctionData();
    const now = currentTime();

    // If auction ID changed, reset our state
    if (currentAuction.id !== lastAuctionId()) {
      setLastAuctionId(currentAuction.id);
    }

    // First, check the server-provided status
    const serverNotStarted = isAuctionNotStarted(currentAuction);
    const serverInProgress = isAuctionInProgress(currentAuction);
    const serverEnded = isAuctionEnded(currentAuction);

    // Then check time-based status
    const startTimeReached = now >= currentAuction.startDate;
    const endTimeReached = now >= currentAuction.endDate;

    // Determine the effective status:
    // 1. If server says it's ended, it's ended
    // 2. Else if end time is reached, consider it ended locally
    // 3. Else if server says it's in progress OR start time is reached, it's in progress
    // 4. Otherwise it hasn't started yet
    let effectiveNotStarted = false;
    let effectiveInProgress = false;
    let effectiveEnded = false;

    if (serverEnded || endTimeReached) {
      effectiveEnded = true;
    } else if (serverInProgress || startTimeReached) {
      effectiveInProgress = true;
    } else {
      effectiveNotStarted = true;
    }

    // Update our status signals
    setIsNotStarted(effectiveNotStarted);
    setIsInProgress(effectiveInProgress);
    setIsEnded(effectiveEnded);

    // Calculate appropriate time remaining based on status
    if (effectiveEnded) {
      setTimeRemaining({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        formatted: "",
      });
      setDigressiveStepInfo({
        secondsToNextStep: 0,
        formatted: "",
        isWarning: false,
      });
    } else {
      // If not started, countdown to start; if in progress, countdown to end
      const targetDate = effectiveNotStarted
        ? currentAuction.startDate
        : currentAuction.endDate;

      setTimeRemaining(calculateTimeRemaining(targetDate));

      // For digressive auctions in progress, calculate step countdown
      if (
        currentAuction.type === "digressive" &&
        effectiveInProgress &&
        currentAuction.stepIntervalSeconds
      ) {
        setDigressiveStepInfo(
          calculateDigressiveStepCountdown(
            currentAuction.startDate,
            currentAuction.stepIntervalSeconds,
            now
          )
        );
      }
    }
  });

  // Timer interval - update time every second
  const timerInterval = setInterval(() => {
    setCurrentTime(Date.now());
  }, 1000);

  // Clean up interval on component unmount
  onCleanup(() => clearInterval(timerInterval));

  return {
    timeRemaining,
    digressiveStepInfo,
    isDigressive,
    isNotStarted,
    isInProgress,
    isEnded,
  };
}
