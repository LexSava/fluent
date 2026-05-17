# Database

This document describes the Prisma schema, all models with their fields and relations, how to use the Prisma client, and commands for working with the database.

---

## Database Provider

Fluent uses **PostgreSQL** hosted on [Neon](https://neon.tech). Connection pooling is handled by Neon's built-in pooler via the `DATABASE_URL` connection string. The ORM is **Prisma v7** with the `@prisma/client` package.

---

## Prisma Client (Singleton Pattern)

The Prisma client is instantiated as a singleton in `src/lib/prisma.ts`. In development, Next.js hot-reloading would create a new client on every module reload, exhausting the connection pool. The singleton pattern stores the client on the global object so it survives reloads:

```
Development: global.__prisma ?? new PrismaClient()
Production:  new PrismaClient() (module is never hot-reloaded)
```

Import the client from this module everywhere in the codebase:

```typescript
import { prisma } from "@/lib/prisma"
```

---

## Models

### User

The root entity. Every user who registers or signs in via OAuth gets a `User` record.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `email` | String | Unique email address |
| `passwordHash` | String? | bcrypt hash (null for OAuth-only accounts) |
| `name` | String? | Display name |
| `image` | String? | Avatar URL (from Google OAuth) |
| `targetLang` | String? | Target language code (e.g. `"de"`, `"ja"`) |
| `cefrLevel` | CefrLevel? | Proficiency level: A1, A2, B1, B2, C1, C2 |
| `interests` | String[] | User interests for context in prompts |
| `isOnboarded` | Boolean | Whether the user has completed onboarding (default: false) |
| `createdAt` | DateTime | Account creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:** `Account[]`, `Session[]`, `LearningSession[]`, `VocabItem[]`, `PasswordResetToken[]`

---

### Account

Stores OAuth provider credentials. Managed entirely by NextAuth via the PrismaAdapter.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userId` | String | Foreign key → User |
| `type` | String | Provider type (e.g. `"oauth"`) |
| `provider` | String | Provider name (e.g. `"google"`) |
| `providerAccountId` | String | User ID from the provider |
| `access_token` | String? | OAuth access token |
| `refresh_token` | String? | OAuth refresh token |
| `expires_at` | Int? | Token expiry timestamp |
| `token_type` | String? | Token type |
| `scope` | String? | OAuth scopes |
| `id_token` | String? | OIDC ID token |

**Relations:** `User` (cascade delete — deleting a user removes their OAuth accounts)

---

### Session

NextAuth database session records. With JWT strategy these are rarely used directly, but the table must exist for the PrismaAdapter.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `sessionToken` | String | Unique session token |
| `userId` | String | Foreign key → User |
| `expires` | DateTime | Session expiry |

**Relations:** `User` (cascade delete)

---

### VerificationToken

Used by NextAuth for email verification. Not actively used in the current auth flow.

| Field | Type | Description |
|-------|------|-------------|
| `identifier` | String | Email address |
| `token` | String | Verification token |
| `expires` | DateTime | Expiry timestamp |

---

### PasswordResetToken

One-time tokens for the forgot-password flow.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `token` | String | UUID token (unique) |
| `userId` | String | Foreign key → User |
| `expiresAt` | DateTime | Expiry (1 hour from creation) |
| `createdAt` | DateTime | Creation timestamp |

**Relations:** `User` (cascade delete — deleting a user removes their pending reset tokens)

---

### LearningSession

Represents one learning session (a conversation between the user and the AI tutor).

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userId` | String | Foreign key → User |
| `format` | SessionFormat | Session type: REVIEW, VOCABULARY, GRAMMAR, READING, WRITING, SPEAKING |
| `startedAt` | DateTime | Session start timestamp |
| `endedAt` | DateTime? | Session end timestamp (null while active) |
| `score` | Float? | Average exercise score across the session (0–10) |
| `exercisesTotal` | Int | Total number of exercises completed |
| `exercisesCorrect` | Int | Exercises where score ≥ 7 |

**Relations:** `User` (cascade delete), `Exercise[]`

---

### VocabItem

A vocabulary word owned by a user, tracked through the spaced repetition system.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userId` | String | Foreign key → User |
| `term` | String | The word or phrase in the target language |
| `translation` | String | Translation in the user's native language |
| `context` | String? | Example sentence or usage context |
| `repetitions` | Int | Number of successful reviews (SM-2 counter) |
| `easeFactor` | Float | SM-2 ease factor, starts at 2.5, minimum 1.3 |
| `interval` | Int | Days until next review |
| `dueAt` | DateTime | Scheduled next review date |
| `lastScore` | Int? | Grade (0–5) from the most recent review |
| `createdAt` | DateTime | When the item was first added |
| `updatedAt` | DateTime | Last review timestamp |

**Relations:** `User` (cascade delete), `Exercise[]`

---

### Exercise

A single exercise completed within a learning session.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `sessionId` | String | Foreign key → LearningSession |
| `vocabItemId` | String? | Foreign key → VocabItem (nullable — not all exercises are vocab-based) |
| `type` | String | Exercise type description |
| `prompt` | String | The question posed by the tutor |
| `userAnswer` | String | The user's submitted answer |
| `score` | Float | Score awarded (0–10) |
| `feedback` | String | Tutor feedback on the answer |
| `createdAt` | DateTime | Completion timestamp |

**Relations:** `LearningSession` (cascade delete), `VocabItem` (set null on delete — preserving exercise history if vocab is removed)

---

## Enums

### CefrLevel

```
A1 | A2 | B1 | B2 | C1 | C2
```

### SessionFormat

```
REVIEW | VOCABULARY | GRAMMAR | READING | WRITING | SPEAKING
```

---

## Common Query Patterns

**Get a user's due vocabulary items (max 10, sorted by urgency):**
```typescript
await prisma.vocabItem.findMany({
  where: { userId, dueAt: { lte: new Date() } },
  orderBy: { dueAt: "asc" },
  take: 10,
})
```

**Create a new learning session:**
```typescript
await prisma.learningSession.create({
  data: { userId, format, startedAt: new Date(), exercisesTotal: 0, exercisesCorrect: 0 },
})
```

**Update a vocab item after review:**
```typescript
await prisma.vocabItem.update({
  where: { id: vocabItemId },
  data: { repetitions, easeFactor, interval, dueAt, lastScore: grade },
})
```

**Close a session and record scores:**
```typescript
await prisma.learningSession.update({
  where: { id: sessionId },
  data: { endedAt: new Date(), score, exercisesTotal, exercisesCorrect },
})
```

---

## Database Commands

| Command | Description |
|---------|-------------|
| `npx prisma generate` | Regenerate the Prisma client after schema changes |
| `npx prisma db push` | Push the schema to the database (no migration files — used in development) |
| `npx prisma migrate dev` | Create and apply a named migration file (use for production-tracked changes) |
| `npx prisma studio` | Open the visual database browser at `localhost:5555` |
| `npx prisma db pull` | Introspect an existing database and update the schema |

The `npm run build` script runs `prisma generate` automatically before `next build`.

---

## Neon and Connection Pooling

The `DATABASE_URL` must point to Neon's **pooled connection endpoint** (the URL contains `/neondb?pgbouncer=true` or similar). This is required because serverless functions (Vercel) open many short-lived connections; without pooling, the database would exhaust its connection limit quickly.

---

## See Also

- [architecture.md](./architecture.md) — How Prisma is used in Server Component pages
- [srs-algorithm.md](./srs-algorithm.md) — SM-2 fields on VocabItem explained in detail
- [session-flow.md](./session-flow.md) — LearningSession and Exercise creation during a session
- [api-routes.md](./api-routes.md) — Which routes interact with which models
