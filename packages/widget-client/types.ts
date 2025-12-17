/**
 * Auction type determines the bidding mechanism.
 * - progressive: Standard ascending auction where bids increase
 * - digressive: Dutch-style descending auction where price decreases over time
 */
export type AuctionKind = "progressive" | "digressive";

/**
 * An Enchère Immo auction is a timed event where participants can place bids on a
 * real estate property.
 */
export type AuctionType = {
  id: string;
  type: AuctionKind;
  status: "draft" | "scheduled" | "started" | "completed" | "cancelled";
  startDate: number;
  endDate: number;
  startingPrice: number;
  step: number;
  /** Interval in seconds between price decrements for digressive auctions. Null for progressive. */
  stepIntervalSeconds: number | null;
  bids: BidType[];
  highestBid: BidType;
  /** Final sale price when auction ends. Received via WebSocket 'ended' event. */
  finalPrice?: number | null;
  agentEmail: string;
  agentPhone: string;
  currency: CurrencyType;
  registration: RegistrationType | null;
  isPrivate: boolean;
};

/**
 * Shows the participation status of a user in an auction.
 */
export type RegistrationType = {
  isUserAllowed: boolean;
  isRegistrationAccepted: boolean | null;
  isParticipant: boolean;
};

/**
 * A bid is an offer to buy a property at a certain price by an auction participant.
 */
export type BidType = {
  id: string;
  amount: number;
  createdAt: number;
  newEndDate: number;
  userAnonymousId: string;
  participantId: string;
};

/**
 * Bids and starting prices are expressed with a specific monetary unit.
 */
export type CurrencyType = {
  isBefore: boolean;
  symbol: string;
  code: string;
};

/**
 * A user is a person who interacts with the Enchère Immo platform.
 * Mainly agents and auction participants (bidders and observers).
 */
export type UserType = {
  id: string;
  email: string;
};

/**
 * A property is a real estate asset that is being auctioned.
 */
export type PropertyInfoType = {
  propertyId?: string;
  source?: string;
  sourceAgencyId?: string;
  sourceId?: string;
};

/**
 * Payload received when an auction ends via WebSocket.
 */
export type AuctionEndedPayload = {
  auctionId: string;
  /** Final sale price. Null if auction ended without a winner (except digressive). */
  finalPrice: number | null;
};

/**
 * Callback options for auction WebSocket subscription.
 */
export type SubscribeToAuctionCallbacks = {
  /** Called when a new bid is placed on the auction */
  onNewBid?: (bid: BidType) => void;
  /** Called when the auction ends */
  onAuctionEnded?: (payload: AuctionEndedPayload) => void;
};
