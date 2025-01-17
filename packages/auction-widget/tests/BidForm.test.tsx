import {
  test,
  expect,
  describe,
  beforeEach,
  vi,
  afterEach,
  Mock,
} from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import client from "@encheres-immo/widget-client";
import {
  AuctionType,
  BidType,
  RegistrationType,
} from "@encheres-immo/widget-client/types";
import {
  factoryAuction,
  factoryBid,
  factoryRegistration,
} from "./test-utils.js";
import BidForm from "../src/BidForm.jsx";

// Mock the widget-client module
vi.mock("@encheres-immo/widget-client", () => {
  return {
    default: {
      placeBidOnAuction: vi.fn(),
    },
  };
});

describe("Not displaying bid form when", () => {
  afterEach(() => {
    cleanup();
  });

  test("auction has not started", () => {
    const auction = factoryAuction({ startDate: Date.now() + 1000 });
    render(() => <BidForm auction={auction} isLogged={() => true} />);
    expect(screen.queryByTestId("auction-widget-bid")).toBeNull();
  });

  test("auction has ended", () => {
    const auction = factoryAuction({ endDate: Date.now() - 1000 });
    render(() => <BidForm auction={auction} isLogged={() => true} />);
    expect(screen.queryByTestId("auction-widget-bid")).toBeNull();
  });

  test("user is not logged in", () => {
    const auction = factoryAuction({ startDate: Date.now() - 1000 });
    render(() => <BidForm auction={auction} isLogged={() => false} />);
    expect(screen.queryByTestId("auction-widget-bid")).toBeNull();
  });

  test("user is not accepted", () => {
    const registration = factoryRegistration({ isRegistrationAccepted: false });
    const auction = factoryAuction({
      startDate: Date.now() - 1000,
      registration: registration,
    });
    render(() => <BidForm auction={auction} isLogged={() => true} />);
    expect(screen.queryByTestId("auction-widget-bid")).toBeNull();
  });
});

describe("Fast bid buttons", () => {
  let auction: AuctionType;
  let registration: RegistrationType;

  beforeEach(() => {
    registration = factoryRegistration();
    auction = factoryAuction({
      registration: registration,
      startDate: Date.now() - 1000,
    });
  });

  afterEach(() => {
    cleanup();
  });

  test("displays correct amounts when auction has no bids", () => {
    // Create an auction with no bids and no highest bid
    const auctionWithoutBids = factoryAuction({
      startingPrice: 1000,
      step: 100,
      bids: [],
      highestBid: undefined,
      registration: registration,
      startDate: Date.now() - 1000,
    });

    render(() => (
      <BidForm auction={auctionWithoutBids} isLogged={() => true} />
    ));

    // Check that the fast bid buttons are displayed with correct amounts
    const fastBidButtons = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    });

    expect(fastBidButtons.length).toBe(3);

    // For the first offer, amounts are calculated as (stepMultiplier - 1) * auction.step
    const displayedAmounts = [
      0, // (1 - 1) * 100 = 0€
      100, // (2 - 1) * 100 = 100€
      200, // (3 - 1) * 100 = 200€
    ];

    fastBidButtons.forEach((button, index) => {
      const expectedDisplayedAmount = displayedAmounts[index];
      expect(button.textContent).toContain(`+ ${expectedDisplayedAmount} €`);
    });
  });

  test("displays correct amounts when auction has existing bids", () => {
    const highestBid: BidType = factoryBid();

    const auctionWithBids = factoryAuction({
      bids: [highestBid],
      highestBid: highestBid,
      registration: registration,
      startDate: Date.now() - 1000,
    });

    render(() => <BidForm auction={auctionWithBids} isLogged={() => true} />);

    // Check that the fast bid buttons are displayed with correct amounts
    const fastBidButtons = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    });

    expect(fastBidButtons.length).toBe(3);

    // With previous bids, amounts are calculated as stepMultiplier * auction.step
    const displayedAmounts = [
      100, // 1 * 100 = 100€
      200, // 2 * 100 = 200€
      300, // 3 * 100 = 300€
    ];

    fastBidButtons.forEach((button, index) => {
      const expectedDisplayedAmount = displayedAmounts[index];
      expect(button.textContent).toContain(`+ ${expectedDisplayedAmount} €`);
    });
  });

  test("clicking opens confirm bid modal", async () => {
    render(() => <BidForm auction={auction} isLogged={() => true} />);
    const fastBidButton = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    })[0];
    fireEvent.click(fastBidButton);
    // Confirm modal should be visible
    expect(
      screen.getByText(/Vous êtes sur le point d'enchérir/i)
    ).toBeInTheDocument();
  });

  test("open the bid modal with correct amounts when auction has no bids", async () => {
    // Create an auction with no bids and no highest bid
    const auctionWithoutBids = factoryAuction({
      startingPrice: 1000,
      step: 100,
      bids: [],
      highestBid: undefined,
      registration: registration,
      startDate: Date.now() - 1000,
    });

    render(() => (
      <BidForm auction={auctionWithoutBids} isLogged={() => true} />
    ));

    // For the first offer, you can bid the starting price
    const Amounts = [1000, 1100, 1200];

    const fastBidButtons = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    });

    fastBidButtons.forEach((button, index) => {
      fireEvent.click(button);
      expect(screen.getByText(`${Amounts[index]} €`)).toBeInTheDocument();
    });
  });

  test("open the bid modal with correct amounts when auction has existing bids", async () => {
    const highestBid: BidType = factoryBid();

    const auctionWithBids = factoryAuction({
      bids: [highestBid],
      highestBid: highestBid,
      registration: registration,
      startDate: Date.now() - 1000,
    });

    render(() => <BidForm auction={auctionWithBids} isLogged={() => true} />);

    // With previous bids, amounts are calculated as stepMultiplier * auction.step
    const Amounts = [1100, 1200, 1300];

    const fastBidButtons = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    });

    fastBidButtons.forEach((button, index) => {
      fireEvent.click(button);
      expect(screen.getByText(`${Amounts[index]} €`)).toBeInTheDocument();
    });
  });

  describe("Custom bid input", () => {
    let auction: AuctionType;
    let registration: RegistrationType;

    beforeEach(() => {
      registration = factoryRegistration();
      auction = factoryAuction({
        registration: registration,
        startDate: Date.now() - 1000,
      });
    });

    afterEach(() => {
      cleanup();
    });

    test("filling and clicking opens confirm bid modal", async () => {
      render(() => <BidForm auction={auction} isLogged={() => true} />);
      const amountInput = screen.getByRole("spinbutton");
      const bidButton = screen.getByText(/Enchérir/i);
      fireEvent.input(amountInput, { target: { value: "2000" } });
      fireEvent.click(bidButton);
      // Confirm modal should be visible
      expect(
        screen.getByText(/Vous êtes sur le point d'enchérir/i)
      ).toBeInTheDocument();
    });
  });
});

