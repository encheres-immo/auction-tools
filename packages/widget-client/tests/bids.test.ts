import { beforeEach, afterEach, describe, expect, it, vi, Mock } from "vitest";
import { placeBidOnAuction } from "../src/bids.js";
import type { AuctionType } from "../types.js";
import { reset_config } from "./setupTests.js";

describe("placeBidOnAuction", () => {
  beforeEach(() => {
    reset_config("test-access-token");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should place a bid successfully", async () => {
    const auction: AuctionType = {
      id: "auction-123",
      startDate: 0,
      endDate: 0,
      startingPrice: 0,
      step: 0,
      bids: [],
      highestBid: {
        id: "",
        amount: 0,
        createdAt: 0,
        newEndDate: 0,
        userAnonymousId: "",
        participantId: ""
      },
      agentEmail: "",
      agentPhone: "",
      currency: {
        isBefore: false,
        symbol: "",
        code: ""
      },
      registration: null,
      isPrivate: false
    };

    const mockResponse = {
      id: "bid-456",
      amount: 100000,
      createdAt: 1620000000,
      newEndDate: 1620003600,
      userAnonymousId: "user-789",
      participantId: "participant-101112",
    };

    (fetch as Mock).mockResolvedValue({
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    const bid = await placeBidOnAuction(auction, 100000);

    // Verify fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4000/api/v1/bid",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          auctionId: "auction-123",
          amount: 100000,
        }),
        headers: {
          Authorization: "Bearer test-access-token",
          "Content-Type": "application/json",
        },
      })
    );

    // Verify bid data is returned correctly
    expect(bid).toEqual({
      id: "bid-456",
      amount: 100000,
      createdAt: 1620000000,
      newEndDate: 1620003600,
      userAnonymousId: "user-789",
      participantId: "participant-101112",
    });
  });

  it("should log 'Unauthorized' when response status is 401", async () => {
    const auction: AuctionType = {
      id: "auction-123",
      startDate: 0,
      endDate: 0,
      startingPrice: 0,
      step: 0,
      bids: [],
      highestBid: {
        id: "",
        amount: 0,
        createdAt: 0,
        newEndDate: 0,
        userAnonymousId: "",
        participantId: ""
      },
      agentEmail: "",
      agentPhone: "",
      currency: {
        isBefore: false,
        symbol: "",
        code: ""
      },
      registration: null,
      isPrivate: false
    };
    
    (fetch as Mock).mockResolvedValue({
      status: 401,
      json: () => Promise.resolve({ error: "Unauthorized" }),
    });
  
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  
    await expect(placeBidOnAuction(auction, 100000)).rejects.toThrow("Unauthorized");
  
    // Verify 'Unauthorized' is logged
    expect(consoleLogSpy).toHaveBeenCalledWith("Unauthorized");
  });
    

  it("should handle validation errors with status 422", async () => {
    const auction: AuctionType = {
      id: "auction-123",
      startDate: 0,
      endDate: 0,
      startingPrice: 0,
      step: 0,
      bids: [],
      highestBid: {
        id: "",
        amount: 0,
        createdAt: 0,
        newEndDate: 0,
        userAnonymousId: "",
        participantId: ""
      },
      agentEmail: "",
      agentPhone: "",
      currency: {
        isBefore: false,
        symbol: "",
        code: ""
      },
      registration: null,
      isPrivate: false
    };

    const errorData = { errors: { amount: ["must be greater than 0"] } };

    (fetch as Mock).mockResolvedValue({
      status: 422,
      json: () => Promise.resolve(errorData),
    });

    await expect(placeBidOnAuction(auction, -100)).rejects.toEqual(errorData);
  });

  it("should throw an error when fetch fails", async () => {
    const auction: AuctionType = {
      id: "auction-123",
      startDate: 0,
      endDate: 0,
      startingPrice: 0,
      step: 0,
      bids: [],
      highestBid: {
        id: "",
        amount: 0,
        createdAt: 0,
        newEndDate: 0,
        userAnonymousId: "",
        participantId: ""
      },
      agentEmail: "",
      agentPhone: "",
      currency: {
        isBefore: false,
        symbol: "",
        code: ""
      },
      registration: null,
      isPrivate: false
    };

    const mockError = new Error("Network Error");

    (fetch as Mock).mockRejectedValue(mockError);

    await expect(placeBidOnAuction(auction, 100000)).rejects.toThrow("Network Error");

    // Verify error is logged
    expect(console.log).toHaveBeenCalledWith("err", mockError);
  });
});
