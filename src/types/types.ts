export type AuctionType = {
    id: string;
    startDate: string;
    endDate: string;
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
    newEndDate: string;
    userAnonymousId: string;
}