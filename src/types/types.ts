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
}

export type BidType = {
    id: string;
    amount: number;
    createdAt: string;
    newEndDate: number;
    userAnonymousId: string;
}