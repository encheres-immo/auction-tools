---
"@encheres-immo/auction-widget": minor
"@encheres-immo/widget-client": minor
---

You can now retrieve properties from a CRM by replacing `property-id` by `source` (e.g. `source="APIMO"`), `source-id` (the ID of the property in the CRM), and `source-agency-id` (the ID of the agency in the CRM).

```html
<div id="auction-widget" api-key="YOUR API KEY" source="APIMO" source-id="APIMO PROPERTY ID" source-agency-id="APIMO AGENCY ID"></div>
```
