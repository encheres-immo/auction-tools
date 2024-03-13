import type { Component } from 'solid-js';
import { createStore } from "solid-js/store";
import { For, Show, Switch, Match, createSignal, createEffect } from 'solid-js';

import styles from './App.module.css';
import Auction from './Auction';
import Bid from './Bid';
import BidHistory from './BidHistory';
import ParticipateBox from './ParticipateBox';
import client from './services/client';
import {AuctionType, BidType, UserType} from './types/types';
import { isAuctionNotStarted, isAuctionInProgress, isAuctionEnded } from './utils';

const [isLogged, setIsLogged] = createSignal(false);
const [isLogging, setIsLogging] = createSignal(false);
const [user, setUser] = createSignal<UserType>({id: ''});
const [bids, setBids] = createStore<BidType[]>([]);
const [auction, setAuction] = createStore<AuctionType>(
  {
  id: '',
  startDate: 0,
  endDate: 0,
  startingPrice: 0,
  step: 0,
  bids: [],
  isUserAllowed: false,
  highestBid: {
    id: '',
    amount: 0,
    createdAt: 0,
    newEndDate: 0,
    userAnonymousId: '',
    participantId: '',
    },
  agentEmail: '',
  agentPhone: '',
  currency: {
    symbol: '',
    code: '',
    isBefore: false,
    }
  }
);

  // LOCAL conf
  const CLIENT_ID = '2655cded-91ac-454f-a4e2-c7f3d33c8705';
  // STAGING conf
  // const CLIENT_ID = '488fd76e-3ada-4084-a743-8b091c355c9e';
  // in progess
  // TODO: should we be able to retrieve the auction_id based on the URL??
  const AUCTION_ID = '8d03e116-799d-4dd8-9367-218d40dc74e0';
  // finished
  // const AUCTION_ID = 'e900b9c9-a2c9-4ecd-9975-6c02e0f71ec2';
  // to be started
  // const AUCTION_ID = '6eb9a0eb-2585-4a76-83a9-bf023133ac3c';

  client.initEIClient(CLIENT_ID, "local");

  function refreshAuction(){
    client.subscribeToAuction(AUCTION_ID, (bid) => {
      console.log('Auction data:', bid);
      setBids([...bids, bid]);
      console.log('Bids:', bids);
      // replace highest bid in auction
      const newEndDate = bid.newEndDate || auction.endDate;
      setAuction({
        ...auction,
        highestBid: bid,
        endDate: newEndDate
      });
    }).then( (channel) => {
        console.log('Subscribed to auction');
        console.log('Channel:', channel);
    }).catch( (err) => {
        console.error('Error subscribing to auction:', err);
    });
    client.getAuctionById(AUCTION_ID).then( (auction: AuctionType) => {
      console.log('Auction:', auction)
      setAuction(auction)
      setBids(auction.bids)
    })
  }

  refreshAuction();

const App: Component = () => {

  const url = window.location.href;
  const params = new URLSearchParams(url.split('?')[1]);
  const code = params.get('code');
  if(code != "" && code != null){
    setIsLogging(true);
  }

  function updateUser(user: UserType){
    setUser(user);
    refreshAuction();
  }

  return (
    <div class="bg-dark">
      <div class="w-screen h-screen bg-white">
        <div class="overflow-hidden">
          <Show when={auction.id != ''}>
            <Auction auction={auction} user={user()} />
            <Switch>
              <Match when={isLogged() && isAuctionInProgress(auction)}>
                <Bid auction={auction}/>
              </Match>
              <Match when={(!isLogged() || isLogging()) && (isAuctionInProgress(auction) || isAuctionNotStarted(auction))}>
                <ParticipateBox setterIsLogged={setIsLogged} isLogging={isLogging()} auction={auction} updateUser={updateUser}/>
              </Match>
            </Switch>
            <Show when={auction.isUserAllowed && (isAuctionEnded(auction) || isAuctionInProgress(auction))}>
              <BidHistory bids={bids} auction={auction} user={user()} />
            </Show>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default App;
