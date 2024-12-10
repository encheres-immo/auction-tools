import { test, expect, describe, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
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
