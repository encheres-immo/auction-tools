import { createSignal, type Component, Show } from "solid-js";
import { AuctionType, UserType } from "@encheres-immo/widget-client/types";
import {
  isAuctionNotStarted,
  isAuctionInProgress,
  isAuctionEnded,
  displayAmountWithCurrency,
  formatDate,
  parseDate,
} from "./utils.jsx";

/**
 * Display auction details and countdown.
 */
const AuctionInfos: Component<{ auction: AuctionType; user: UserType }> = (
  props
) => {
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
    startDate: Date,
    currentDate: Date
  ): { days: number; hours: number; minutes: number; seconds: number } {
    const totalSeconds = (startDate.getTime() - currentDate.getTime()) / 1000;

    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return { days, hours, minutes, seconds };
  }

  function updateCountdown(auction: AuctionType) {
    setIsAuctionEndedVal(isAuctionEnded(props.auction));
    setIsAuctionInProgressVal(isAuctionInProgress(props.auction));
    setIsAuctionNotStartedVal(isAuctionNotStarted(props.auction));

    if (isAuctionEnded(auction)) {
      clearInterval(interval);
      return;
    }
    const targetDate = isAuctionNotStarted(auction)
      ? auction.startDate
      : auction.endDate;

    const currentDate = new Date(); // User's local date and time
    const remainingTime = getTimeRemaining(parseDate(targetDate), currentDate);
    setRemainingTime(
      `${remainingTime.days}j ${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s`
    );
    return;
  }

  const interval = setInterval(() => {
    updateCountdown(props.auction);
  }, 1000);

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
                {props.auction.highestBid.participantId
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
