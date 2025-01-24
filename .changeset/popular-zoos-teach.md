---
"@encheres-immo/widget-client": patch
---

Fixed a bug where OAuth redirection failed if the host page URL contained anchors. From now on, anchors and query parameters are stripped from the host page URL before redirection.
