import { test, expect, describe, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import BidHistory from "../src/BidHistory.jsx";
import { AuctionType, UserType } from "@encheres-immo/widget-client/types";
import { factoryAuction, factoryBid, factoryUser } from "./test-utils.js";

describe("Bids history", () => {
  let auction: AuctionType;
  let user: UserType;

  beforeEach(() => {
    user = factoryUser();
    auction = factoryAuction();
  });

  afterEach(() => {
    cleanup();
  });

  test("renders bid history with bids in order", () => {
    const bid1 = factoryBid({
      amount: 1000,
      createdAt: Date.now() - 10000,
    });
    const bid2 = factoryBid({
      amount: 1500,
      createdAt: Date.now(),
    });
    const bid3 = factoryBid({
      amount: 1200,
      createdAt: Date.now() - 5000,
    });

    const bids = [bid1, bid2, bid3];

    render(() => <BidHistory bids={bids} auction={auction} user={user} />);

    // Get all bid amounts displayed
    const bidAmountElements = screen.getAllByText(/[\d\s]+ €/i);
    const displayedAmounts = bidAmountElements.map((element) =>
      element.textContent?.trim()
    );

    // Expected amounts in descending order
    const expectedAmounts = ["1500 €", "1200 €", "1000 €"];

    expect(displayedAmounts).toEqual(expectedAmounts);
  });

  test("renders message when there are no bids", () => {
    render(() => <BidHistory bids={[]} auction={auction} user={user} />);

    // Check that the bid history section is rendered but empty
    expect(screen.getByText(/Historique des offres/i)).toBeInTheDocument();
    const bidItems = screen.queryAllByRole("listitem");
    expect(bidItems.length).toBe(0);
  });
});

describe("Bid component in bids history", () => {
  let auction: AuctionType;
  let user: UserType;

  beforeEach(() => {
    user = factoryUser();
    auction = factoryAuction();
  });

  afterEach(() => {
    cleanup();
  });

  test("displays 'Vous' when the bid is from the current user", () => {
    // Create a bid from the current user
    const userBid = factoryBid({
      participantId: user.id,
      userAnonymousId: "AnonUser",
    });

    const bids = [userBid];

    render(() => <BidHistory bids={bids} auction={auction} user={user} />);

    // Check that "Vous" is displayed
    expect(screen.getByText(/Vous/i)).toBeInTheDocument();
    expect(screen.getByText(/avez enchéri/i)).toBeInTheDocument();
  });

  test("displays anonymous user ID when the bid is from another user", () => {
    // Create a bid from another user
    const otherBid = factoryBid({
      participantId: "otherUser",
      userAnonymousId: "AnonOther",
    });

    const bids = [otherBid];

    render(() => <BidHistory bids={bids} auction={auction} user={user} />);

    // Check that the anonymous user ID is displayed
    expect(screen.getByText(/AnonOther/i)).toBeInTheDocument();
    expect(screen.getByText(/a enchéri/i)).toBeInTheDocument();
  });

  test("displays bid date in the correct format", () => {
    const bidDate = new Date("2023-01-01T12:00:00Z");
    const bid = factoryBid({ createdAt: bidDate.getTime() });

    const bids = [bid];

    render(() => <BidHistory bids={bids} auction={auction} user={user} />);

    // Format the date as displayed by the component
    const formattedDate = bidDate.toLocaleString();

    expect(
      screen.getByText(new RegExp(`Le ${formattedDate}`))
    ).toBeInTheDocument();
  });
});
