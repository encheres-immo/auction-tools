import {
  test,
  expect,
  describe,
  beforeEach,
  afterEach,
  vi,
  Mock,
} from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import ParticipateBox from "../src/ParticipateBox.jsx";
import { AuctionType, UserType } from "@encheres-immo/widget-client/types";
import { factoryAuction, factoryPropertyInfo, factoryUser } from "./test-utils.js";

// Mock the client module
vi.mock("@encheres-immo/widget-client", () => {
  return {
    default: {
      authenticate: vi.fn(),
      me: vi.fn(),
    },
  };
});

// Import the mocked client
import client from "@encheres-immo/widget-client";

describe("Participate buttons", () => {
  let auction: AuctionType;
  let setterIsLogged: Mock;
  let updateUser: Mock;

  beforeEach(() => {
    auction = factoryAuction();
    setterIsLogged = vi.fn();
    updateUser = vi.fn();
    (client.authenticate as Mock).mockReset();
    (client.me as Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("renders", () => {
    render(() => (
      <ParticipateBox
        setterIsLogged={setterIsLogged}
        updateUser={updateUser}
        isLogging={false}
        auction={auction}
        propertyInfo={factoryPropertyInfo()}
      />
    ));
    // Check that the participate button is rendered
    expect(screen.getByText("Je veux participer")).toBeInTheDocument();
  });

  test("opens the login modal", () => {
    render(() => (
      <ParticipateBox
        setterIsLogged={setterIsLogged}
        updateUser={updateUser}
        isLogging={false}
        auction={auction}
        propertyInfo={factoryPropertyInfo()}
      />
    ));
    const participateButton = screen.getByText("Je veux participer");
    fireEvent.click(participateButton);
    // Check that the login modal is displayed
    expect(screen.getByText("Vous devez être connecté")).toBeInTheDocument();
  });
});

describe("Login button", () => {
  let auction: AuctionType;
  let setterIsLogged: Mock;
  let updateUser: Mock;

  beforeEach(() => {
    auction = factoryAuction();
    setterIsLogged = vi.fn();
    updateUser = vi.fn();
    (client.authenticate as Mock).mockReset();
    (client.me as Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });
  test("calls client.authenticate and client.me", async () => {
    // Mock client.authenticate and client.me
    const user: UserType = factoryUser();
    (client.authenticate as Mock).mockResolvedValue(undefined);
    (client.me as Mock).mockResolvedValue(user);
    const propertyInfo = factoryPropertyInfo();

    render(() => (
      <ParticipateBox
        setterIsLogged={setterIsLogged}
        updateUser={updateUser}
        isLogging={false}
        auction={auction}
        propertyInfo={propertyInfo}
      />
    ));

    const participateButton = screen.getByText("Je veux participer");
    fireEvent.click(participateButton);

    const connectButton = screen.getByText("Se connecter");
    fireEvent.click(connectButton);

    // Wait for promises to resolve
    await client.authenticate();
    await client.me();

    // Check that client.authenticate and client.me have been called
    expect(client.authenticate).toHaveBeenCalled();
    expect(client.me).toHaveBeenCalled();

    // Check that setterIsLogged and updateUser have been called with correct arguments
    expect(setterIsLogged).toHaveBeenCalledWith(true);
    expect(updateUser).toHaveBeenCalledWith(user, propertyInfo);
  });

  test("can be cancelled", () => {
    render(() => (
      <ParticipateBox
        setterIsLogged={setterIsLogged}
        updateUser={updateUser}
        isLogging={false}
        auction={auction}
        propertyInfo={factoryPropertyInfo()}
      />
    ));
    const participateButton = screen.getByText("Je veux participer");
    fireEvent.click(participateButton);

    const cancelButton = screen.getByText("Annuler");
    fireEvent.click(cancelButton);

    // Check that the login modal is no longer displayed
    expect(
      screen.queryByText("Vous devez être connecté")
    ).not.toBeInTheDocument();
  });
});

describe("Contact modal", () => {
  let auction: AuctionType;
  let setterIsLogged: Mock;
  let updateUser: Mock;

  beforeEach(() => {
    auction = factoryAuction();
    setterIsLogged = vi.fn();
    updateUser = vi.fn();
    (client.authenticate as Mock).mockReset();
    (client.me as Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("can be opened", () => {
    render(() => (
      <ParticipateBox
        setterIsLogged={setterIsLogged}
        updateUser={updateUser}
        isLogging={false}
        auction={auction}
        propertyInfo={factoryPropertyInfo()}
      />
    ));
    const participateButton = screen.getByText("Je veux participer");
    fireEvent.click(participateButton);

    const contactAgentButton = screen.getByText("Contacter l'agent");
    fireEvent.click(contactAgentButton);

    // Check that the agent contact modal is displayed
    expect(screen.getByText("Demande de participation")).toBeInTheDocument();

    // Check that the login modal is closed
    expect(
      screen.queryByText("Vous devez être connecté")
    ).not.toBeInTheDocument();
  });

  test("displays agent email and phone", () => {
    render(() => (
      <ParticipateBox
        setterIsLogged={setterIsLogged}
        updateUser={updateUser}
        isLogging={false}
        auction={auction}
        propertyInfo={factoryPropertyInfo()}
      />
    ));
    const participateButton = screen.getByText("Je veux participer");
    fireEvent.click(participateButton);

    const contactAgentButton = screen.getByText("Contacter l'agent");
    fireEvent.click(contactAgentButton);

    // Check that agent email and phone are displayed correctly
    const emailLink = screen.getByText(auction.agentEmail);
    expect(emailLink).toHaveAttribute("href", `mailto:${auction.agentEmail}`);

    const phoneLink = screen.getByText(auction.agentPhone);
    expect(phoneLink).toHaveAttribute("href", `tel:${auction.agentPhone}`);
  });

  test("can be closed", () => {
    render(() => (
      <ParticipateBox
        setterIsLogged={setterIsLogged}
        updateUser={updateUser}
        isLogging={false}
        auction={auction}
        propertyInfo={factoryPropertyInfo()}
      />
    ));
    const participateButton = screen.getByText("Je veux participer");
    fireEvent.click(participateButton);

    const contactAgentButton = screen.getByText("Contacter l'agent");
    fireEvent.click(contactAgentButton);

    const closeButton = screen.getByText("Fermer");
    fireEvent.click(closeButton);

    // Check that the agent contact modal is closed
    expect(
      screen.queryByText("Demande de participation")
    ).not.toBeInTheDocument();
  });
});
