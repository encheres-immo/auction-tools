---
"@encheres-immo/widget-client": minor
---

Add a method to allows the connected user to register for a specific auction.

```ts
const registration = await client.registerOnAuction(auction);
console.log('Registration:', registration);
```

This registration must be accepted by the agent later, or the user will not be able to place bids.

