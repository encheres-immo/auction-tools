---
"@encheres-immo/auction-widget": patch
"@encheres-immo/widget-client": patch
---

Fixes the auction being displayed as private by default (even if it is public) in the widget. For that, adds a `isPrivate` field in the auction client.
