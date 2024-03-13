import { AuctionType, CurrencyType } from './types/types';

function isAuctionNotStarted(auction: AuctionType): boolean {
    return Date.now() < auction.startDate;
}

function isAuctionInProgress(auction: AuctionType): boolean {
    return Date.now() < auction.endDate && Date.now() > auction.startDate;
}

function isAuctionEnded(auction: AuctionType): boolean {
    return Date.now() > auction.endDate;
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
    return new Date(dateInput);
}
function formatDate(date: number): string {
    return parseDate(date).toLocaleString();
}

export { isAuctionNotStarted, isAuctionInProgress, isAuctionEnded, displayAmountWithCurrency, displayCurrencySymbol, parseDate, formatDate};