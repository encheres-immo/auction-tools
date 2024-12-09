---
"@encheres-immo/auction-widget": minor
---

Add an optional attribute to allow users to register for the auction—This registration must be accepted by the agent later, or the user will not be able to place bids. If set to false, agent's contact information will be displayed instead.

```html
<div id="auction-widget" [... other attributes] allow-user-registration="false"></div>
```

Default value is `true`.
