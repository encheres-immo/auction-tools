import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  vi,
  Mock,
} from "vitest";
import ParticipateBox from "../src/ParticipateBox.jsx";
import {
  factoryAuction,
  factoryRegistration,
  factoryUser,
} from "./test-utils.js";
import {
  AuctionType,
  RegistrationType,
  UserType,
} from "@encheres-immo/widget-client/types";

// Mock the client module
vi.mock("@encheres-immo/widget-client", () => {
  return {
    default: {
      authenticate: vi.fn(),
      me: vi.fn(),
      registerUserToAuction: vi.fn(),
    },
  };
});

import client from "@encheres-immo/widget-client";

describe("Participate Button", () => {
  let auction: AuctionType;
  let setIsLogged: Mock;
  let updateUser: Mock;
  let setAuction: Mock;

  beforeEach(() => {
    auction = factoryAuction();
    setIsLogged = vi.fn();
    updateUser = vi.fn();
    setAuction = vi.fn();
    (client.authenticate as Mock).mockReset();
    (client.me as Mock).mockReset();
    (client.registerUserToAuction as Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("is rendered correctly", () => {
    render(() => (
      <ParticipateBox
        setIsLogged={setIsLogged}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => false}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={false}
        tosUrl=""
      />
    ));
    expect(screen.getByText("Je veux participer")).toBeInTheDocument();
  });

  test("opens login modal when clicked and user is not logged in", () => {
    render(() => (
      <ParticipateBox
        setIsLogged={setIsLogged}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => false}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={false}
        tosUrl=""
      />
    ));
    fireEvent.click(screen.getByText("Je veux participer"));
    expect(screen.getByText("Vous devez être connecté")).toBeInTheDocument();
  });

  test("opens registration modal when user is logged in but not registered", () => {
    render(() => (
      <ParticipateBox
        setIsLogged={setIsLogged}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => true}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={true}
        tosUrl="https://example.com/tos"
      />
    ));
    fireEvent.click(screen.getByText("Je veux participer"));
    expect(screen.getByText("Demande de participation")).toBeInTheDocument();
  });

  test("is not rendered when user is logged in and registered", () => {
    const registration = factoryRegistration();
    auction = factoryAuction({ registration: registration });
    render(() => (
      <ParticipateBox
        setIsLogged={setIsLogged}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => true}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={true}
        tosUrl="https://example.com/tos"
      />
    ));
    expect(screen.queryByText("Je veux participer")).not.toBeInTheDocument();
  });
});

