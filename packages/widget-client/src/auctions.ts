import { config } from "../index.js";
import { Socket } from "phoenix";
import type { AuctionType, BidType, PropertyInfoType } from "../types.js";

/**
 * Retrieves the next auction details either by Enchère Immo's property ID or from CRM's property information.
 */
export async function getNextAuctionById(
  propertyInfo: PropertyInfoType
): Promise<AuctionType> {
  const url = propertyInfo.propertyId
    ? `${config.BASE_URL}/api/v1/next_auction/${propertyInfo.propertyId}`
    : `${config.BASE_URL}/api/v1/next_auction/${propertyInfo.source}/${propertyInfo.sourceAgencyId}/${propertyInfo.sourceId}`;

  return fetch(url, {
    headers: {
      Authorization: "Bearer " + config.accessToken,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        console.error("Unauthorized");
        // Throw an error or return null to stop further processing
        throw new Error("Unauthorized");
      }
      return response.json();
    })
    .then(formatAuction)
    .catch((err) => {
      console.error("err", err);
      throw err; // Rethrow the error to be handled by the caller
    });
}

/**
 * Connects to the Phoenix WebSocket channel for a specific Enchère Immo auction.
 */
export function subscribeToAuction(
  auctionId: string,
  messageCallback: (payload: BidType) => void
) {
  return new Promise((resolve, reject) => {
    if (config.socket != null) {
      config.socket.disconnect();
    }
    // Connect to channel
    config.socket = new Socket(config.WS_URL, {
      // debug: true,
      params: { token: config.accessToken },
    });

    config.socket.connect();

    let channel = config.socket.channel(`auction:${auctionId}`, {});

    // Set up message event listener
    channel.on("outbid", (payload: any) => {
      if (messageCallback) {
        messageCallback(payload.bid);
      }
    });

    // Join the channel
    channel
      .join()
      .receive("ok", (resp: any) => {
        resolve(channel); // Resolve with the channel on successful join
      })
      .receive("error", (resp: any) => {
        console.error("Unable to join", resp);
        if (config.socket != null) {
          config.socket.disconnect();
        }
        reject(resp); // Reject the promise on error
      });
  });
}

export function registerUserToAuction(auctionId: string): Promise<AuctionType> {
  return fetch(`${config.BASE_URL}/api/v1/auction_registration`, {
    method: "POST",
    body: JSON.stringify({
      auctionId: auctionId,
    }),
    headers: {
      Authorization: "Bearer " + config.accessToken,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 401) {
        console.error("Unauthorized");
        // Throw an error or return null to stop further processing
        throw new Error("Unauthorized");
      }
      return response.json();
    })
    .then(formatAuction)
    .catch((err) => {
      console.error("err", err);
      throw err; // Rethrow the error to be handled by the caller
    });
}

function formatAuction(data: any): AuctionType {
  // Ensure data.bids is defined and is an array
  const bidsData = Array.isArray(data.bids) ? data.bids : [];

  const bids = bidsData.map((bid: any) => {
    return {
      id: bid.id,
      amount: bid.amount,
      createdAt: bid.createdAt,
      newEndDate: bid.newEndDate,
      userAnonymousId: bid.userAnonymousId,
      participantId: bid.participantId,
    } as BidType;
  });

  const highestBid = bids.reduce(
    (acc: BidType, bid: BidType) => {
      return bid.amount > acc.amount ? bid : acc;
    },
    {
      id: "",
      amount: 0,
      createdAt: 0,
      newEndDate: 0,
      userAnonymousId: "",
    } as BidType
  );

  const registration = data.registration
    ? {
        isUserAllowed: data.registration.isUserAllowed,
        isRegistrationAccepted: data.registration.isRegistrationAccepted,
        isParticipant: data.registration.isParticipant,
      }
    : null;

  return {
    id: data.id,
    startDate: data.startDate,
    endDate: data.endDate,
    startingPrice: data.startingPrice,
    step: data.step,
    bids: bids,
    highestBid: highestBid,
    agentEmail: data.agentEmail,
    agentPhone: data.agentPhone,
    registration: registration,
    isPrivate: data.isPrivate,
    currency: {
      symbol: data.currency.symbol,
      code: data.currency.code,
      isBefore: data.currency.isBefore,
    },
  } as AuctionType;
}