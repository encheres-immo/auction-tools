---
"@encheres-immo/auction-widget": minor
---

Added event emission functionality to the auction widget. The widget now dispatches events prefixed with auction-widget:, which can be handled using JavaScript on your website. The available events are:

| Name         | Payload                                            | Description                                                                                          |
| ------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `bid_placed` | `{ amount: number, date: string }`                 | Emitted when a bid is successfully placed. Can be used to play a sound, display a notification, etc. |
| `new_bid`    | `{ amount: number, bidder: string, date: string }` | Emitted when a new bid is placed. Can be used to play a sound, display a notification, etc.          |
| `register`   | `{}`                                               | Emitted when the user registers for the auction. Can be used for analytics, display a message, etc.  |

To listen to an event, add an event listener to the widget element in your website's JavaScript:

```js
document.getElementById('auction-widget').addEventListener('auction-widget:new_bid', (event) => {
  console.log('New bid:', event.detail);
});
```

This event list is meant to be extended in the future, so feel free to ask for new events if you need them!
