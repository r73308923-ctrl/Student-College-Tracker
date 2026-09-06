---
name: Student tracker backend
description: Durable conventions for the local-auth SQLite academic tracker.
---

Local auth is intentional for this product: passwords are scrypt-hashed and sessions are opaque, hashed tokens stored in SQLite.

**Why:** The user explicitly requested hashed passwords, SQLite, and user-isolated student data instead of a hosted auth/database service.

**How to apply:** Keep ownership checks in every student-owned query, normalize OpenAPI `format: date` inputs before SQLite writes because generated Zod coercion may produce Date objects, and keep both API health entry points responding successfully for artifact probes.

The frontend Vite config should default `PORT` and `BASE_PATH` for standalone builds while still honoring workflow-injected values.

**Why:** Artifact workflows probe the raw API root and production builds may run without workflow environment variables.

**How to apply:** Treat missing local build-time `PORT`/`BASE_PATH` as normal; only validate explicitly supplied invalid ports.