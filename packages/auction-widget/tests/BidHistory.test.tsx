import { test, expect, describe, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import BidHistory from "../src/BidHistory.jsx";
import {
  AuctionType,
  UserType,
  BidType,
} from "@encheres-immo/widget-client/types";
import {
  factoryAuction,
  factoryBid,
  factoryRegistration,
  factoryUser,
} from "./test-utils.js";

describe("Bids history", () => {
  let auction: AuctionType;
  let user: UserType;

  beforeEach(() => {
    user = factoryUser();
    auction = factoryAuction({ startDate: Date.now() - 1000 });
  });

  afterEach(() => {
    cleanup();
  });

  test("displays bid history for public auction", () => {
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

  test("does not display bid history for non-participants in private auction", () => {
    const privateAuction = factoryAuction({
      isPrivate: true,
      startDate: Date.now() - 1000,
    });
    const bids = [factoryBid(), factoryBid()];
    render(() => (
      <BidHistory bids={bids} auction={privateAuction} user={user} />
    ));

    expect(screen.queryByText(/Historique des offres/i)).toBeNull();

    const bidAmountElements = screen.queryAllByText(/[\d\s]+ €/i);
    expect(bidAmountElements.length).toBe(0);
  });

  test("displays bid history for participants in private auction", () => {
    const privateAuction = factoryAuction({
      isPrivate: true,
      startDate: Date.now() - 1000,
      registration: factoryRegistration(),
    });
    const participantUser = factoryUser();
    const bids = [factoryBid(), factoryBid()];
    render(() => (
      <BidHistory bids={bids} auction={privateAuction} user={participantUser} />
    ));

    // Expect bid history header to be displayed
    expect(screen.getByText(/Historique des offres/i)).toBeInTheDocument();

    // Expect bids to be displayed
    const bidAmountElements = screen.getAllByText(/[\d\s]+ €/i);
    expect(bidAmountElements.length).toBeGreaterThan(0);
  });

  test("dynamic display of bid history", async () => {
    const [bids, setBids] = createSignal<BidType[]>([]);
    render(() => <BidHistory bids={bids()} auction={auction} user={user} />);

    // Vérifier que l'en-tête de l'historique n'est pas affiché initialement
    expect(screen.queryByText(/Historique des offres/i)).toBeNull();

    // Ajouter la première offre
    const newBid = factoryBid({ amount: 1000, createdAt: Date.now() });
    setBids([newBid]);

    // Attendre que l'affichage se mette à jour avec la première offre
    await waitFor(() => {
      expect(screen.getByText(/Historique des offres/i)).toBeInTheDocument();
      const bidAmountElements = screen.getAllByText(/[\d\s]+ €/i);
      expect(bidAmountElements.length).toBe(1);
      expect(bidAmountElements[0].textContent?.trim()).toEqual("1000 €");
    });
  });
});

describe("Bid component in bids history", () => {
  let auction: AuctionType;
  let user: UserType;

  beforeEach(() => {
    user = factoryUser();
    auction = factoryAuction({ startDate: Date.now() - 1000 });
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
