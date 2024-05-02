import type { Component } from "solid-js";
import { createStore } from "solid-js/store";
import client from "@encheres-immo/widget-client";
import { For, Show, Switch, Match, createSignal, createEffect } from "solid-js";

import Auction from "./Auction.js";
import Bid from "./Bid.js";
import BidHistory from "./BidHistory.js";
import ParticipateBox from "./ParticipateBox.js";
import {
  AuctionType,
  BidType,
  UserType,
} from "@encheres-immo/widget-client/types";
import {
  isAuctionNotStarted,
  isAuctionInProgress,
  isAuctionEnded,
} from "./utils.js";

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
  isRegistrationAccepted: null,
  isParticipant: false,
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
const CLIENT_ID = "f88243ad-679a-4517-9129-665d43eb78b8";
// const PROPERTY_ID = "fd5d0271-038b-4798-ba9e-26a8cbba7353";
const PROPERTY_ID = "fd5d0271-038b-4798-ba9e-26a8cbba7353";

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
    setIsLogging(false);
  }

  return (
    <div class="bg-dark">
      <div class="h-screen w-screen bg-white">
        <div class="overflow-hidden">
          <Show when={auction.id != ""}>
            <Auction auction={auction} user={user()} />
            <Show 
              when={
                (!isLogged() || isLogging()) &&
                (isAuctionInProgress(auction) || isAuctionNotStarted(auction))
              }
            >
              <ParticipateBox
                setterIsLogged={setIsLogged}
                isLogging={isLogging()}
                auction={auction}
                updateUser={updateUser}
              />
            </Show>
            <Switch>
              <Match
                when={
                  isLogged() &&
                  auction.isUserRegistered && auction.isRegistrationAccepted && auction.isParticipant &&
                  isAuctionInProgress(auction)
                }
              >
                <Bid auction={auction} />
              </Match>
              <Match
                when={
                  isLogged() &&
                  auction.isRegistrationAccepted && !auction.isParticipant &&
                  isAuctionInProgress(auction)
                }
              >
                <p class="p-4 text-sm leading-5 text-slate-500 text-center">Vous êtes observateur pour cette vente. Vous ne pouvez pas enchérir.</p>
              </Match>
              <Match
                when={
                  isLogged() &&
                  auction.isUserRegistered === true &&
                  auction.isRegistrationAccepted && !auction.isParticipant &&
                  isAuctionNotStarted(auction)
                }
              >
                <p class="p-4 text-sm leading-5 text-slate-500 text-center">Votre demande d'observation pour cette vente a été acceptée. Attendez le début de l'enchère pour voir les participations.</p>
              </Match>
              <Match
                when={
                  isLogged() &&
                  auction.isUserRegistered === true &&
                  auction.isRegistrationAccepted === true &&
                  isAuctionNotStarted(auction)
                }
              >
                <p class="p-4 text-sm leading-5 text-slate-500 text-center">Votre demande de participation pour cette vente a été acceptée. Attendez le début de l'enchère pour enchérir.</p>
              </Match>
              <Match when={isLogged() && auction.isUserRegistered === true && auction.isRegistrationAccepted === false}>
                <p class="p-4 text-sm leading-5 text-slate-500 text-center">Votre demande de participation pour cette vente a été refusée.</p>
              </Match>
              <Match when={isLogged() && auction.isUserRegistered === true && auction.isRegistrationAccepted == null}>
                <p class="p-4 text-sm leading-5 text-slate-500 text-center">Votre demande de participation a été transmise à l'agent responsable du bien. Vous serez informé par email lorsqu'elle sera validée.</p>
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