describe("Modal confirm bid", () => {
  let auction: AuctionType;
  let registration: RegistrationType;

  beforeEach(() => {
    registration = factoryRegistration();
    auction = factoryAuction({
      registration: registration,
      startDate: Date.now() - 1000,
    });
    (client.placeBidOnAuction as Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("not displayed when the input is empty", async () => {
    render(() => <BidForm auction={auction} isLogged={() => true} />);
    const amountInput = screen.getByRole("spinbutton");
    const bidButton = screen.getByText(/Enchérir/i);
    fireEvent.input(amountInput, { target: { value: "" } });
    fireEvent.click(bidButton);
    // Confirm modal should not be visible
    expect(screen.queryByText(/Vous êtes sur le point d'enchérir/i)).toBeNull();
  });

  test("not displayed when the input is invalid", async () => {
    render(() => <BidForm auction={auction} isLogged={() => true} />);
    const amountInput = screen.getByRole("spinbutton");
    const bidButton = screen.getByText(/Enchérir/i);
    fireEvent.input(amountInput, { target: { value: "NaN" } });
    fireEvent.click(bidButton);
    // Confirm modal should not be visible
    expect(screen.queryByText(/Vous êtes sur le point d'enchérir/i)).toBeNull();
  });

  test("places bid when confirm button is clicked", async () => {
    // Set up the mock to resolve to a bid
    (client.placeBidOnAuction as Mock).mockResolvedValue(factoryBid());
    render(() => <BidForm auction={auction} isLogged={() => true} />);
    const fastBidButton = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    })[0];
    fireEvent.click(fastBidButton);

    const confirmButton = screen.getByText(/Confirmer/i);
    fireEvent.click(confirmButton);

    // Wait for the mock function to be called
    await expect(client.placeBidOnAuction).toHaveBeenCalled();
  });

  test("displays an error when bid amount is too low", async () => {
    const error = { code: "bid_amount_too_low", min: 1500 };
    (client.placeBidOnAuction as Mock).mockRejectedValue(error);
    render(() => <BidForm auction={auction} isLogged={() => true} />);
    const fastBidButton = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    })[0];
    fireEvent.click(fastBidButton);

    const confirmButton = screen.getByText(/Confirmer/i);
    fireEvent.click(confirmButton);

    // Wait for the error message to be displayed
    expect(
      await screen.findByText(/Vous devez au moins enchérir/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/1500 €/)).toBeInTheDocument();
  });

  test("displays a warning when bid amount is too high", async () => {
    // Trigger when the bid amount is more than 3 steps above the highest bid
    // Warning message should be "Votre offre est sensiblement supérieure à l'offre précédente. Êtes-vous sûr de vouloir continuer ?"
    render(() => <BidForm auction={auction} isLogged={() => true} />);
    const amountInput = screen.getByRole("spinbutton");
    const bidButton = screen.getByText(/Enchérir/i);
    fireEvent.input(amountInput, {
      target: { value: auction.highestBid!.amount + auction.step * 4 },
    });
    fireEvent.click(bidButton);
    // Confirm modal should be visible
    expect(
      screen.getByText(/Vous êtes sur le point d'enchérir/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Votre offre est sensiblement supérieure à l'offre précédente/i
      )
    ).toBeInTheDocument();
  });

  test("emits event when bid is placed successfully", async () => {
    // Setup listener for custom event
    const eventHandler = vi.fn();

    // Mock successful bid
    const newBid = factoryBid();
    (client.placeBidOnAuction as Mock).mockResolvedValue(newBid);

    // Render component
    render(() => (
      <div id="auction-widget">
        <BidForm auction={auction} isLogged={() => true} />
      </div>
    ));

    document
      .getElementById("auction-widget")!
      .addEventListener("auction-widget:bid_placed", eventHandler);

    // Trigger bid flow
    const fastBidButton = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    })[0];
    fireEvent.click(fastBidButton);

    const confirmButton = screen.getByText(/Confirmer/i);
    fireEvent.click(confirmButton);

    // Wait for async operations
    await vi.waitFor(() => {
      expect(eventHandler).toHaveBeenCalledTimes(1);
    });

    // Verify the event was emitted with correct payload
    const emittedEvent = eventHandler.mock.calls[0][0];
    expect(emittedEvent.type).toBe("auction-widget:bid_placed");
    expect(emittedEvent.detail).toEqual({
      amount: newBid.amount,
      date: newBid.createdAt,
    });
  });
});
