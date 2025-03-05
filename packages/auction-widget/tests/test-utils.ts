import {
  AuctionType,
  BidType,
  PropertyInfoType,
  RegistrationType,
  UserType,
} from "@encheres-immo/widget-client/types";

/**
 * Factory function to create an property, pass only the properties you want to override.
 */
export function factoryPropertyInfo(
  propertyInfoParams: Partial<PropertyInfoType> = {}
): PropertyInfoType {
  const basePropertyInfo: PropertyInfoType = {
    propertyId: "property1",
  };
  return { ...basePropertyInfo, ...propertyInfoParams };
}

/**
 * Factory function to create an auction, pass only the properties you want to override.
 */
export function factoryAuction(
  auctionParams: Partial<AuctionType> = {}
): AuctionType {
  const baseAuction: AuctionType = {
    id: "auction1",
    status: "scheduled",
    startDate: Date.now() + 10000, // Starts in 10 seconds
    endDate: Date.now() + 20000, // Ends in 20 seconds
    startingPrice: 10000,
    step: 100,
    bids: [],
    highestBid: {
      id: "",
      amount: 0,
      createdAt: 0,
      newEndDate: 0,
      userAnonymousId: "",
      participantId: "",
    },
    agentEmail: "agent@example.com",
    agentPhone: "123456789",
    currency: {
      isBefore: false,
      symbol: "€",
      code: "EUR",
    },
    registration: null,
    isPrivate: false,
  };
  // This factory is in fact just a spread operator... But shh! 🤫
  return { ...baseAuction, ...auctionParams };
}

/**
 * Factory function to create an auction's bid, pass only the properties you want to override.
 */
export function factoryBid(bidParams: Partial<BidType> = {}): BidType {
  const baseBid: BidType = {
    id: "bid1",
    amount: 1000,
    createdAt: Date.now(),
    newEndDate: Date.now() + 10000,
    userAnonymousId: "user1",
    participantId: "participant1",
  };
  return { ...baseBid, ...bidParams };
}

/**
 * Factory function to create a user, pass only the properties you want to override.
 */
export function factoryUser(userParams: Partial<UserType> = {}): UserType {
  const baseUser: UserType = {
    id: "123",
    email: "user@example.com",
  };
  return { ...baseUser, ...userParams };
}

/**
 * Factory function to create a registration, pass only the properties you want to override.
 */
export function factoryRegistration(
  registrationParams: Partial<RegistrationType> = {}
): RegistrationType {
  const baseRegistration: RegistrationType = {
    isUserAllowed: true,
    isRegistrationAccepted: true,
    isParticipant: true,
  };
  return { ...baseRegistration, ...registrationParams };
}
