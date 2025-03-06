import { test, expect, describe, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@solidjs/testing-library";
import RegistrationStatus from "../src/RegistrationStatus.js";
import { AuctionType } from "@encheres-immo/widget-client/types";
import { factoryAuction, factoryRegistration } from "./test-utils.js";

describe("RegistrationStatus displays", () => {
  let auction: AuctionType;
  let isLogged: () => boolean;

  beforeEach(() => {
    isLogged = () => true;
  });

  afterEach(() => {
    cleanup();
  });

  test("when user is observer and auction is in progress", () => {
    const registration = factoryRegistration({
      isRegistrationAccepted: true,
      isParticipant: false,
    });
    auction = factoryAuction({
      registration: registration,
      status: "started",
      startDate: Date.now() - 1000,
      endDate: Date.now() + 10000,
    });

    render(() => <RegistrationStatus isLogged={isLogged} auction={auction} />);

    expect(
      screen.getByText(/Vous êtes observateur pour cette vente/i)
    ).toBeInTheDocument();
  });

  test("when user is observer and auction has not started", () => {
    const registration = factoryRegistration({
      isRegistrationAccepted: true,
      isParticipant: false,
    });
    auction = factoryAuction({
      registration: registration,
      status: "scheduled",
      startDate: Date.now() + 10000,
      endDate: Date.now() + 20000,
    });

    render(() => <RegistrationStatus isLogged={isLogged} auction={auction} />);

    expect(
      screen.getByText(
        /Votre demande d'observation pour cette vente a été acceptée/i
      )
    ).toBeInTheDocument();
  });

  test("no message when user is participant and auction is in progress", () => {
    const registration = factoryRegistration({
      isRegistrationAccepted: true,
      isParticipant: true,
    });
    auction = factoryAuction({
      registration: registration,
      status: "started",
      startDate: Date.now() - 1000,
      endDate: Date.now() + 10000,
    });

    const { container } = render(() => (
      <RegistrationStatus isLogged={isLogged} auction={auction} />
    ));
    const notes = container.querySelectorAll(".auction-widget-note");
    expect(notes.length).toBe(0);
  });

  test("when user is participant and auction has not started", () => {
    const registration = factoryRegistration({
      isRegistrationAccepted: true,
      isParticipant: true,
    });
    auction = factoryAuction({
      registration: registration,
      status: "scheduled",
      startDate: Date.now() + 10000,
      endDate: Date.now() + 20000,
    });

    render(() => <RegistrationStatus isLogged={isLogged} auction={auction} />);

    expect(
      screen.getByText(
        /Votre demande de participation pour cette vente a été acceptée/i
      )
    ).toBeInTheDocument();
  });

  test("when user registration is refused", () => {
    const registration = factoryRegistration({
      isRegistrationAccepted: false,
    });
    auction = factoryAuction({
      registration: registration,
    });

    render(() => <RegistrationStatus isLogged={isLogged} auction={auction} />);

    expect(
      screen.getByText(
        /Votre demande de participation pour cette vente a été refusée/i
      )
    ).toBeInTheDocument();
  });

  test("when user registration is pending", () => {
    const registration = factoryRegistration({
      isRegistrationAccepted: null,
    });
    auction = factoryAuction({
      registration: registration,
    });

    render(() => <RegistrationStatus isLogged={isLogged} auction={auction} />);

    expect(
      screen.getByText(
        /Votre demande de participation a été transmise à l'agent responsable du bien/i
      )
    ).toBeInTheDocument();
  });
});

describe("Dynamic RegistrationStatus updates", () => {
  beforeEach(() => {
    // Mock Date.now to have consistent behavior
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2023, 0, 1, 12, 0, 0)); // Noon on January 1st, 2023
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  test("updates observer message when auction transitions from scheduled to started", async () => {
    // Create an auction scheduled to start in 5 seconds
    const startTime = Date.now() + 5000;
    const endTime = Date.now() + 60000;

    const registration = factoryRegistration({
      isRegistrationAccepted: true,
      isParticipant: false, // Observer
    });

    const auction = factoryAuction({
      status: "scheduled",
      startDate: startTime,
      endDate: endTime,
      registration: registration,
    });

    render(() => (
      <RegistrationStatus isLogged={() => true} auction={auction} />
    ));

    // Initially should show the "waiting for auction" observer message
    expect(
      screen.getByText(
        /Votre demande d'observation pour cette vente a été acceptée/i
      )
    ).toBeInTheDocument();

    // Advance time past the start date
    vi.advanceTimersByTime(10000); // 10 seconds

    // Message should change to the "auction in progress" observer message
    await waitFor(() => {
      expect(
        screen.getByText(/Vous êtes observateur pour cette vente/i)
      ).toBeInTheDocument();
    });
  });

  test("updates participant message when auction transitions from scheduled to started", async () => {
    // Create an auction scheduled to start in 5 seconds
    const startTime = Date.now() + 5000;
    const endTime = Date.now() + 60000;

    const registration = factoryRegistration({
      isRegistrationAccepted: true,
      isParticipant: true, // Participant
    });

    const auction = factoryAuction({
      status: "scheduled",
      startDate: startTime,
      endDate: endTime,
      registration: registration,
    });

    const { container } = render(() => (
      <RegistrationStatus isLogged={() => true} auction={auction} />
    ));

    // Initially should show the "waiting for auction" participant message
    expect(
      screen.getByText(
        /Votre demande de participation pour cette vente a été acceptée/i
      )
    ).toBeInTheDocument();

    // Advance time past the start date
    vi.advanceTimersByTime(10000); // 10 seconds

    // For participants, no message should be shown once the auction has started
    await waitFor(() => {
      const notes = container.querySelectorAll(".auction-widget-note");
      expect(notes.length).toBe(0);
    });
  });

  test("handles complete auction lifecycle for observer", async () => {
    // Create an auction scheduled to start in 5 seconds and end in 15 seconds
    const startTime = Date.now() + 5000; // Starts in 5 seconds
    const endTime = Date.now() + 15000; // Ends in 15 seconds

    const registration = factoryRegistration({
      isRegistrationAccepted: true,
      isParticipant: false, // Observer
    });

    const auction = factoryAuction({
      status: "scheduled",
      startDate: startTime,
      endDate: endTime,
      registration: registration,
    });

    const { container } = render(() => (
      <RegistrationStatus isLogged={() => true} auction={auction} />
    ));

    // Initially should show the waiting message for observers
    expect(
      screen.getByText(
        /Votre demande d'observation pour cette vente a été acceptée/i
      )
    ).toBeInTheDocument();

    // Advance time to just after start
    vi.advanceTimersByTime(7000); // 7 seconds

    // Should show in-progress message for observers
    await waitFor(() => {
      expect(
        screen.getByText(/Vous êtes observateur pour cette vente/i)
      ).toBeInTheDocument();
    });

    // Advance time to after end
    vi.advanceTimersByTime(10000); // Another 10 seconds (total 17 seconds)

    // For auction that has ended, no message should be shown
    await waitFor(() => {
      const notes = container.querySelectorAll(".auction-widget-note");
      expect(notes.length).toBe(0);
    });
  });
});
