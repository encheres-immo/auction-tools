import { beforeEach, afterEach, describe, expect, it, vi, Mock } from "vitest";
import { getNextAuctionById, subscribeToAuction } from "../src/auctions.js";
import { config } from "../index.js";
import type { PropertyInfoType } from "../types.js";
import { Socket } from "phoenix";
import { reset_config } from "./setupTests.js";

describe("getNextAuctionById", () => {
  beforeEach(() => {
    reset_config("test-access-token");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should fetch auction by propertyId", async () => {
    const propertyInfo: PropertyInfoType = {
      propertyId: "property-123",
    };

    // Mock fetch response
    const mockData = {
      id: "auction-456",
      startDate: 1620000000,
      endDate: 1620003600,
      startingPrice: 100000,
      step: 1000,
      bids: [
        {
          id: "bid-1",
          amount: 101000,
          createdAt: 1620000300,
          newEndDate: 1620003900,
          userAnonymousId: "user-1",
          participantId: "participant-1",
        },
      ],
      agentEmail: "agent@example.com",
      agentPhone: "123456789",
      registration: {
        isUserAllowed: true,
        isRegistrationAccepted: true,
        isParticipant: true,
      },
      isPrivate: false,
      currency: {
        symbol: "$",
        code: "USD",
        isBefore: true,
      },
    };

    (fetch as Mock).mockResolvedValue({
      status: 200,
      json: () => Promise.resolve(mockData),
    });

    const auction = await getNextAuctionById(propertyInfo);

    // Verify fetch was called with correct URL and headers
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4000/api/v1/next_auction/property-123",
      expect.objectContaining({
        headers: {
          Authorization: "Bearer test-access-token",
        },
      })
    );

    // Verify auction data is parsed correctly
    expect(auction).toEqual({
      id: "auction-456",
      startDate: 1620000000,
      endDate: 1620003600,
      startingPrice: 100000,
      step: 1000,
      bids: [
        {
          id: "bid-1",
          amount: 101000,
          createdAt: 1620000300,
          newEndDate: 1620003900,
          userAnonymousId: "user-1",
          participantId: "participant-1",
        },
      ],
      highestBid: {
        id: "bid-1",
        amount: 101000,
        createdAt: 1620000300,
        newEndDate: 1620003900,
        userAnonymousId: "user-1",
        participantId: "participant-1",
      },
      agentEmail: "agent@example.com",
      agentPhone: "123456789",
      registration: {
        isUserAllowed: true,
        isRegistrationAccepted: true,
        isParticipant: true,
      },
      isPrivate: false,
      currency: {
        symbol: "$",
        code: "USD",
        isBefore: true,
      },
    });
  });

  it("should fetch auction by source info", async () => {
    const propertyInfo: PropertyInfoType = {
      source: "crm",
      sourceAgencyId: "agency-789",
      sourceId: "property-456",
    };

    // Mock fetch response
    const mockData = {
      id: "auction-789",
      startDate: 1620000000,
      endDate: 1620003600,
      startingPrice: 200000,
      step: 5000,
      bids: [],
      agentEmail: "agent@example.com",
      agentPhone: "123456789",
      registration: null,
      isPrivate: true,
      currency: {
        symbol: "€",
        code: "EUR",
        isBefore: false,
      },
    };

    (fetch as Mock).mockResolvedValue({
      status: 200,
      json: () => Promise.resolve(mockData),
    });

    const auction = await getNextAuctionById(propertyInfo);

    // Verify fetch was called with correct URL and headers
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4000/api/v1/next_auction/crm/agency-789/property-456",
      expect.objectContaining({
        headers: {
          Authorization: "Bearer test-access-token",
        },
      })
    );

    // Verify auction data is parsed correctly
    expect(auction).toEqual({
      id: "auction-789",
      startDate: 1620000000,
      endDate: 1620003600,
      startingPrice: 200000,
      step: 5000,
      bids: [],
      highestBid: {
        id: "",
        amount: 0,
        createdAt: 0,
        newEndDate: 0,
        userAnonymousId: "",
      },
      agentEmail: "agent@example.com",
      agentPhone: "123456789",
      registration: null,
      isPrivate: true,
      currency: {
        symbol: "€",
        code: "EUR",
        isBefore: false,
      },
    });
  });

  it("should log 'Unauthorized' and throw an error when response status is 401", async () => {
    const propertyInfo: PropertyInfoType = {
      propertyId: "property-123",
    };

    (fetch as Mock).mockResolvedValue({
      status: 401,
      json: () => Promise.resolve({ error: "Unauthorized" }),
    });

    const consoleLogSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(getNextAuctionById(propertyInfo)).rejects.toThrow(
      "Unauthorized"
    );

    // Verify 'Unauthorized' is logged
    expect(consoleLogSpy).toHaveBeenCalledWith("Unauthorized");
  });

  it("should throw an error when fetch fails", async () => {
    const propertyInfo: PropertyInfoType = {
      propertyId: "property-123",
    };

    const mockError = new Error("Network Error");

    (fetch as Mock).mockRejectedValue(mockError);

    await expect(getNextAuctionById(propertyInfo)).rejects.toThrow(
      "Network Error"
    );

    // Verify error is logged
    expect(console.error).toHaveBeenCalledWith("err", mockError);
  });
});

