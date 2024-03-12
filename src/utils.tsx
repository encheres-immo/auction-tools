import { AuctionType, CurrencyType } from './types/types';

function isAuctionNotStarted(auction: AuctionType): boolean {
    return Date.now() < auction.startDate * 1000;
}

function isAuctionInProgress(auction: AuctionType): boolean {
    return Date.now() < auction.endDate * 1000 && Date.now() > auction.startDate * 1000;
}

function isAuctionEnded(auction: AuctionType): boolean {
    return Date.now() > auction.endDate * 1000;
}

function displayAmountWithCurrency(amount: number, currency?: CurrencyType): string {
    if (currency) {
        if (currency.isBefore) {
            return `${displayCurrencySymbol(currency)} ${amount}`;
        } else {
            return `${amount} ${displayCurrencySymbol(currency)}`;
        }
    } else {
        return `${amount} €`;
    }
}
  
function displayCurrencySymbol(currency: CurrencyType): string {
    return currency.symbol || currency.code || '';
}

function parseDate(dateInput: number): Date {
    return new Date(dateInput * 1000);
}
function formatDate(date: number): string {
    return parseDate(date).toLocaleString();
}

export { isAuctionNotStarted, isAuctionInProgress, isAuctionEnded, displayAmountWithCurrency, displayCurrencySymbol, parseDate, formatDate};