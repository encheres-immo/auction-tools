import { Socket } from "phoenix";
import { authenticate, me } from "./src/auth.js";
import {
  getNextAuctionById,
  subscribeToAuction,
  registerUserToAuction,
} from "./src/auctions.js";
import { placeBidOnAuction } from "./src/bids.js";

/**
 * Configuration object for the Enchère Immo API client.
 */
export const config = {
  BASE_URL: "",
  WS_URL: "",
  accessToken: null as string | null,
  socket: null as Socket | null,
  DOMAIN: "",
  clientId: null as string | null,
};

// TODO: only connect if we have an access token
// TODO: implement refresh token?
// TODO: implement error handling

/**
 * Initializes the Enchère Immo client by setting the client ID and configuring the
 * appropriate URLs for the specified environment.
 *
 * Note: environment can be changed to "local" and "staging" for internal use.
 * If you are an external user, please only use "production".
 */
export function initEIClient(
  apiKey: string,
  environment: "local" | "staging" | "production" = "production"
) {
  config.clientId = apiKey;
  switch (environment) {
    case "local":
      config.DOMAIN = "localhost:4000";
      config.BASE_URL = `http://${config.DOMAIN}`;
      config.WS_URL = `ws://${config.DOMAIN}/api/socket`;
      break;
    case "staging":
      config.DOMAIN = "staging.encheres-immo.com";
      config.BASE_URL = `https://${config.DOMAIN}`;
      config.WS_URL = `wss://${config.DOMAIN}/api/socket`;
      break;
    case "production":
      config.DOMAIN = "encheres-immo.com";
      config.BASE_URL = `https://${config.DOMAIN}`;
      config.WS_URL = `wss://${config.DOMAIN}/api/socket`;
      break;
    default:
      console.warn(
        "Auction Widget: Unknown environment, defaulting to production."
      );
      config.DOMAIN = "encheres-immo.com";
      config.BASE_URL = `https://${config.DOMAIN}`;
      config.WS_URL = `wss://${config.DOMAIN}/api/socket`;
      break;
  }
}

export default {
  initEIClient,
  getNextAuctionById,
  authenticate,
  subscribeToAuction,
  registerUserToAuction,
  me,
  placeBidOnAuction,
};