describe("subscribeToAuction", () => {
  let SocketMock: any;
  let socketInstance: any;
  let channelMock: any;
  let channelInstance: any;

  beforeEach(() => {
    reset_config("test-access-token");

    // Mock Socket and its methods
    channelInstance = {
      join: vi.fn().mockReturnThis(),
      receive: vi.fn(),
      on: vi.fn(),
    };

    channelMock = vi.fn().mockReturnValue(channelInstance);

    socketInstance = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      channel: channelMock,
    };

    SocketMock = vi.fn().mockImplementation(() => socketInstance);

    vi.mocked(Socket).mockImplementation(SocketMock);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should connect to the auction channel and set up event listener", async () => {
    const auctionId = "auction-123";
    const messageCallback = vi.fn();

    // Simulate successful channel join
    channelInstance.receive.mockImplementation(function (
      this: typeof channelInstance,
      status: string,
      callback: Function
    ) {
      if (status === "ok") {
        callback({});
      }
      return this;
    });

    await subscribeToAuction(auctionId, messageCallback);

    // Verify existing socket is disconnected if present
    expect(config.socket).toBe(socketInstance);

    // Verify new Socket is created with correct parameters
    expect(SocketMock).toHaveBeenCalledWith("ws://localhost:4000/api/socket", {
      params: { token: "test-access-token" },
    });

    // Verify socket connects
    expect(socketInstance.connect).toHaveBeenCalled();

    // Verify channel is joined
    expect(socketInstance.channel).toHaveBeenCalledWith(
      "auction:auction-123",
      {}
    );

    // Verify event listener is set up
    expect(channelInstance.on).toHaveBeenCalledWith(
      "outbid",
      expect.any(Function)
    );

    // Simulate 'outbid' event
    const bidPayload = { bid: { id: "bid-1", amount: 105000 } };
    const outbidCallback = channelInstance.on.mock.calls[0][1];
    outbidCallback(bidPayload);

    // Verify messageCallback is called with bid data
    expect(messageCallback).toHaveBeenCalledWith(bidPayload.bid);
  });

  it("should disconnect existing socket if present", async () => {
    const auctionId = "auction-123";
    const messageCallback = vi.fn();

    // Set existing socket in config
    const existingSocket = {
      disconnect: vi.fn(),
    };
    config.socket = existingSocket as any;

    // Simulate successful channel join
    channelInstance.receive.mockImplementation(function (
      this: typeof channelInstance,
      status: string,
      callback: Function
    ) {
      if (status === "ok") {
        callback({});
      }
      return this;
    });

    await subscribeToAuction(auctionId, messageCallback);

    // Verify existing socket is disconnected
    expect(existingSocket.disconnect).toHaveBeenCalled();

    // Verify new socket is set in config
    expect(config.socket).toBe(socketInstance);
  });

  it("should reject the promise if joining the channel fails", async () => {
    const auctionId = "auction-123";
    const messageCallback = vi.fn();

    // Simulate failed channel join
    channelInstance.receive.mockImplementation(function (
      this: typeof channelInstance,
      status: string,
      callback: Function
    ) {
      if (status === "error") {
        callback({ reason: "Join failed" });
      }
      return this;
    });

    await expect(
      subscribeToAuction(auctionId, messageCallback)
    ).rejects.toEqual({
      reason: "Join failed",
    });

    // Verify socket is disconnected on error
    expect(socketInstance.disconnect).toHaveBeenCalled();
  });
});
