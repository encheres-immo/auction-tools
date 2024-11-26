# Enchères Immo's widget client

Quickly integrate Enchères Immo's API in your own auction JavaScript/TypeScript widget. Provides a simple interface to fetch auctions, authenticate users and place bids 🚀 

## Prerequisites

To use this widget, you need an API key from Enchères Immo. If you are a real estate professional and not yet a partner of Enchères Immo, please [book a demo](https://1awi3zs5bi0.typeform.com/to/N63LlgvM) to get started. If you are already a partner, contact us to get your API key.

## Useful commands

All commands are run from the root of the package.

| Command          | Description                             |
| ---------------- | --------------------------------------- |
| `pnpm install`   | Install dependencies                    |
| `pnpm run build` | Build the package                       |
| `pnpm run watch` | Build the package and watch for changes |
| `pnpm run test`  | Run the tests                           |

## Important notes

This package is built with [TypeScript](https://www.typescriptlang.org/), and not bundled or minified. It is intended to be used as a module in your own auction widget, which should be bundled and minified for production.

Enchères Immo's protect your API access by restricting it to specific domains. But you should be careful with user authentication tokens, and ensure that they are securely managed and stored.

Finnaly, this client uses the [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) to communicate with the server. Be mindful of managing the connection lifecycle (e.g., disconnecting when no longer needed).

## Usage

Below are simple examples demonstrating how to use Enchères Immo's widget client with TypeScript.

### Setup

First, import the client and initialize it.

```ts
import client from "@encheres-immo/widget-client";

// Replace by your API key
client.initEIClient(api_key);
```

### Authentication

To authenticate the user, call the `authenticate` method. This will handle the OAuth2 flow and obtain an access token.

```ts
await client.authenticate();
```

After authentication, you can retrieve the authenticated user's details:

```ts
const user = await client.me();
console.log('User:', user);
```

### Fetching Auction Details

To fetch details of the next auction for a property, use the `getNextAuctionById` method, with the Enchères Immo property ID:

```ts
const propertyInfo = {
  propertyId: 'your-property-id', // Replace with your property ID
};

const auction = await client.getNextAuctionById(propertyInfo);
console.log('Auction:', auction);
```

Alternatively, you can use your CRM property ID:

```ts
const propertyInfo = {
  source: 'crm-source',         // Replace with your CRM ID (e.g., 'apimo')
  sourceAgencyId: 'agency-id',  // Replace with your agency ID in your CRM
  sourceId: 'source-id',        // Replace with the property ID in your CRM
};

const auction = await client.getNextAuctionById(propertyInfo);
console.log('Auction:', auction);
```

### Subscribing to Auction Updates

To receive real-time updates for an auction, such as new bids, subscribe to the auction channel:

```ts
function onNewBid(bid) {
  console.log('New bid received:', bid);
}

// Subscribe to auction updates
await client.subscribeToAuction(auction.id, onNewBid);
```

### Placing a Bid

To place a bid on an auction, use the `placeBidOnAuction` method:

```ts
const bidAmount = 100000; // Replace with your bid amount
const bid = await client.placeBidOnAuction(auction, bidAmount);
console.log('Bid placed:', bid);
```

Note that you need to be authenticated and authorized to place a bid.
