---
name: Student tracker backend
description: Durable conventions for the local-auth SQLite academic tracker.
---

Local auth is intentional for this product: passwords are scrypt-hashed and sessions are opaque, hashed tokens stored in SQLite.

**Why:** The user explicitly requested hashed passwords, SQLite, and user-isolated student data instead of a hosted auth/database service.

**How to apply:** Keep ownership checks in every student-owned query, and normalize OpenAPI `format: date` inputs before SQLite writes because generated Zod coercion may produce Date objects.