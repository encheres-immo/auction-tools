---
"@encheres-immo/auction-widget": patch
"@encheres-immo/widget-client": patch
---

Fix: the auction was displayed as private by default (even if it's public), so we now rely on the `isPrivate` field
