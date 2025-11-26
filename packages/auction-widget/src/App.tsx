import type { Component } from "solid-js";
import { createStore } from "solid-js/store";
import client from "@encheres-immo/widget-client";
import { Show, createSignal, onMount } from "solid-js";
import "../assets/app.css";

import AuctionInfos from "./AuctionInfos.jsx";
import BidHistory from "./BidHistory.jsx";
import BidForm from "./BidForm.jsx";
import ParticipateBox from "./ParticipateBox.jsx";
import RegistrationStatus from "./RegistrationStatus.jsx";
import {
  AuctionType,
  BidType,
  UserType,
  PropertyInfoType,
} from "@encheres-immo/widget-client/types";
import { Spritesheet } from "./Spritesheet.jsx";

const [isLogged, setIsLogged] = createSignal(false);
const [isLogging, setIsLogging] = createSignal(false);
const [isShowRegisterUser, setIsShowRegisterUser] = createSignal(false);
const [user, setUser] = createSignal<UserType | undefined>(undefined);
const [bids, setBids] = createStore<BidType[]>([]);
const [auction, setAuction] = createStore<AuctionType>({
  id: "",
  type: "progressive",
  status: "draft",
  startDate: 0,
  endDate: 0,
  startingPrice: 0,
  reservePrice: null,
  step: 0,
  stepIntervalSeconds: null,
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
    if (
      // Don't try to subscribe to private auctions before user is logged in
      // It won't break the app, but it will throw an error in the console
      !auction?.isPrivate ||
      (isLogged() &&
        auction.registration &&
        auction.registration.isRegistrationAccepted)
    ) {
      setBids(auction.bids);
      client
        .subscribeToAuction(auction.id, (bid) => {
          setBids([...bids, bid]);
          // dispatch event for external integrations
          const event = new CustomEvent("auction-widget:new_bid", {
            detail: {
              amount: bid.amount,
              bidder: bid.userAnonymousId,
              date: bid.createdAt,
            },
          });
          document.getElementById("auction-widget")?.dispatchEvent(event);
          // replace highest bid in auction and update end date if needed
          const newEndDate = bid.newEndDate || auction.endDate;
          setAuction({
            ...auction,
            highestBid: bid,
            endDate: newEndDate,
          });
        })
        .catch((err: any) => {
          console.error("Auction Widget: Error subscribing to auction.", err);
        });
    }
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
  setIsLogged(true);
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

  // Check if we are in the OAuth registration process.
  // If so, grab the OAuth code from the URL and set the logging state to true.
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
        <AuctionInfos auction={auction} user={user()} />
        <ParticipateBox
          auction={auction}
          propertyInfo={propertyInfo}
          setAuction={setAuction}
          isLogged={isLogged}
          isLogging={isLogging}
          updateUser={updateUser}
          allowUserRegistration={allowUserRegistration}
          tosUrl={tosUrl}
        />
        <RegistrationStatus auction={auction} isLogged={isLogged} />
        <BidForm auction={auction} isLogged={isLogged} />
        <BidHistory auction={auction} bids={bids} user={user()} />
      </Show>
      <Spritesheet />
    </div>
  );
};

export default App;
