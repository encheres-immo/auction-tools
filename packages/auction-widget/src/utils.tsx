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

function displayAmountWithCurrency(
  amount: number,
  currency?: CurrencyType
): string {
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
  return currency.symbol || currency.code || "";
}

function parseDate(dateInput: number): Date {
  return new Date(dateInput);
}
function formatDate(date: number): string {
  return parseDate(date).toLocaleString();
}

export {
  isAuctionNotStarted,
  isAuctionInProgress,
  isAuctionEnded,
  displayAmountWithCurrency,
  displayCurrencySymbol,
  parseDate,
  formatDate,
};
