import { createSignal, createEffect, type Component, Show } from "solid-js";
import {
  isAuctionNotStarted,
  isAuctionInProgress,
  isAuctionEnded,
  displayAmountWithCurrency,
  formatDate,
  parseDate,
} from "./utils.jsx";
import { AuctionType, UserType } from "@encheres-immo/widget-client/types";

interface AuctionInfosProps {
  auction: AuctionType;
  user: UserType | undefined;
  clock?: () => number;
}

/**
 * Display auction details and countdown.
 */
const AuctionInfos: Component<AuctionInfosProps> = (props) => {
  const [remainingTime, setRemainingTime] = createSignal("");
  const [isAuctionNotStartedVal, setIsAuctionNotStartedVal] = createSignal(
    isAuctionNotStarted(props.auction)
  );
  const [isAuctionInProgressVal, setIsAuctionInProgressVal] = createSignal(
    isAuctionInProgress(props.auction)
  );
  const [isAuctionEndedVal, setIsAuctionEndedVal] = createSignal(
    isAuctionEnded(props.auction)
  );

  function getTimeRemaining(
    targetDate: Date,
    currentDate: Date
  ): { days: number; hours: number; minutes: number; seconds: number } {
    const totalSeconds = (targetDate.getTime() - currentDate.getTime()) / 1000;
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return { days, hours, minutes, seconds };
  }

  function updateCountdown(auction: AuctionType, currentDate: Date) {
    setIsAuctionEndedVal(isAuctionEnded(auction));
    setIsAuctionInProgressVal(isAuctionInProgress(auction));
    setIsAuctionNotStartedVal(isAuctionNotStarted(auction));

    if (isAuctionEnded(auction)) return;

    const targetDate = isAuctionNotStarted(auction)
      ? auction.startDate
      : auction.endDate;

    const remaining = getTimeRemaining(parseDate(targetDate), currentDate);
    setRemainingTime(
      `${remaining.days}j ${remaining.hours}h ${remaining.minutes}m ${remaining.seconds}s`
    );
  }

  // Re-calcule le countdown chaque fois que le clock change.
  createEffect(() => {
    const currentTime = props.clock ? new Date(props.clock()) : new Date();
    updateCountdown(props.auction, currentTime);
  });

  return (
    <div>
      <div id="auction-widget-header">
        <Show when={isAuctionNotStartedVal()}>
          <div>
            <p id="auction-widget-status">Démarre dans</p>
            <p id="auction-widget-countdown">{remainingTime()}</p>
          </div>
        </Show>
        <Show when={isAuctionInProgressVal()}>
          <div>
            <p id="auction-widget-status">Se termine dans</p>
            <p id="auction-widget-countdown">{remainingTime()}</p>
          </div>
        </Show>
        <Show when={isAuctionEndedVal()}>
          <p id="auction-widget-status">Vente terminée</p>
        </Show>
      </div>
      <div>
        <div id="auction-widget-description">
          <div>
            <p class="auction-widget-detail auction-widget-label">Début</p>
            <p class="auction-widget-detail">
              {formatDate(props.auction.startDate)}{" "}
            </p>
          </div>
          <div>
            <p class="auction-widget-detail auction-widget-label">Fin</p>
            <p class="auction-widget-detail">
              {formatDate(props.auction.endDate)}
            </p>
          </div>
          <div>
            <p class="auction-widget-detail auction-widget-label">
              Prix de départ
            </p>
            <p class="auction-widget-detail auction-widget-accent">
              {displayAmountWithCurrency(props.auction.startingPrice)}{" "}
            </p>
          </div>
          <div>
            <p class="auction-widget-detail auction-widget-label">Palier</p>
            <p class="auction-widget-detail auction-widget-accent">
              {displayAmountWithCurrency(props.auction.step)}
            </p>
          </div>
        </div>
        <div class="auction-widget-section auction-widget-border-t">
          <div>
            <Show
              when={
                !props.auction.isPrivate ||
                (props.auction.isPrivate &&
                  props.auction.registration &&
                  props.auction.registration.isUserAllowed &&
                  props.auction.registration.isRegistrationAccepted)
              }
              fallback={
                <div>
                  <p class="auction-widget-detail auction-widget-label">
                    Vente privée
                  </p>
                  <p class="auction-widget-detail">
                    Inscrivez-vous pour voir les participations
                  </p>
                </div>
              }
            >
              <p class="auction-widget-detail auction-widget-label">
                Meilleure offre
              </p>
              <p class="auction-widget-detail auction-widget-accent">
                {props.auction.highestBid?.participantId
                  ? displayAmountWithCurrency(
                      props.auction.highestBid.amount,
                      props.auction.currency
                    )
                  : displayAmountWithCurrency(null, props.auction.currency)}
              </p>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionInfos;
