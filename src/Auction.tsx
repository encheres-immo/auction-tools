import { Switch, Match, createSignal, createEffect, on, type Component, Show } from 'solid-js';
import {AuctionType, UserType} from './types/types';
import {isAuctionNotStarted, isAuctionInProgress, isAuctionEnded, displayAmountWithCurrency, formatDate, parseDate } from './utils';

const Auction: Component<{auction: AuctionType, user: UserType}> = (props) => {

  const [remainingTime, setRemainingTime] = createSignal("");

  function getTimeRemaining(startDate: Date, currentDate: Date): { days: number, hours: number, minutes: number, seconds: number } {
    const totalSeconds = (startDate.getTime() - currentDate.getTime()) / 1000;

    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return { days, hours, minutes, seconds };
  }

  function updateCountdown(auction: AuctionType) {
    if(isAuctionEnded(auction)) {
      clearInterval(interval);
      return;
    }
    const targetDate = isAuctionNotStarted(auction) ? auction.startDate : auction.endDate;

    const currentDate = new Date(); // User's local date and time
    const remainingTime = getTimeRemaining(parseDate(targetDate), currentDate);
    setRemainingTime(`${remainingTime.days}j ${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s`);
    return;
  }

  const interval = setInterval(() => {
    updateCountdown(props.auction);
  }, 1000)

  return (
    <div style="background-color: #002d40">
      <div class="flex justify-center py-5 font-barnes">
        <div class="flex flex-col">
          <Switch fallback={<div>loading...</div>}>
            <Match when={isAuctionNotStarted(props.auction)}>
              <div>
                <p class="py-3 font-semibold text-white / uppercase text-sm tracking-wider text-center font-barnes-title">
                  Démarre dans 
                </p>
                <p class="font-mono text-white text-xl">{remainingTime()}</p>
              </div>
            </Match>
            <Match when={isAuctionInProgress(props.auction)}>
              <div>
                <p class="py-3 font-semibold text-white / uppercase text-sm tracking-wider text-center font-barnes-title">
                  Se termine dans 
                </p>
                <p class="font-mono text-white text-xl">{remainingTime()}</p>
              </div>
            </Match>
            <Match when={isAuctionEnded(props.auction)}>
              <p class="py-3 font-semibold text-white / uppercase text-sm tracking-wider text-center font-barnes-title">
                Vente terminée
              </p>
            </Match>
          </Switch>
        </div>
      </div>
      <div class="bg-white">
        <div class="font-barnes">
          <div class="grid grid-cols-2 gap-4 p-4">
            <div class="relative text-sm text-dark tracking-wider">
              <p class="font-semibold uppercase font-barnes-title">Début</p>
              <p>{formatDate(props.auction.startDate)} </p>
            </div>
            <div class="relative text-sm text-dark tracking-wider">
              <p class="font-semibold uppercase font-barnes-title">Fin</p>
              <p>{formatDate(props.auction.endDate)}</p>
            </div>
            <div class="relative text-sm text-dark tracking-wider">
              <p class="font-semibold uppercase font-barnes-title">Prix de départ</p>
              <p>{displayAmountWithCurrency(props.auction.startingPrice)} </p>
            </div>
            <div class="relative text-sm text-dark tracking-wider">
              <p class="font-semibold uppercase font-barnes-title">Palier</p>
              <p>{props.auction.step} </p>
            </div>
          </div>
          <div class="py-4 mx-4 border-t border-dark text-center">
            <div class="relative text-sm text-dark tracking-wider">
              <Show when={props.auction.isUserAllowed} fallback={<div><p class="font-semibold uppercase font-barnes-title">Vente privée</p><p>Inscrivez-vous pour voir les participations</p></div>}>
                <p class="font-semibold uppercase font-barnes-title">Meilleure offre</p>
                <p class="font-semibold text-secondary">{displayAmountWithCurrency(props.auction.highestBid.amount, props.auction.currency)} </p>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auction;
