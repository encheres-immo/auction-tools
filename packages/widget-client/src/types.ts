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
    isUserAllowed: boolean;
    isUserRegistered: boolean;
    isRegistrationAccepted: boolean | null;
    isParticipant: boolean;
}

export type BidType = {
    id: string;
    amount: number;
    createdAt: number;
    newEndDate: number;
    userAnonymousId: string;
    participantId: string;
}

export type CurrencyType = {
    isBefore: boolean;
    symbol: string;
    code: string;
}

export type UserType = {
    id: string;
}