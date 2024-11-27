import { config } from "../index.js";
import type { AuctionType, BidType } from "../types.js";

/**
 * Attempts to place a bid on a progressive auction.
 */
export async function placeBidOnAuction(
  auction: AuctionType,
  amount: number
): Promise<BidType> {
  return fetch(`${config.BASE_URL}/api/v1/bid`, {
    method: "POST",
    body: JSON.stringify({
      auctionId: auction.id,
      amount: amount,
    }),
    headers: {
      Authorization: "Bearer " + config.accessToken,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 401) {
        console.error("Unauthorized");
        throw new Error("Unauthorized");
      }
      if (response.status === 422) {
        return response.json().then((data) => {
          throw data;
        });
      }
      return response.json();
    })
    .then((data) => {
      return {
        id: data.id,
        amount: data.amount,
        createdAt: data.createdAt,
        newEndDate: data.newEndDate,
        userAnonymousId: data.userAnonymousId,
        participantId: data.participantId,
      } as BidType;
    })
    .catch((err) => {
      console.error("err", err);
      throw err;
    });
}
