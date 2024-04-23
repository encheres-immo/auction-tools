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
    <div style="background-color: #002d40">
      <div class="font-barnes flex justify-center py-5">
        <div class="flex flex-col">
          <Show when={isAuctionNotStartedVal()}>
            <div>
              <p class="/ font-barnes-title py-3 text-center text-sm font-semibold uppercase tracking-wider text-white">
                Démarre dans
              </p>
              <p class="font-mono text-xl text-white">{remainingTime()}</p>
            </div>
          </Show>
          <Show when={isAuctionInProgressVal()}>
            <div>
              <p class="/ font-barnes-title py-3 text-center text-sm font-semibold uppercase tracking-wider text-white">
                Se termine dans
              </p>
              <p class="font-mono text-xl text-white">{remainingTime()}</p>
            </div>
          </Show>
          <Show when={isAuctionEndedVal()}>
            <p class="/ font-barnes-title py-3 text-center text-sm font-semibold uppercase tracking-wider text-white">
              Vente terminée
            </p>
          </Show>
        </div>
      </div>
      <div class="bg-white">
        <div class="font-barnes">
          <div class="grid grid-cols-2 gap-4 p-4">
            <div class="text-dark relative text-sm tracking-wider">
              <p class="font-barnes-title font-semibold uppercase">Début</p>
              <p>{formatDate(props.auction.startDate)} </p>
            </div>
            <div class="text-dark relative text-sm tracking-wider">
              <p class="font-barnes-title font-semibold uppercase">Fin</p>
              <p>{formatDate(props.auction.endDate)}</p>
            </div>
            <div class="text-dark relative text-sm tracking-wider">
              <p class="font-barnes-title font-semibold uppercase">
                Prix de départ
              </p>
              <p>{displayAmountWithCurrency(props.auction.startingPrice)} </p>
            </div>
            <div class="text-dark relative text-sm tracking-wider">
              <p class="font-barnes-title font-semibold uppercase">Palier</p>
              <p>{displayAmountWithCurrency(props.auction.step)}</p>
            </div>
          </div>
          <div class="border-dark mx-4 border-t py-4 text-center">
            <div class="text-dark relative text-sm tracking-wider">
              <Show
                when={props.auction.isUserAllowed}
                fallback={
                  <div>
                    <p class="font-barnes-title font-semibold uppercase">
                      Vente privée
                    </p>
                    <p>Inscrivez-vous pour voir les participations</p>
                  </div>
                }
              >
                <p class="font-barnes-title font-semibold uppercase">
                  Meilleure offre
                </p>
                <p class="text-secondary font-semibold">
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
