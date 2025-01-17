---
"@encheres-immo/auction-widget": minor
---

Renamed the `source` attribute to `source-name`, to avoid conflicts with existing HTML attribute. This is technically a **breaking change**, but it should not affect any existing usage of the widget.

```html
<!-- Before -->
<div id="auction-widget" source="APIMO" [... other attributes]></div>
<!-- After -->
<div id="auction-widget" source-name="APIMO" [... other attributes]></div>
```
