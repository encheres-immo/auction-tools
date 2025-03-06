import {
  test,
  expect,
  describe,
  beforeEach,
  vi,
  afterEach,
  Mock,
} from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@solidjs/testing-library";
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
import { createSignal } from "solid-js";

// Mock the widget-client module
vi.mock("@encheres-immo/widget-client", () => {
  return {
    default: {
      placeBidOnAuction: vi.fn(),
    },
  };
});

describe("Not displaying bid form", () => {
  afterEach(() => {
    cleanup();
  });

  test("when auction has not started", () => {
    const auction = factoryAuction({
      status: "scheduled",
      startDate: Date.now() + 1000,
    });
    render(() => <BidForm auction={auction} isLogged={() => true} />);
    expect(screen.queryByTestId("auction-widget-bid")).toBeNull();
  });

  test("when auction has ended", () => {
    const auction = factoryAuction({
      status: "completed",
      endDate: Date.now() - 1000,
    });
    render(() => <BidForm auction={auction} isLogged={() => true} />);
    expect(screen.queryByTestId("auction-widget-bid")).toBeNull();
  });

  test("when user is not logged in", () => {
    const auction = factoryAuction({
      status: "started",
      startDate: Date.now() - 1000,
    });
    render(() => <BidForm auction={auction} isLogged={() => false} />);
    expect(screen.queryByTestId("auction-widget-bid")).toBeNull();
  });

  test("when user is not accepted", () => {
    const registration = factoryRegistration({ isRegistrationAccepted: false });
    const auction = factoryAuction({
      status: "started",
      startDate: Date.now() - 1000,
      registration: registration,
    });
    render(() => <BidForm auction={auction} isLogged={() => true} />);
    expect(screen.queryByTestId("auction-widget-bid")).toBeNull();
  });

  test("dynamically based on auction state", async () => {
    // Create a reactive auction signal with initial state "scheduled"
    const [auction, setAuction] = createSignal(
      factoryAuction({
        status: "scheduled",
        startDate: Date.now() + 1000,
        endDate: Date.now() + 2000,
        registration: factoryRegistration(),
      })
    );

    // Render with initial state - auction hasn't started yet
    render(() => <BidForm auction={auction()} isLogged={() => true} />);
    expect(screen.queryByTestId("auction-widget-bid")).toBeNull();

    // Update auction to make it active using status
    setAuction((prev) => ({
      ...prev,
      status: "started",
      startDate: Date.now() - 1000,
    }));

    // Component should react to the status change
    await waitFor(() => {
      expect(screen.queryByTestId("auction-widget-bid")).not.toBeNull();
    });

    // Test that the component also reacts when auction ends
    setAuction((prev) => ({
      ...prev,
      status: "completed",
      endDate: Date.now() - 1000,
    }));

    // Component should hide the bid form again
    await waitFor(() => {
      expect(screen.queryByTestId("auction-widget-bid")).toBeNull();
    });
  });
});

