import { AuctionType } from './types/types';

function isAuctionNotStarted(auction: AuctionType): boolean {
    return Date.now() < auction.startDate * 1000;
}

function isAuctionInProgress(auction: AuctionType): boolean {
    return Date.now() < auction.endDate * 1000 && Date.now() > auction.startDate * 1000;
}

function isAuctionEnded(auction: AuctionType): boolean {
    return Date.now() > auction.endDate * 1000;
}
export { isAuctionNotStarted, isAuctionInProgress, isAuctionEnded };