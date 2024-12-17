import { AuctionType, CurrencyType } from "@encheres-immo/widget-client/types";

function isAuctionNotStarted(auction: AuctionType): boolean {
  let now: number = new Date().setMilliseconds(0);
  const startDate: number = new Date(auction.startDate).setMilliseconds(0);
  return now < startDate;
}

function isAuctionInProgress(auction: AuctionType): boolean {
  let now: number = new Date().setMilliseconds(0);
  const endDate: number = new Date(auction.endDate).setMilliseconds(0);
  const startDate: number = new Date(auction.startDate).setMilliseconds(0);
  return now <= endDate && now >= startDate;
}

function isAuctionEnded(auction: AuctionType): boolean {
  let now: number = new Date().setMilliseconds(0);
  const endDate: number = new Date(auction.endDate).setMilliseconds(0);
  return now > endDate;
}

/**
 * Display amount with currency symbol or code.
 * if currency is not provided, default to €
 * if amount not provided or 0, display --.
 */
function displayAmountWithCurrency(
  amount: number | null,
  currency?: CurrencyType
): string {
  const amountStr = amount == null ? "--" : amount.toString();
  if (currency) {
    if (currency.isBefore) {
      return `${displayCurrencySymbol(currency)} ${amountStr}`;
    } else {
      return `${amountStr} ${displayCurrencySymbol(currency)}`;
    }
  } else {
    return `${amountStr} €`;
  }
}

function displayCurrencySymbol(currency: CurrencyType): string {
  return currency.symbol || currency.code || "";
}

function parseDate(dateInput: number): Date {
  return new Date(dateInput);
}
function formatDate(date: number): string {
  return parseDate(date).toLocaleString();
}

/**
 * Parse a string to check if it is a valid URL
 */
function isValidUrl(url: string): boolean {
    try { 
      return Boolean(new URL(url)); 
    }
    catch(e){ 
      return false;
    }
}

export {
  isAuctionNotStarted,
  isAuctionInProgress,
  isAuctionEnded,
  displayAmountWithCurrency,
  displayCurrencySymbol,
  parseDate,
  formatDate,
  isValidUrl,
};
