---
name: Integration catalog identifiers
description: How to recover when an integration id from project context no longer resolves.
---

Integration identifiers shown in an earlier project snapshot can become stale; use a live capability search to obtain the current exact connector id before proposing a connection.

**Why:** Connector ids are generated and may change between sessions even when the provider name stays the same.

**How to apply:** Prefer the current Integrations view; if it is unavailable or incomplete, search the live catalog and pass the returned id unchanged to the connection proposal.