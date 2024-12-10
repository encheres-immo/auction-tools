import {
    test,
    expect,
    describe,
    beforeEach,
    afterEach,
    vi,
    Mock,
  } from "vitest";
  import { render, screen, cleanup } from "@solidjs/testing-library";
  import { AuctionType } from "@encheres-immo/widget-client/types";
  import { factoryAuction } from "./test-utils.js";
  import UserRegistration from "../src/UserRegistration.jsx";

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
  
  describe("User registration", () => {
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
  
    test("renders tos link", () => {
      render(() => (
        <UserRegistration
            allowUserRegistration={true}
            setAuction={vi.fn()}
            auction={auction}
            setIsShowRegisterUser={vi.fn()}
            isShowRegisterUser={vi.fn(() => true)}
            tosUrl="https://example.com/tos"
        />
      ));
      expect(screen.getByText("les conditions générales d'utilisation").getAttribute("href")).toBe("https://example.com/tos");
    });

    test("invites user to contact agent if not allowed to register user", () => {
      render(() => (
        <UserRegistration
            allowUserRegistration={false}
            setAuction={vi.fn()}
            auction={auction}
            setIsShowRegisterUser={vi.fn()}
            isShowRegisterUser={vi.fn(() => false)}
            tosUrl="https://example.com/tos"
        />
      ));
      expect(screen.getByText(/Vous n'êtes pas inscrit à cette vente/i)).toBeInTheDocument();
    });
  });
  
