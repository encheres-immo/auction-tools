import type { Component } from "solid-js";
import { createStore } from "solid-js/store";
import client from "@encheres-immo/widget-client";
import { Show, Switch, Match, createSignal } from "solid-js";
import "../assets/app.css";

import Auction from "./Auction.js";
import Bid from "./Bid.js";
import BidHistory from "./BidHistory.js";
import ParticipateBox from "./ParticipateBox.js";
import {
  AuctionType,
  BidType,
  UserType,
  PropertyInfoType,
} from "@encheres-immo/widget-client/types";
import { isAuctionNotStarted, isAuctionInProgress, isAuctionEnded } from "./utils.js";

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

/**
 * Refresh auction data and subscribe to auction events (new bid, end of auction)
 * @param propertyInfo - retreive next auction data for this property
 */
function refreshAuction(propertyInfo: PropertyInfoType) {
  client.getNextAuctionById(propertyInfo).then((auction: AuctionType) => {
    setAuction(auction);
    setBids(auction.bids);

    client
      .subscribeToAuction(auction.id, (bid) => {
        setBids([...bids, bid]);
        // replace highest bid in auction
        const newEndDate = bid.newEndDate || auction.endDate;
        setAuction({
          ...auction,
          highestBid: bid,
          endDate: newEndDate,
        });
      })
      .catch((err) => {
        console.error("Error subscribing to auction:", err);
      });
  });
}

/**
 * Update user data and refresh auction data based on user permissions
 * @param user - user to update
 * @param propertyInfo - refresh auction data for this property
 */
function updateUser(user: UserType, propertyInfo: PropertyInfoType) {
  setUser(user);
  refreshAuction(propertyInfo);
  setIsLogging(false);
}

/**
 * App component, base component of our auction widget
 * @param props - apiKey and propertyId
 */
const App: Component<{
  apiKey: string;
  propertyInfo: PropertyInfoType;
  environment: "local" | "staging" | "production";
}> = (props) => {
  const { apiKey, propertyInfo, environment = "production" } = props;
  // Initialize client and auction
  client.initEIClient(apiKey, environment);
  refreshAuction(propertyInfo);

  // Check URL if user is logged
  const url = window.location.href;
  const params = new URLSearchParams(url.split("?")[1]);
  const code = params.get("code");
  if (code != "" && code != null) {
    setIsLogging(true);
  }

  return (
    <div id="auction-widget-box">
      <div>
        <div>
          <Show when={auction.id != ""}>
            <Auction auction={auction} user={user()} />
            <Show
              when={
                (!isLogged() || isLogging()) &&
                (isAuctionInProgress(auction) || isAuctionNotStarted(auction) || (isAuctionEnded(auction) && auction.isPrivate))
              }
            >
              <ParticipateBox
                setterIsLogged={setIsLogged}
                isLogging={isLogging()}
                auction={auction}
                updateUser={updateUser}
                propertyInfo={propertyInfo}
              />
            </Show>
            <Switch>
              <Match
                when={
                  isLogged() &&
                  auction.registration &&
                  auction.registration.isRegistrationAccepted &&
                  auction.registration.isParticipant &&
                  isAuctionInProgress(auction)
                }
              >
                <Bid auction={auction} />
              </Match>
              <Match
                when={
                  isLogged() &&
                  auction.registration &&
                  auction.registration.isRegistrationAccepted &&
                  !auction.registration.isParticipant &&
                  isAuctionInProgress(auction)
                }
              >
                <p class="auction-widget-note">
                  Vous êtes observateur pour cette vente. Vous ne pouvez pas
                  enchérir.
                </p>
              </Match>
              <Match
                when={
                  isLogged() &&
                  auction.registration &&
                  auction.registration.isRegistrationAccepted &&
                  !auction.registration.isParticipant &&
                  isAuctionNotStarted(auction)
                }
              >
                <p class="auction-widget-note">
                  Votre demande d'observation pour cette vente a été acceptée.
                  Attendez le début de l'enchère pour voir les participations.
                </p>
              </Match>
              <Match
                when={
                  isLogged() &&
                  auction.registration &&
                  auction.registration.isRegistrationAccepted === true &&
                  isAuctionNotStarted(auction)
                }
              >
                <p class="auction-widget-note">
                  Votre demande de participation pour cette vente a été
                  acceptée. Attendez le début de l'enchère pour enchérir.
                </p>
              </Match>
              <Match
                when={
                  isLogged() &&
                  auction.registration &&
                  auction.registration.isRegistrationAccepted === false
                }
              >
                <p class="auction-widget-note">
                  Votre demande de participation pour cette vente a été refusée.
                </p>
              </Match>
              <Match
                when={
                  isLogged() &&
                  auction.registration &&
                  auction.registration.isRegistrationAccepted == null
                }
              >
                <p class="auction-widget-note">
                  Votre demande de participation a été transmise à l'agent
                  responsable du bien. Vous serez informé par email lorsqu'elle
                  sera validée.
                </p>
              </Match>
              <Match when={isLogged() && !auction.registration}>
                <p class="auction-widget-note">
                  Vous n'êtes pas inscrit à cette vente, veuillez contacter
                  l'agent responsable.
                </p>
              </Match>
            </Switch>
            <BidHistory bids={bids} auction={auction} user={user()} />
          </Show>
        </div>
      </div>
    </div>
  );
};

export default App;
