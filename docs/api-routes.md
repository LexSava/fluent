# API Routes

This document lists every API route in Fluent with its HTTP method, purpose, request parameters, response shape, and error codes. All routes except the NextAuth handler and the auth-specific routes require a valid session.

---

## Authentication Routes

### `GET/POST /api/auth/[...nextauth]`

NextAuth catch-all handler. Delegates entirely to the NextAuth.js v5 configuration in `src/lib/auth.ts`. Handles OAuth redirects, session management, sign-out, and provider callbacks.

- **Authorization required:** No
- **Do not call directly** — use NextAuth's `signIn()`, `signOut()`, or provider redirects.

---

### `POST /api/auth/register`

Creates a new user account with email and password.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | Yes | Must be a valid email address |
| `password` | String | Yes | Must meet password complexity requirements |
| `name` | String | No | Display name |

**Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 201 | `{ user: { id, email } }` | Account created successfully |
| 400 | `{ error: "Email already in use" }` | Email is taken |
| 400 | `{ error: "Validation error", details: [...] }` | Password fails Zod validation |
| 500 | `{ error: "Internal server error" }` | Unexpected failure |

**Authorization required:** No

---

### `POST /api/auth/forgot-password`

Initiates the password reset flow by creating a one-time token and sending an email.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | Yes | The user's registered email address |

**Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ message: "If that email exists, a reset link has been sent." }` | Always (prevents email enumeration) |

**Authorization required:** No

---

### `POST /api/auth/reset-password`

Validates a reset token and updates the user's password.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | String | Yes | UUID token from the reset email |
| `password` | String | Yes | New password (must meet complexity requirements) |

**Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ message: "Password updated." }` | Success |
| 400 | `{ error: "Invalid or expired token" }` | Token not found or past expiry |
| 400 | `{ error: "Validation error" }` | Password fails validation |

**Authorization required:** No

---

## AI Chat Route

### `POST /api/chat`

Streams an AI tutor response for the current session. Returns a plain UTF-8 text stream.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | Array | Yes | Full conversation history in `{ role, content }` format |
| `sessionId` | String | Yes | Active learning session ID |
| `format` | SessionFormat | Yes | One of: REVIEW, VOCABULARY, GRAMMAR, READING, WRITING, SPEAKING |

**Response:**

- Content-Type: `text/plain; charset=utf-8`
- The response body is a stream of text chunks. Accumulate all chunks to get the full message.
- The last assistant message may contain a fenced JSON block at the end with exercise scoring data.

**Responses:**

| Status | Condition |
|--------|-----------|
| 200 | Stream started successfully |
| 401 | No valid session |
| 429 | Rate limit exceeded |
| 500 | AI provider error |

**Authorization required:** Yes

---

## Session Routes

### `POST /api/session/start`

Creates a new learning session and returns due vocabulary items.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `format` | SessionFormat | Yes | Session format to start |

**Response (200):**

```json
{
  "session": {
    "id": "cuid...",
    "format": "VOCABULARY",
    "startedAt": "2026-05-17T10:00:00.000Z",
    "exercisesTotal": 0,
    "exercisesCorrect": 0
  },
  "dueItems": [
    {
      "id": "cuid...",
      "term": "Schlüssel",
      "translation": "key",
      "context": "Ich habe den Schlüssel verloren.",
      "repetitions": 2,
      "easeFactor": 2.5,
      "interval": 6,
      "dueAt": "2026-05-17T00:00:00.000Z"
    }
  ]
}
```

**Authorization required:** Yes

---

### `POST /api/session/end`

Closes an active session and calculates aggregate scores.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | String | Yes | ID of the session to close |

**Response (200):**

```json
{
  "session": {
    "id": "cuid...",
    "endedAt": "2026-05-17T10:35:00.000Z",
    "score": 7.8,
    "exercisesTotal": 8,
    "exercisesCorrect": 6
  }
}
```

**Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 200 | Updated session object | Success |
| 401 | `{ error: "Unauthorized" }` | No session |
| 403 | `{ error: "Forbidden" }` | Session belongs to another user |
| 404 | `{ error: "Session not found" }` | Invalid session ID |

**Authorization required:** Yes

---

## Vocabulary Routes

### `POST /api/vocab/review`

Submits an exercise result, updates the vocabulary item's SM-2 schedule, and creates an Exercise record.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | String | Yes | Active session ID |
| `score` | Number (0–10) | Yes | Score from the JSON score block |
| `feedback` | String | Yes | Tutor feedback text |
| `vocabItemId` | String | No | ID of the vocab item (if known) |
| `vocabTerm` | String | No | Term text (used to find or create the item if `vocabItemId` is absent) |

**Response (200):**

```json
{
  "vocabItem": {
    "id": "cuid...",
    "term": "Schlüssel",
    "repetitions": 3,
    "easeFactor": 2.6,
    "interval": 16,
    "dueAt": "2026-06-02T00:00:00.000Z"
  },
  "exercise": {
    "id": "cuid...",
    "score": 8,
    "feedback": "Good job! ..."
  }
}
```

**Authorization required:** Yes

---

## Progress Route

### `GET /api/progress`

Returns aggregated progress statistics for the current user. Results are cached for 30 minutes.

**Response (200):**

```json
{
  "totalWords": 47,
  "dueToday": 5,
  "newWords": 12,
  "learningWords": 22,
  "masteredWords": 13,
  "currentStreak": 4,
  "accuracy": 82,
  "weeklyActivity": [
    { "day": "Mon", "sessions": 2, "exercises": 14 },
    { "day": "Tue", "sessions": 1, "exercises": 7 }
  ]
}
```

**Authorization required:** Yes

---

## User Profile Route

### `GET /api/user/profile`

Returns the current user's profile data.

**Response (200):**

```json
{
  "id": "cuid...",
  "name": "Alex",
  "email": "alex@example.com",
  "image": "https://lh3.googleusercontent.com/...",
  "targetLang": "de",
  "cefrLevel": "B1",
  "interests": ["travel", "cooking"],
  "isOnboarded": true
}
```

**Authorization required:** Yes

---

### `POST /api/user/profile`

Updates the current user's profile and marks onboarding as complete.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | No | Display name |
| `targetLang` | String | No | Language code (e.g. `"de"`) |
| `cefrLevel` | CefrLevel | No | Proficiency level |
| `interests` | String[] | No | List of interest topics |
| `isOnboarded` | Boolean | No | Set to `true` to complete onboarding |

**Response (200):** Updated user profile object (same shape as GET).

**Authorization required:** Yes

---

## See Also

- [authentication.md](./authentication.md) — Auth flow and session strategy
- [session-flow.md](./session-flow.md) — How these routes are called in sequence
- [caching.md](./caching.md) — Which routes interact with Redis
- [database.md](./database.md) — Data models behind each route
