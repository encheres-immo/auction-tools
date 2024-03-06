import type { Component } from 'solid-js';
import {AuctionType} from './types/types';

const Auction: Component<{auction: AuctionType}> = (props) => {
  return (
    <div>
      <h1>Date de début : {props.auction.startDate} </h1>
      <p>Date de fin: {props.auction.endDate} </p>
      <p>Prix de départ: {props.auction.startingPrice} </p>
      <p>Palier: {props.auction.step} </p>
      <p>Meilleure enchère: {props.auction.highestBid.amount} </p>
    </div>
  );
};

export default Auction;
