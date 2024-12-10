import type { Component } from "solid-js";
import { createStore } from "solid-js/store";
import client from "@encheres-immo/widget-client";
import { Show, createSignal } from "solid-js";
import "../assets/app.css";

import Auction from "./Auction.js";
import BidHistory from "./BidHistory.js";
import BidForm from "./BidForm.js";
import ParticipateBox from "./ParticipateBox.js";
import RegistrationStatus from "./RegistrationStatus.js";
import {
  AuctionType,
  BidType,
  UserType,
  PropertyInfoType,
} from "@encheres-immo/widget-client/types";

const [isLogged, setIsLogged] = createSignal(false);
const [isLogging, setIsLogging] = createSignal(false);
const [isShowRegisterUser, setIsShowRegisterUser] = createSignal(false);
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
  allowUserRegistration: boolean;
  tosUrl: string;
  environment: "local" | "staging" | "production";
}> = (props) => {
  const {
    apiKey,
    propertyInfo,
    environment = "production",
    allowUserRegistration,
    tosUrl,
  } = props;
  // Initialize client and auction
  client.initEIClient(apiKey, environment);
  refreshAuction(propertyInfo);

  // Check URL if user is logged
  const url = window.location.href;
  const params = new URLSearchParams(url.split("?")[1]);
  const code = params.get("code");
  if (code != "" && code != null) {
    setIsLogging(true);
    setIsShowRegisterUser(true);
  }

  return (
    <div id="auction-widget-box">
      <Show when={auction.id != ""}>
        <Auction auction={auction} user={user()} />
        <ParticipateBox
          setterIsLogged={setIsLogged}
          isLogging={isLogging()}
          auction={auction}
          updateUser={updateUser(user(), propertyInfo)}
        />
        <BidForm auction={auction} isLogged={isLogged} />
        <RegistrationStatus isLogged={isLogged} auction={auction} />
        <BidHistory bids={bids} auction={auction} user={user()} />
      </Show>
    </div>
  );
};

export default App;
