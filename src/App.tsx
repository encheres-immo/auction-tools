import type { Component } from 'solid-js';
import { createStore } from "solid-js/store";
import { For, Show, Switch, Match, createSignal } from 'solid-js';

import styles from './App.module.css';
import Auction from './Auction';
import Bid from './Bid';
import BidHistory from './BidHistory';
import ParticipateBox from './ParticipateBox';
import client from './services/client';
import {AuctionType, BidType} from './types/types';

const [isLogged, setIsLogged] = createSignal(false);
const [isLogging, setIsLogging] = createSignal(false);
const [bids, setBids] = createStore<BidType[]>([]);
const [auction, setAuction] = createStore<AuctionType>(
  {
  id: '',
  startDate: '',
  endDate: '',
  startingPrice: 0,
  step: 0,
  bids: [],
  highestBid: {
    id: '',
    amount: 0,
    createdAt: '',
    newEndDate: '',
    userAnonymousId: ''
    },
  agentEmail: '',
  agentPhone: ''
  }
);

  // LOCAL conf
  const CLIENT_ID = '2655cded-91ac-454f-a4e2-c7f3d33c8705';
  // STAGING conf
  // const CLIENT_ID = '488fd76e-3ada-4084-a743-8b091c355c9e';
  const AUCTION_ID = '8d03e116-799d-4dd8-9367-218d40dc74e0';

  client.initEIClient(CLIENT_ID, "local");

  client.subscribeToAuction(AUCTION_ID, (bid) => {
    console.log('Auction data:', bid);
    setBids([...bids, bid]);
    console.log('Bids:', bids);
    // replace highest bid in auction
    setAuction({
      ...auction,
      highestBid: bid
    });
  }).then( (channel) => {
      console.log('Subscribed to auction');
      console.log('Channel:', channel);
  }).catch( (err) => {
      console.error('Error subscribing to auction:', err);
  });
  // client.callToTestEndpoint();
  client.getAuctionById(AUCTION_ID).then( (auction: AuctionType) => {
    console.log('Auction:', auction)
    setAuction(auction)
    setBids(auction.bids)
  })

const App: Component = () => {

  const url = window.location.href;
  const params = new URLSearchParams(url.split('?')[1]);
  const code = params.get('code');
  if(code != "" && code != null){
    setIsLogging(true);
  }

  return (
    <div class={styles.App}>
      is logged : {isLogged() ? 'true' : 'false'} <br />
      is logging : {isLogging() ? 'true' : 'false'} <br />
      <Auction auction={auction}/>
      <Switch fallback={<div>Not Found</div>}>
        <Match when={isLogged()}>
          <Bid auction={auction}/>
        </Match>
        <Match when={!isLogged() || isLogging()}>
          <ParticipateBox setterIsLogged={setIsLogged} isLogging={isLogging()} auction={auction} />
        </Match>
      </Switch>
      <BidHistory bids={bids}/>
    </div>
  );
};

export default App;
