import {
  Switch,
  Match,
  createSignal,
  createEffect,
  on,
  type Component,
  Show,
} from "solid-js";
import { AuctionType, UserType } from "@encheres-immo/widget-client/types";
import {
  isAuctionNotStarted,
  isAuctionInProgress,
  isAuctionEnded,
  displayAmountWithCurrency,
  formatDate,
  parseDate,
} from "./utils.js";

const Auction: Component<{ auction: AuctionType; user: UserType }> = (
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
      <div>
        <div>
          <div id="header">
            <Show when={isAuctionNotStartedVal()}>
              <div>
                <p id="status">
                  Démarre dans
                </p>
                <p id="countdown">{remainingTime()}</p>
              </div>
            </Show>
          </div>
          <Show when={isAuctionInProgressVal()}>
            <div>
              <p id="status">
                Se termine dans
              </p>
              <p id="countdown">{remainingTime()}</p>
            </div>
          </Show>
          <Show when={isAuctionEndedVal()}>
            <p id="status">
              Vente terminée
            </p>
          </Show>
        </div>
      </div>
      <div>
        <div>
          <div id="description">
            <div>
              <p class="detail label">Début</p>
              <p class="detail">{formatDate(props.auction.startDate)} </p>
            </div>
            <div>
              <p class="detail label">Fin</p>
              <p class="detail">{formatDate(props.auction.endDate)}</p>
            </div>
            <div>
              <p class="detail label">
                Prix de départ
              </p>
              <p class="detail accent">{displayAmountWithCurrency(props.auction.startingPrice)} </p>
            </div>
            <div>
              <p class="detail label">Palier</p>
              <p class="detail accent">{displayAmountWithCurrency(props.auction.step)}</p>
            </div>
          </div>
          <div class="section border-t">
            <div>
              <Show
                when={props.auction.registration && props.auction.registration.isUserAllowed}
                fallback={
                  <div>
                    <p class="detail label">
                      Vente privée
                    </p>
                    <p class="detail">Inscrivez-vous pour voir les participations</p>
                  </div>
                }
              >
                <p class="detail label">
                  Meilleure offre
                </p>
                <p class="detail accent">
                  {displayAmountWithCurrency(
                    props.auction.highestBid.amount,
                    props.auction.currency
                  )}{" "}
                </p>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auction;
