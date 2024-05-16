import type { Component } from "solid-js";
import { createStore } from "solid-js/store";
import client from "@encheres-immo/widget-client";
import { For, Show, Switch, Match, createSignal, createEffect } from "solid-js";
import "../assets/app.css"

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
  registration: {
    isUserAllowed: false,
    isRegistrationAccepted: null,
    isParticipant: false,
  },
  isPrivate: false,
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
const CLIENT_ID = "2a89e5ef-996e-4c5c-8a0e-5226698755e4";
const PROPERTY_ID = "111d4754-056e-4167-8ba2-0041501bc0e7";

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
    <div id="box">
      <div>
        <div>
          <Show when={auction.id != ""}>
            <Auction auction={auction} user={user()} />
            <Show 
              when={
                (!isLogged() || isLogging() || (isLogged() && auction.registration == null)) &&
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
                  auction.registration && auction.registration.isRegistrationAccepted && auction.registration.isParticipant &&
                  isAuctionInProgress(auction)
                }
              >
                <Bid auction={auction} />
              </Match>
              <Match
                when={
                  isLogged() &&
                  auction.registration &&
                  auction.registration.isRegistrationAccepted && !auction.registration.isParticipant &&
                  isAuctionInProgress(auction)
                }
              >
                <p class="note">Vous êtes observateur pour cette vente. Vous ne pouvez pas enchérir.</p>
              </Match>
              <Match
                when={
                  isLogged() &&
                  auction.registration &&
                  auction.registration.isRegistrationAccepted && !auction.registration.isParticipant &&
                  isAuctionNotStarted(auction)
                }
              >
                <p class="note">Votre demande d'observation pour cette vente a été acceptée. Attendez le début de l'enchère pour voir les participations.</p>
              </Match>
              <Match
                when={
                  isLogged() &&
                  auction.registration &&
                  auction.registration.isRegistrationAccepted === true &&
                  isAuctionNotStarted(auction)
                }
              >
                <p class="note">Votre demande de participation pour cette vente a été acceptée. Attendez le début de l'enchère pour enchérir.</p>
              </Match>
              <Match when={isLogged() && auction.registration && auction.registration.isRegistrationAccepted === false}>
                <p class="note">Votre demande de participation pour cette vente a été refusée.</p>
              </Match>
              <Match when={isLogged() && auction.registration && auction.registration.isRegistrationAccepted == null}>
                <p class="note">Votre demande de participation a été transmise à l'agent responsable du bien. Vous serez informé par email lorsqu'elle sera validée.</p>
              </Match>
              <Match when={isLogged() && !auction.registration}>
                <p class="note">Vous n'êtes pas inscrit à cette vente, veuillez contacter l'agent responsable.</p>
              </Match>
            </Switch>
            <Show
              when={
                auction.registration &&
                auction.registration.isUserAllowed &&
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
