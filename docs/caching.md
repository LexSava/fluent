# Caching

This document describes all caching mechanisms in Fluent — the Upstash Redis server-side cache, the sessionStorage client-side persistence, and the rate limiting layer on the chat endpoint.

---

## Why Upstash Redis?

Fluent runs on Vercel serverless functions, which are stateless and ephemeral. Without a shared cache, every request would hit the database directly. Upstash Redis is used as the caching layer for two reasons:

1. **REST-based API** — Upstash's client uses HTTP rather than a persistent TCP connection, which is compatible with Vercel's serverless model (standard Redis clients using TCP do not work reliably in serverless environments).
2. **Low operational overhead** — No infrastructure to manage; the instance scales automatically.

The Redis client is initialized in `src/lib/redis.ts` using the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables.

---

## Generic Caching Utilities

`src/lib/redis.ts` exports three helper functions:

| Function | Description |
|----------|-------------|
| `getCached<T>(key)` | Fetch a value by key; returns `T \| null` |
| `setCached<T>(key, value, ttlSeconds)` | Store a value with a TTL |
| `invalidateCache(key)` | Delete a key immediately |

All values are stored as JSON strings and deserialized on read.

---

## What is Cached

### Due Items Cache

| Property | Value |
|----------|-------|
| Key pattern | `due_items:{userId}` |
| Value | Array of `VocabItem` objects |
| TTL | 3600 seconds (1 hour) |
| Written | In `/api/session/start` on a cache miss |
| Read | In `/api/session/start` (avoids DB query on repeat calls) and in `/api/chat` (provides due items to the system prompt builder) |
| Invalidated | In `/api/session/end` (due dates change after reviews) |

**Why 1 hour?** Due items change only when vocabulary reviews are submitted. Within a single session (typically 5–30 minutes), the set of due items is stable. Caching for 1 hour means a user who starts multiple sessions in the same hour pays only one database query.

---

### Progress Cache

| Property | Value |
|----------|-------|
| Key pattern | `progress:{userId}` |
| Value | `ProgressData` object (total words, streak, accuracy, weekly chart, vocabulary breakdown) |
| TTL | 1800 seconds (30 minutes) |
| Written | In `/api/progress` on a cache miss |
| Read | In `/api/progress` (served to the progress page) |
| Invalidated | In `/api/session/end` (session completion changes stats) |

**Why 30 minutes?** Progress stats are aggregations over historical data. They don't change mid-session. Serving them from cache eliminates several complex Prisma aggregation queries on every page load.

---

## Cache Invalidation Strategy

Cache invalidation happens explicitly at the end of each learning session via `/api/session/end`. Both cache keys are deleted at that point:

1. `due_items:{userId}` — because vocab items now have new `dueAt` dates after being reviewed.
2. `progress:{userId}` — because session stats, accuracy, and streak data have changed.

The next request to either endpoint will trigger a fresh database query and re-populate the cache.

---

## Rate Limiting

The `/api/chat` route implements per-user rate limiting using Upstash Redis. This protects against runaway API costs and abuse.

Each user's request count is tracked with a sliding window or fixed window counter in Redis. When the limit is exceeded, the route returns HTTP **429 Too Many Requests**.

The specific limits (requests per minute/hour) are configured in the rate limiting logic in `src/app/api/chat/route.ts`.

---

## sessionStorage: Client-Side Session Persistence

The client-side session state is stored in the browser's `sessionStorage` (not `localStorage`). This is a deliberate choice: `sessionStorage` is scoped to the current browser tab, which prevents two concurrent sessions in different tabs from overwriting each other's state.

### What Is Stored

| Key | Type | Content | Cleared when |
|-----|------|---------|--------------|
| `active_session` | JSON object | `{ sessionId, format, dueItems }` | Session ends |
| `chat_messages_{sessionId}` | JSON array | Full message history (both user and assistant) | Session ends |
| `exercise_count_{sessionId}` | String (number) | Count of completed exercises | Session ends |

### Why sessionStorage Instead of React State

React state is lost on page refresh. If a user accidentally refreshes during a session, they would lose all conversation history. sessionStorage persists for the lifetime of the tab, so the full conversation is recoverable on refresh. The component reads from sessionStorage on mount and restores the conversation exactly as it was.

---

## Difference Between Redis and sessionStorage

| Property | Redis (Upstash) | sessionStorage |
|----------|----------------|----------------|
| Location | Server-side | Client-side (browser tab) |
| Scope | Shared across all tabs and devices | Single browser tab only |
| Lifetime | Controlled by TTL or explicit delete | Until tab is closed |
| What's stored | Aggregated data (due items, progress stats) | Conversation messages, exercise count |
| Access | Only from server-side route handlers | Only from client-side JavaScript |

---

## See Also

- [session-flow.md](./session-flow.md) — Detailed walkthrough of cache reads/writes per phase
- [api-routes.md](./api-routes.md) — Which routes interact with the cache
- [deployment.md](./deployment.md) — Environment variables for Upstash Redis