describe("Login Modal", () => {
  let auction: AuctionType;
  let setIsLogged: Mock;
  let updateUser: Mock;
  let setAuction: Mock;

  beforeEach(() => {
    auction = factoryAuction();
    setIsLogged = vi.fn();
    updateUser = vi.fn();
    setAuction = vi.fn();
    (client.authenticate as Mock).mockReset();
    (client.me as Mock).mockReset();
    (client.registerUserToAuction as Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("calls client.authenticate and client.me on connect", async () => {
    const user: UserType = factoryUser();
    (client.authenticate as Mock).mockResolvedValue(undefined);
    (client.me as Mock).mockResolvedValue(user);

    render(() => (
      <ParticipateBox
        setIsLogged={setIsLogged}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => false}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={false}
        tosUrl=""
      />
    ));

    fireEvent.click(screen.getByText("Je veux participer"));
    fireEvent.click(screen.getByText("Se connecter"));

    await expect(client.authenticate).toHaveBeenCalled();
    await expect(client.me).toHaveBeenCalled();
    expect(setIsLogged).toHaveBeenCalledWith(true);
    expect(updateUser).toHaveBeenCalledWith(user);
  });

  test("can be cancelled", () => {
    render(() => (
      <ParticipateBox
        setIsLogged={setIsLogged}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => false}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={false}
        tosUrl=""
      />
    ));

    fireEvent.click(screen.getByText("Je veux participer"));
    fireEvent.click(screen.getByText("Annuler"));

    expect(
      screen.queryByText("Vous devez être connecté")
    ).not.toBeInTheDocument();
  });
});

describe("Registration Modal", () => {
  let auction: AuctionType;
  let setIsLogged: Mock;
  let updateUser: Mock;
  let setAuction: Mock;

  beforeEach(() => {
    auction = factoryAuction();
    setIsLogged = vi.fn();
    updateUser = vi.fn();
    setAuction = vi.fn();
    (client.authenticate as Mock).mockReset();
    (client.me as Mock).mockReset();
    (client.registerUserToAuction as Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("registers user to auction when validated", async () => {
    const updatedAuction = factoryAuction({ id: "auction1" });
    (client.registerUserToAuction as Mock).mockResolvedValue(updatedAuction);

    render(() => (
      <ParticipateBox
        setIsLogged={setIsLogged}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => true}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={true}
        tosUrl="https://example.com/tos"
      />
    ));

    fireEvent.click(screen.getByText("Je veux participer"));
    fireEvent.click(screen.getByText("Valider"));

    await expect(client.registerUserToAuction).toHaveBeenCalledWith(auction.id);
    expect(setAuction).toHaveBeenCalledWith(updatedAuction);
  });

  test("displays default terms of service if no custom link is provided", () => {
    render(() => (
      <ParticipateBox
        setIsLogged={setIsLogged}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => true}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={true}
        tosUrl=""
      />
    ));

    fireEvent.click(screen.getByText("Je veux participer"));
    expect(screen.getByText("les conditions générales d'utilisation")).toHaveAttribute(
      "href",
      "https://encheres-immo.com/cgu"
    );
  });

  test("displays terms of service custom link if provided", () => {
    render(() => (
      <ParticipateBox
        setIsLogged={setIsLogged}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => true}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={true}
        tosUrl="https://example.com/tos"
      />
    ));

    fireEvent.click(screen.getByText("Je veux participer"));
    expect(screen.getByText("les conditions générales d'utilisation")).toHaveAttribute(
      "href",
      "https://example.com/tos"
    );
  });

  test("can be cancelled", () => {
    render(() => (
      <ParticipateBox
        setIsLogged={setIsLogged}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => true}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={true}
        tosUrl="https://example.com/tos"
      />
    ));

    fireEvent.click(screen.getByText("Je veux participer"));
    fireEvent.click(screen.getByText("Annuler"));

    expect(
      screen.queryByText("Demande de participation")
    ).not.toBeInTheDocument();
  });
});

describe("Contact Modal", () => {
  let auction: AuctionType;
  let setIsLogged: Mock;
  let updateUser: Mock;
  let setAuction: Mock;

  beforeEach(() => {
    auction = factoryAuction();
    setIsLogged = vi.fn();
    updateUser = vi.fn();
    setAuction = vi.fn();
    (client.authenticate as Mock).mockReset();
    (client.me as Mock).mockReset();
    (client.registerUserToAuction as Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("can be opened from login modal", () => {
    render(() => (
      <ParticipateBox
        setIsLogged={setIsLogged}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => false}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={false}
        tosUrl=""
      />
    ));

    fireEvent.click(screen.getByText("Je veux participer"));
    fireEvent.click(screen.getByText("Contacter l'agent"));

    expect(screen.getByText("Demande de participation")).toBeInTheDocument();
    expect(
      screen.queryByText("Vous devez être connecté")
    ).not.toBeInTheDocument();
  });

  test("displays agent contact information", () => {
    render(() => (
      <ParticipateBox
        setIsLogged={setIsLogged}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => false}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={false}
        tosUrl=""
      />
    ));

    fireEvent.click(screen.getByText("Je veux participer"));
    fireEvent.click(screen.getByText("Contacter l'agent"));

    expect(screen.getByText(auction.agentEmail)).toHaveAttribute(
      "href",
      `mailto:${auction.agentEmail}`
    );
    expect(screen.getByText(auction.agentPhone)).toHaveAttribute(
      "href",
      `tel:${auction.agentPhone}`
    );
  });

  test("can be closed", () => {
    render(() => (
      <ParticipateBox
        setIsLogged={setIsLogged}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => false}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={false}
        tosUrl=""
      />
    ));

    fireEvent.click(screen.getByText("Je veux participer"));
    fireEvent.click(screen.getByText("Contacter l'agent"));
    fireEvent.click(screen.getByText("Fermer"));

    expect(
      screen.queryByText("Demande de participation")
    ).not.toBeInTheDocument();
  });
});
