import { Switch, Match, createSignal, createEffect, on, type Component } from 'solid-js';
import {AuctionType} from './types/types';
import {isAuctionNotStarted, isAuctionInProgress, isAuctionEnded} from './utils';

const Auction: Component<{auction: AuctionType}> = (props) => {

  const [remainingTime, setRemainingTime] = createSignal("");

  function parseDate(dateInput: number): Date {
    return new Date(dateInput * 1000);
  }

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

  function formatDate(date: number): string {
    return parseDate(date).toLocaleString();
  }

  return (
    <div>
      <Switch fallback={<div>loading...</div>}>
        <Match when={isAuctionNotStarted(props.auction)}>
          Démarre dans 
          {remainingTime()}
        </Match>
        <Match when={isAuctionInProgress(props.auction)}>
          Se termine dans 
          {remainingTime()}
        </Match>
        <Match when={isAuctionEnded(props.auction)}>
          <div>Terminée</div>
        </Match>
      </Switch>
      <p>Date de début : {formatDate(props.auction.startDate)} </p>
      <p>Date de fin: {formatDate(props.auction.endDate)}</p>
      <p>Prix de départ: {props.auction.startingPrice} </p>
      <p>Palier: {props.auction.step} </p>
      <p>Meilleure enchère: {props.auction.highestBid.amount} </p>
    </div>
  );
};

export default Auction;
