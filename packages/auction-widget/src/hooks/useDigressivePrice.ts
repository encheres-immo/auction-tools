import { createSignal, onCleanup, createMemo, Accessor } from "solid-js";
import { AuctionType } from "@encheres-immo/widget-client/types";

type DigressivePriceState = {
  /** Current calculated price for digressive auction */
  readonly currentPrice: number;
  /** Seconds remaining until next price step (0-stepIntervalSeconds) */
  readonly secondsToNextStep: number;
  /** Whether the countdown is in warning state (≤10 seconds) */
  readonly isWarning: boolean;
  /** Whether a bid has been placed (auction price is frozen) */
  readonly hasBid: boolean;
};

/**
 * Calculate the digressive price based on elapsed time.
 * Price = startingPrice - (stepsPassed * step)
 * The price never goes below 0 (server enforces reserve price).
 *
 * @returns Object with calculated price and seconds until next step
 */
export function calculateDigressivePrice(
  startDate: number,
  startingPrice: number,
  step: number,
  stepIntervalSeconds: number,
  now: number
): { price: number; secondsToNextStep: number } {
  const elapsedMs = now - startDate;
  const elapsedSeconds = Math.max(0, elapsedMs / 1000);
  const stepsPassed = Math.floor(elapsedSeconds / stepIntervalSeconds);
  const secondsInCurrentStep = elapsedSeconds % stepIntervalSeconds;
  const secondsToNextStep = Math.ceil(
    stepIntervalSeconds - secondsInCurrentStep
  );

  // Price decreases but never below 0 (reserve price is server-side)
  const price = Math.max(0, startingPrice - stepsPassed * step);

  return { price, secondsToNextStep };
}

/**
 * Hook to calculate the current price for a digressive auction based on elapsed time.
 * The price decreases by `step` every `stepIntervalSeconds` seconds.
 *
 * Uses a signal for current time that updates every second, triggering
 * reactive recalculation of the derived price state.
 *
 * @param auction - Reactive accessor to the auction data
 * @returns Reactive state with current price and countdown info
 */
export function useDigressivePrice(auction: Accessor<AuctionType>) {
  // Signal that ticks every second to drive reactive updates
  const [currentTime, setCurrentTime] = createSignal(Date.now());

  // Timer interval - update time every second
  const timerInterval = setInterval(() => {
    setCurrentTime(Date.now());
  }, 1000);

  // Clean up interval when the reactive scope is disposed
  onCleanup(() => clearInterval(timerInterval));

  // Helper to check if auction is digressive
  const isDigressive = createMemo(() => auction().type === "digressive");

  // Derive price state reactively from current time and auction data
  const priceState = createMemo<DigressivePriceState>(() => {
    const currentAuction = auction();
    const now = currentTime();

    // Only calculate for digressive auctions
    if (currentAuction.type !== "digressive") {
      return {
        currentPrice: currentAuction.startingPrice,
        secondsToNextStep: 0,
        isWarning: false,
        hasBid: false,
      };
    }

    // If auction hasn't started, show starting price
    if (currentAuction.status !== "started" || now < currentAuction.startDate) {
      return {
        currentPrice: currentAuction.startingPrice,
        secondsToNextStep: currentAuction.stepIntervalSeconds ?? 0,
        isWarning: false,
        hasBid: false,
      };
    }

    // If there's already a bid, the price is frozen at the bid amount
    const hasBid =
      currentAuction.highestBid?.participantId != null &&
      currentAuction.highestBid?.participantId !== "";

    if (hasBid) {
      return {
        currentPrice: currentAuction.highestBid.amount,
        secondsToNextStep: 0,
        isWarning: false,
        hasBid: true,
      };
    }

    // Calculate the current digressive price based on elapsed time
    const stepIntervalSeconds = currentAuction.stepIntervalSeconds ?? 60;
    const { price, secondsToNextStep } = calculateDigressivePrice(
      currentAuction.startDate,
      currentAuction.startingPrice,
      currentAuction.step,
      stepIntervalSeconds,
      now
    );

    return {
      currentPrice: price,
      secondsToNextStep,
      isWarning: secondsToNextStep <= 10,
      hasBid: false,
    };
  });

  return {
    priceState,
    isDigressive,
  };
}
