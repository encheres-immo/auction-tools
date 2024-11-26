/**
 * An Enchère Immo auction is a timed event where participants can place bids on a
 * real estate property.
 */
export type AuctionType = {
  id: string;
  startDate: number;
  endDate: number;
  startingPrice: number;
  step: number;
  bids: BidType[];
  highestBid: BidType;
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