describe("Fast bid buttons", () => {
  let auction: AuctionType;
  let registration: RegistrationType;

  beforeEach(() => {
    registration = factoryRegistration();
    auction = factoryAuction({
      registration: registration,
      status: "started",
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
      status: "started",
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
      status: "started",
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
      status: "started",
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
      status: "started",
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

  test("updates default amount input after a successful bid submission", async () => {
    // Create a reactive auction so we can later update it with a new highest bid.
    const initialAuction = factoryAuction({
      startingPrice: 1000,
      step: 100,
      registration: factoryRegistration(),
      status: "started",
      startDate: Date.now() - 1000,
    });
    const [auction, setAuction] = createSignal(initialAuction);

    // Mock a new bid from the server.
    const newBid = factoryBid({ amount: 1100 });
    (client.placeBidOnAuction as Mock).mockResolvedValue(newBid);

    // Render the component with the reactive auction.
    render(() => <BidForm auction={auction()} isLogged={() => true} />);

    // Click on one of the fast bid buttons.
    const fastBidButtons = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    });
    fireEvent.click(fastBidButtons[0]);

    // Click confirm in the modal.
    const confirmButton = screen.getByText(/Confirmer/i);
    fireEvent.click(confirmButton);

    // Wait for the bid submission to resolve.
    await waitFor(() => {
      expect(client.placeBidOnAuction).toHaveBeenCalled();
    });

    // Simulate that the auction has been updated with the new highest bid.
    setAuction((prev) => ({ ...prev, highestBid: newBid }));

    // The new default amount should now be newBid.amount plus the auction step.
    const updatedDefaultValue = newBid.amount + auction().step;

    // Get the bid input field and verify its value.
    const amountInput = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(Number(amountInput.value)).toBe(updatedDefaultValue);
  });

  test("updates labels after a successful bid submission", async () => {
    // Create a reactive auction so we can later update it with a new highest bid
    const initialAuction = factoryAuction({
      startingPrice: 1000,
      step: 100,
      registration: factoryRegistration(),
      status: "started",
      startDate: Date.now() - 1000,
    });
    const [auction, setAuction] = createSignal(initialAuction);

    const newBid = factoryBid({ amount: 1000 });
    (client.placeBidOnAuction as Mock).mockResolvedValue(newBid);

    render(() => <BidForm auction={auction()} isLogged={() => true} />);

    const fastBidButtons = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    });

    const initialDisplayedAmounts = [
      0, // (1 - 1) * 100 = 0€
      100, // (2 - 1) * 100 = 100€
      200, // (3 - 1) * 100 = 200€
    ];

    fastBidButtons.forEach((button, index) => {
      expect(button.textContent).toContain(
        `+ ${initialDisplayedAmounts[index]} €`
      );
    });

    fireEvent.click(fastBidButtons[0]);

    const confirmButton = screen.getByText(/Confirmer/i);
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(client.placeBidOnAuction).toHaveBeenCalled();
    });

    // Simulate that the auction has been updated with the new highest bid
    setAuction((prev) => ({ ...prev, bids: [newBid], highestBid: newBid }));

    const updatedDisplayedAmounts = [
      100, // 1 * 100 = 100€
      200, // 2 * 100 = 200€
      300, // 3 * 100 = 300€
    ];

    const updatedFastBidButtons = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    });

    updatedFastBidButtons.forEach((button, index) => {
      if (index < 3) {
        // Ensure we only check the fast bid buttons (not confirm/other buttons)
        expect(button.textContent).toContain(
          `+ ${updatedDisplayedAmounts[index]} €`
        );
      }
    });
  });

  describe("Custom bid input", () => {
    let auction: AuctionType;
    let registration: RegistrationType;

    beforeEach(() => {
      registration = factoryRegistration();
      auction = factoryAuction({
        registration: registration,
        status: "started",
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
      status: "started",
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

describe("Dynamic bid form updates", () => {
  beforeEach(() => {
    // Mock Date.now to have consistent behavior
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2023, 0, 1, 12, 0, 0)); // Noon on January 1st, 2023
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  test("shows bid form when auction time starts", async () => {
    // Create auction that will start in 5 seconds
    const startTime = Date.now() + 5000;
    const endTime = Date.now() + 60000;
    const registration = factoryRegistration();

    const auction = factoryAuction({
      status: "scheduled",
      startDate: startTime,
      endDate: endTime,
      registration: registration,
    });

    // Render component when auction hasn't started yet
    render(() => <BidForm auction={auction} isLogged={() => true} />);

    // Initially, the bid form should not be visible
    expect(screen.queryByTestId("auction-widget-bid")).toBeNull();

    // Advance time past the start date
    vi.advanceTimersByTime(10000); // 10 seconds

    // Status should have changed to "started", and bid form should appear
    await waitFor(() => {
      expect(screen.queryByTestId("auction-widget-bid")).not.toBeNull();
    });
  });

  test("hides bid form when auction time ends", async () => {
    // Create auction that will end in 5 seconds
    const startTime = Date.now() - 10000; // Started 10 seconds ago
    const endTime = Date.now() + 5000; // Ends in 5 seconds
    const registration = factoryRegistration();

    const auction = factoryAuction({
      status: "started",
      startDate: startTime,
      endDate: endTime,
      registration: registration,
    });

    // Render component when auction is in progress
    render(() => <BidForm auction={auction} isLogged={() => true} />);

    // Initially, the bid form should be visible
    expect(screen.queryByTestId("auction-widget-bid")).not.toBeNull();

    // Advance time past the end date
    vi.advanceTimersByTime(10000); // 10 seconds

    // Status should have changed to "completed", and bid form should disappear
    await waitFor(() => {
      expect(screen.queryByTestId("auction-widget-bid")).toBeNull();
    });
  });

  test("reacts to both start and end times", async () => {
    // Create auction that will start in 5 seconds and end in 15 seconds
    const startTime = Date.now() + 5000; // Starts in 5 seconds
    const endTime = Date.now() + 15000; // Ends in 15 seconds
    const registration = factoryRegistration();

    const auction = factoryAuction({
      status: "scheduled",
      startDate: startTime,
      endDate: endTime,
      registration: registration,
    });

    // Render component when auction hasn't started yet
    render(() => <BidForm auction={auction} isLogged={() => true} />);

    // Initially, the bid form should not be visible
    expect(screen.queryByTestId("auction-widget-bid")).toBeNull();

    // Advance time to just after start
    vi.advanceTimersByTime(7000); // 7 seconds

    // Bid form should appear when auction starts
    await waitFor(() => {
      expect(screen.queryByTestId("auction-widget-bid")).not.toBeNull();
    });

    // Advance time to after end
    vi.advanceTimersByTime(10000); // Another 10 seconds (total 17 seconds)

    // Bid form should disappear when auction ends
    await waitFor(() => {
      expect(screen.queryByTestId("auction-widget-bid")).toBeNull();
    });
  });
});
