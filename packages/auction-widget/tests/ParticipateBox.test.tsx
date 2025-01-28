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
  factoryPropertyInfo,
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
      registration: vi.fn(),
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
    (client.registration as Mock).mockReset();
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
        propertyInfo={factoryPropertyInfo()}
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
        propertyInfo={factoryPropertyInfo()}
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
        propertyInfo={factoryPropertyInfo()}
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
        propertyInfo={factoryPropertyInfo()}
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
    (client.registration as Mock).mockReset();
    (client.me as Mock).mockReset();
    (client.registerUserToAuction as Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("calls client.authenticate and client.me on connect", async () => {
    const user = factoryUser();
    const property = factoryPropertyInfo();
    (client.authenticate as Mock).mockResolvedValue(undefined);
    (client.me as Mock).mockResolvedValue(user);

    render(() => (
      <ParticipateBox
        propertyInfo={property}
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
    expect(updateUser).toHaveBeenCalledWith(user, property);
  });

  test("can be cancelled", () => {
    render(() => (
      <ParticipateBox
        propertyInfo={factoryPropertyInfo()}
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
    (client.registration as Mock).mockReset();
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
        propertyInfo={factoryPropertyInfo()}
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
        propertyInfo={factoryPropertyInfo()}
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
    expect(
      screen.getByText("les conditions générales d'utilisation")
    ).toHaveAttribute("href", "https://encheres-immo.com/cgu");
  });

  test("displays terms of service custom link if provided", () => {
    render(() => (
      <ParticipateBox
        propertyInfo={factoryPropertyInfo()}
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
    expect(
      screen.getByText("les conditions générales d'utilisation")
    ).toHaveAttribute("href", "https://example.com/tos");
  });

  test("can be cancelled", () => {
    render(() => (
      <ParticipateBox
        propertyInfo={factoryPropertyInfo()}
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

  test("is replaced by contact modal when allowUserRegistration is false", () => {
    render(() => (
      <ParticipateBox
        propertyInfo={factoryPropertyInfo()}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => true}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={false}
        tosUrl=""
      />
    ));

    fireEvent.click(screen.getByText("Je veux participer"));

    expect(screen.getByText("Demande de participation")).toBeInTheDocument();
    expect(screen.queryByTestId("auction-widget-contact")).toBeInTheDocument();

    // Close the modal
    fireEvent.click(screen.getByText("Fermer"));

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
    (client.registration as Mock).mockReset();
    (client.me as Mock).mockReset();
    (client.registerUserToAuction as Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("can be opened from login modal when allowUserRegistration is false", () => {
    render(() => (
      <ParticipateBox
        propertyInfo={factoryPropertyInfo()}
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

  test("can't be opened from registration modal when allowUserRegistration is false", () => {
    render(() => (
      <ParticipateBox
        propertyInfo={factoryPropertyInfo()}
        updateUser={updateUser}
        setAuction={setAuction}
        isLogged={() => true}
        isLogging={() => false}
        auction={auction}
        allowUserRegistration={false}
        tosUrl=""
      />
    ));

    fireEvent.click(screen.getByText("Je veux participer"));

    expect(screen.queryByText("Contacter l'agent")).not.toBeInTheDocument();
  });

  test("displays agent contact information", () => {
    render(() => (
      <ParticipateBox
        propertyInfo={factoryPropertyInfo()}
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
        propertyInfo={factoryPropertyInfo()}
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

describe("Event Emission", () => {
  let auction: AuctionType;
  let updateUser: Mock;
  let setAuction: Mock;

  beforeEach(() => {
    auction = factoryAuction();
    updateUser = vi.fn();
    setAuction = vi.fn();
    (client.registerUserToAuction as Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("emits auction-widget:register event when user registers successfully", async () => {
    // Setup listener for custom event
    const eventHandler = vi.fn();
    // Mock successful registration
    const updatedAuction = factoryAuction({ id: "auction1" });
    (client.registerUserToAuction as Mock).mockResolvedValue(updatedAuction);

    // Render component
    render(() => (
      <div id="auction-widget">
        <ParticipateBox
          propertyInfo={factoryPropertyInfo()}
          updateUser={updateUser}
          setAuction={setAuction}
          isLogged={() => true}
          isLogging={() => false}
          auction={auction}
          allowUserRegistration={true}
          tosUrl=""
        />
      </div>
    ));

    document
      .getElementById("auction-widget")!
      .addEventListener("auction-widget:register", eventHandler);

    // Trigger registration flow
    fireEvent.click(screen.getByText("Je veux participer"));
    fireEvent.click(screen.getByText("Valider"));

    // Wait for async operations
    await vi.waitFor(() => {
      expect(eventHandler).toHaveBeenCalledTimes(1);
    });

    // Verify the event was emitted
    const emittedEvent = eventHandler.mock.calls[0][0];
    expect(emittedEvent.type).toBe("auction-widget:register");
  });
});
