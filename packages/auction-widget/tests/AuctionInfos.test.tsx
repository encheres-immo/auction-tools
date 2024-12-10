import { test, expect, describe, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import AuctionInfos from "../src/AuctionInfos.jsx";
import { UserType } from "@encheres-immo/widget-client/types";
import {
  factoryAuction,
  factoryBid,
  factoryRegistration,
  factoryUser,
} from "./test-utils.js";

const user: UserType = factoryUser();

afterEach(() => {
  cleanup();
});

describe("Countdown display", () => {
  test('displays "Démarre dans" when auction has not started', () => {
    const auction = factoryAuction({ startDate: Date.now() + 10000 });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Démarre dans/i)).toBeInTheDocument();
  });

  test('displays "Se termine dans" when auction is in progress', () => {
    const auction = factoryAuction({
      startDate: Date.now() - 10000,
      endDate: Date.now() + 10000,
    });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Se termine dans/i)).toBeInTheDocument();
  });

  test('displays "Vente terminée" when auction has ended', () => {
    const auction = factoryAuction({
      startDate: Date.now() - 20000,
      endDate: Date.now() - 10000,
    });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Vente terminée/i)).toBeInTheDocument();
  });
});

describe("Auction details display", () => {
  test("displays auction start date correctly", () => {
    const startDate = Date.now() + 100000;
    const auction = factoryAuction({ startDate });
    render(() => <AuctionInfos auction={auction} user={user} />);
    const formattedStartDate = new Date(startDate).toLocaleString();
    expect(screen.getByText(formattedStartDate)).toBeInTheDocument();
  });

  test("displays auction end date correctly", () => {
    const endDate = Date.now() + 200000;
    const auction = factoryAuction({ endDate });
    render(() => <AuctionInfos auction={auction} user={user} />);
    const formattedEndDate = new Date(endDate).toLocaleString();
    expect(screen.getByText(formattedEndDate)).toBeInTheDocument();
  });

  test("displays starting price correctly", () => {
    const startingPrice = 1500;
    const auction = factoryAuction({ startingPrice: startingPrice });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Prix de départ/i)).toBeInTheDocument();
    expect(screen.getByText(`${startingPrice} €`)).toBeInTheDocument();
  });

  test("displays step price correctly", () => {
    const step = 200;
    const auction = factoryAuction({ step: step });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Palier/i)).toBeInTheDocument();
    expect(screen.getByText(`${step} €`)).toBeInTheDocument();
  });

  test("displays highest bid when available and the auction is public", () => {
    const highestBid = factoryBid();
    const auction = factoryAuction({ highestBid: highestBid });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Meilleure offre/i)).toBeInTheDocument();
    expect(screen.getByText(`${highestBid.amount} €`)).toBeInTheDocument();
  });

  test("does not display highest bid for non-participants in private auction", () => {
    const highestBid = factoryBid();
    const privateAuction = factoryAuction({
      highestBid: highestBid,
      isPrivate: true,
    });
    render(() => <AuctionInfos auction={privateAuction} user={user} />);
    expect(screen.queryByText(/Meilleure offre/i)).toBeNull();
    expect(screen.queryByText(`${highestBid.amount} €`)).toBeNull();
  });

  test("displays highest bid for participants in private auction", () => {
    const highestBid = factoryBid();
    const userRegistration = factoryRegistration();
    const privateAuction = factoryAuction({
      highestBid: highestBid,
      isPrivate: true,
      registration: userRegistration,
    });
    const participantUser = factoryUser();
    render(() => (
      <AuctionInfos auction={privateAuction} user={participantUser} />
    ));
    expect(screen.getByText(/Meilleure offre/i)).toBeInTheDocument();
    expect(screen.getByText(`${highestBid.amount} €`)).toBeInTheDocument();
  });
});
