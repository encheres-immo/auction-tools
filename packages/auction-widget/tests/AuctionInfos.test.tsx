import { test, expect, describe, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@solidjs/testing-library";
import AuctionInfos from "../src/AuctionInfos.jsx";
import { UserType } from "@encheres-immo/widget-client/types";
import {
  factoryAuction,
  factoryBid,
  factoryRegistration,
  factoryUser,
} from "./test-utils.js";
import { createSignal } from "solid-js";
import { vi } from "vitest";

const user: UserType = factoryUser();

afterEach(() => {
  cleanup();
});

describe("Countdown display", () => {
  test('displays "Démarre dans" when auction has not started', () => {
    const auction = factoryAuction({
      status: "scheduled",
      startDate: Date.now() + 10000,
    });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Démarre dans/i)).toBeInTheDocument();
  });

  test('displays "Se termine dans" when auction is in progress', () => {
    const auction = factoryAuction({
      status: "started",
      startDate: Date.now() - 10000,
      endDate: Date.now() + 10000,
    });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Se termine dans/i)).toBeInTheDocument();
  });

  test('displays "Vente terminée" when auction has ended', () => {
    const auction = factoryAuction({
      status: "completed",
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
    const auction = factoryAuction({
      startDate,
    });
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

describe("Dynamic auction status updates", () => {
  beforeEach(() => {
    // Mock Date.now to have consistent behavior
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2023, 0, 1, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  test("updates display when auction changes from scheduled to started", async () => {
    // Create an auction scheduled to start in 5 seconds
    const startTime = Date.now() + 5000;
    const endTime = Date.now() + 60000;

    const auction = factoryAuction({
      status: "scheduled",
      startDate: startTime,
      endDate: endTime,
    });

    // Render the component
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Démarre dans/i)).toBeInTheDocument();

    // Advance time past the start date
    vi.advanceTimersByTime(10000); // 10 seconds

    // Component should now show that auction is in progress
    await waitFor(() => {
      expect(screen.getByText(/Se termine dans/i)).toBeInTheDocument();
    });
  });

  test("updates display when auction changes from started to completed", async () => {
    // Create an auction that will end in 5 seconds
    const startTime = Date.now() - 10000; // Started 10 seconds ago
    const endTime = Date.now() + 5000; // Ends in 5 seconds

    const auction = factoryAuction({
      status: "started",
      startDate: startTime,
      endDate: endTime,
    });

    // Render with initial state
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Se termine dans/i)).toBeInTheDocument();

    // Advance time past the end date
    vi.advanceTimersByTime(10000); // 10 seconds

    // Component should now show auction has ended
    await waitFor(() => {
      expect(screen.getByText(/Vente terminée/i)).toBeInTheDocument();
    });
  });

  test("updates remaining time based on clock changes", async () => {
    const startDate = Date.now() - 10000;
    const endDate = Date.now() + 60000; // 1 minute in the future

    const auction = factoryAuction({
      status: "started",
      startDate,
      endDate,
    });

    render(() => <AuctionInfos auction={auction} user={user} />);

    // Initial countdown should show around 1 minute
    expect(screen.getByText(/Se termine dans/i)).toBeInTheDocument();
    expect(screen.getByText(/0j 0h 1m/i)).toBeInTheDocument();

    // Advance time by 30 seconds
    vi.advanceTimersByTime(30000);

    // Countdown should update to around 30 seconds
    await waitFor(() => {
      expect(screen.getByText(/0j 0h 0m 30s/i)).toBeInTheDocument();
    });

    // Advance time past the end date
    vi.advanceTimersByTime(31000);

    // Component should now show auction as ended
    await waitFor(() => {
      const countdown = screen.queryByText(/0j 0h 0m/i);
      expect(countdown).toBeNull();
    });
  });

  test("updates highest bid display when auction is updated", async () => {
    // Create a reactive auction
    const initialBid = factoryBid({ amount: 1000 });
    const [auction, setAuction] = createSignal(
      factoryAuction({
        status: "started",
        startDate: Date.now() - 10000,
        highestBid: initialBid,
      })
    );

    render(() => <AuctionInfos auction={auction()} user={user} />);

    // Initial highest bid should be shown
    expect(screen.getByText("1000 €")).toBeInTheDocument();

    // Update the auction with a new highest bid
    const newBid = factoryBid({ amount: 1500 });
    setAuction((prev) => ({
      ...prev,
      highestBid: newBid,
    }));

    // Component should update to show the new highest bid
    await waitFor(() => {
      expect(screen.getByText("1500 €")).toBeInTheDocument();
    });
  });
});

describe("Digressive auction display", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2023, 0, 1, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  test('displays "Prochain palier" for digressive auction in progress', () => {
    const auction = factoryAuction({
      type: "digressive",
      status: "started",
      startDate: Date.now() - 10000,
      endDate: Date.now() + 100000,
      stepIntervalSeconds: 60,
    });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Prochain palier/i)).toBeInTheDocument();
  });

  test('displays "Se termine dans" for progressive auction in progress', () => {
    const auction = factoryAuction({
      type: "progressive",
      status: "started",
      startDate: Date.now() - 10000,
      endDate: Date.now() + 100000,
    });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Se termine dans/i)).toBeInTheDocument();
  });

  test('displays "Inconnue" for end date in digressive auction', () => {
    const auction = factoryAuction({
      type: "digressive",
      status: "started",
      startDate: Date.now() - 10000,
      endDate: Date.now() + 100000,
      stepIntervalSeconds: 60,
    });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Inconnue/i)).toBeInTheDocument();
  });

  test("displays actual end date for progressive auction", () => {
    const endDate = Date.now() + 100000;
    const auction = factoryAuction({
      type: "progressive",
      status: "started",
      startDate: Date.now() - 10000,
      endDate,
    });
    render(() => <AuctionInfos auction={auction} user={user} />);
    const formattedEndDate = new Date(endDate).toLocaleString();
    expect(screen.getByText(formattedEndDate)).toBeInTheDocument();
  });

  test('displays "Prix actuel" label for digressive auction in progress', () => {
    const auction = factoryAuction({
      type: "digressive",
      status: "started",
      startDate: Date.now() - 10000,
      endDate: Date.now() + 100000,
      startingPrice: 500000,
      step: 5000,
      stepIntervalSeconds: 60,
    });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Prix actuel/i)).toBeInTheDocument();
  });

  test('displays "Meilleure offre" label for progressive auction', () => {
    const auction = factoryAuction({
      type: "progressive",
      status: "started",
      startDate: Date.now() - 10000,
      endDate: Date.now() + 100000,
    });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Meilleure offre/i)).toBeInTheDocument();
  });

  test('displays "Meilleure offre" label for ended digressive auction (bluff behavior)', () => {
    const auction = factoryAuction({
      type: "digressive",
      status: "completed",
      startDate: Date.now() - 100000,
      endDate: Date.now() - 10000,
      stepIntervalSeconds: 60,
    });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/Meilleure offre/i)).toBeInTheDocument();
  });

  test("displays finalPrice for ended digressive auction when available", () => {
    const auction = factoryAuction({
      type: "digressive",
      status: "completed",
      startDate: Date.now() - 100000,
      endDate: Date.now() - 10000,
      startingPrice: 500000,
      stepIntervalSeconds: 60,
      finalPrice: 450000,
    });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/450\s?000\s?€/)).toBeInTheDocument();
  });

  test("displays finalPrice for ended progressive auction when available", () => {
    const auction = factoryAuction({
      type: "progressive",
      status: "completed",
      startDate: Date.now() - 100000,
      endDate: Date.now() - 10000,
      startingPrice: 100000,
      finalPrice: 150000,
    });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/150\s?000\s?€/)).toBeInTheDocument();
  });

  test("falls back to highestBid when finalPrice is not available", () => {
    const auction = factoryAuction({
      type: "progressive",
      status: "completed",
      startDate: Date.now() - 100000,
      endDate: Date.now() - 10000,
      highestBid: {
        id: "bid-1",
        amount: 120000,
        createdAt: Date.now() - 50000,
        newEndDate: 0,
        userAnonymousId: "user-1",
        participantId: "participant-1",
      },
    });
    render(() => <AuctionInfos auction={auction} user={user} />);
    expect(screen.getByText(/120\s?000\s?€/)).toBeInTheDocument();
  });
});
