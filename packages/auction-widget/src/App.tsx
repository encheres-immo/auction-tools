import type { Component } from "solid-js";
import { createStore } from "solid-js/store";
import { For, Show, Switch, Match, createSignal, createEffect } from "solid-js";

import Auction from "./Auction";
import Bid from "./Bid";
import BidHistory from "./BidHistory";
import ParticipateBox from "./ParticipateBox";
import client from "./services/client";
import { AuctionType, BidType, UserType } from "./types/types";
import {
  isAuctionNotStarted,
  isAuctionInProgress,
  isAuctionEnded,
} from "./utils";

const [isLogged, setIsLogged] = createSignal(false);
const [isLogging, setIsLogging] = createSignal(false);
const [user, setUser] = createSignal<UserType>({ id: "" });
const [bids, setBids] = createStore<BidType[]>([]);
const [auction, setAuction] = createStore<AuctionType>({
  id: "",
  startDate: 0,
  endDate: 0,
  startingPrice: 0,
  step: 0,
  bids: [],
  isUserAllowed: false,
  isUserRegistered: false,
  highestBid: {
    id: "",
    amount: 0,
    createdAt: 0,
    newEndDate: 0,
    userAnonymousId: "",
    participantId: "",
  },
  agentEmail: "",
  agentPhone: "",
  currency: {
    symbol: "",
    code: "",
    isBefore: false,
  },
});

// CONFIG
const CLIENT_ID = "e4cd125a-80eb-4ce9-8407-2464928d9259";
const PROPERTY_ID = "50d5dcb4-54b6-4773-a758-f181802c8f9c";

client.initEIClient(CLIENT_ID, "local");

function refreshAuction() {
  console.log("refreshAuction");
  client.getNextAuctionById(PROPERTY_ID).then((auction: AuctionType) => {
    console.log("Auction:", auction);
    setAuction(auction);
    setBids(auction.bids);

    client
      .subscribeToAuction(auction.id, (bid) => {
        console.log("Auction data:", bid);
        setBids([...bids, bid]);
        console.log("Bids:", bids);
        // replace highest bid in auction
        const newEndDate = bid.newEndDate || auction.endDate;
        setAuction({
          ...auction,
          highestBid: bid,
          endDate: newEndDate,
        });
      })
      .then((channel) => {
        console.log("Subscribed to auction");
        console.log("Channel:", channel);
      })
      .catch((err) => {
        console.error("Error subscribing to auction:", err);
      });
  });
}

refreshAuction();

const App: Component = () => {
  const url = window.location.href;
  const params = new URLSearchParams(url.split("?")[1]);
  const code = params.get("code");
  if (code != "" && code != null) {
    setIsLogging(true);
  }

  function updateUser(user: UserType) {
    setUser(user);
    refreshAuction();
  }

  return (
    <div class="bg-dark">
      <div class="h-screen w-screen bg-white">
        <div class="overflow-hidden">
          <Show when={auction.id != ""}>
            <Auction auction={auction} user={user()} />
            <Switch>
              <Match
                when={
                  isLogged() &&
                  auction.isUserRegistered &&
                  isAuctionInProgress(auction)
                }
              >
                <Bid auction={auction} />
              </Match>
              <Match
                when={
                  (!isLogged() || isLogging() || auction.isUserRegistered) &&
                  (isAuctionInProgress(auction) || isAuctionNotStarted(auction))
                }
              >
                <ParticipateBox
                  setterIsLogged={setIsLogged}
                  isLogging={isLogging()}
                  auction={auction}
                  updateUser={updateUser}
                />
              </Match>
            </Switch>
            <Show
              when={
                auction.isUserAllowed &&
                (isAuctionEnded(auction) || isAuctionInProgress(auction))
              }
            >
              <BidHistory bids={bids} auction={auction} user={user()} />
            </Show>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default App;
