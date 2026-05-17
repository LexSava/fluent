# Architecture

This document describes the overall structure of the Fluent application — how the Next.js App Router is organized, when Server vs Client Components are used, how data moves through the system, and how routes are protected.

---

## Next.js App Router and Route Groups

The `src/app/` directory uses route groups to enforce a clear separation between public and authenticated areas.

```
src/app/
├── (auth)/              # Public pages — no authentication required
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   └── layout.tsx       # Minimal layout (centered card, no sidebar)
├── (app)/               # Protected pages — requires valid session
│   ├── dashboard/
│   ├── progress/
│   ├── session/
│   ├── settings/
│   └── layout.tsx       # Full app shell (header + sidebar)
├── api/                 # REST API route handlers
├── onboarding/          # Post-signup onboarding wizard (auth required)
├── layout.tsx           # Root layout — providers, theme, global styles
└── page.tsx             # Root redirect (/ → /dashboard or /login)
```

Route group names in parentheses (`(auth)`, `(app)`) do not appear in URLs. They exist solely to share layouts and to logically separate concerns.

---

## Server Components vs Client Components

The project follows a strict pattern: **pages fetch data, components render it**.

### Server Components (default in App Router)

Pages inside `(app)/` are Server Components. They:
- Call Prisma directly to fetch data
- Call `auth()` from `src/lib/auth.ts` to get the session
- Pass fetched data down as props to Client Components
- Never include event handlers or browser-only APIs

This keeps data fetching close to the database, avoids unnecessary API round-trips from the server side, and minimises the amount of JavaScript shipped to the browser.

### Client Components (`"use client"`)

All files under `src/components/` are Client Components. They:
- Carry the `"use client"` directive at the top
- Handle interactivity: form submissions, chat streaming, chart rendering, animations
- May use React hooks (`useState`, `useEffect`, `useRef`)
- Receive initial data from their parent Server Component pages via props

The boundary is: a Server Component page fetches data and passes it to a Client Component for rendering and interaction.

---

## Folder Structure

```
src/
├── app/                   # Next.js App Router — pages and API routes
├── components/
│   ├── auth/              # Login, register, forgot/reset password forms
│   ├── dashboard/         # Stat cards, session picker, streak badge, active session banner
│   ├── layout/            # Header, sidebar, theme provider, context providers wrapper
│   ├── onboarding/        # Language selector, onboarding step UI
│   ├── progress/          # Accuracy ring, stats chart, streak calendar, vocabulary list
│   ├── session/           # Chat window, message bubbles, input bar, answer options
│   └── ui/                # Shared primitives: Button, Input, Card, Badge, Avatar, etc.
├── hooks/
│   └── useTypewriter.ts   # Typewriter animation for streaming text
├── lib/                   # Server-side utilities and business logic
│   ├── ai.ts              # System prompt builder and score parser
│   ├── auth.ts            # NextAuth configuration and session helpers
│   ├── auth.config.ts     # NextAuth pages and base config
│   ├── prisma.ts          # Prisma client singleton
│   ├── progress.ts        # Progress data aggregation queries
│   ├── redis.ts           # Upstash Redis helpers
│   ├── resend.ts          # Email sending via Resend
│   ├── srs.ts             # SM-2 spaced repetition algorithm
│   ├── utils.ts           # Shared utilities (cn(), etc.)
│   └── validations/       # Zod validation schemas for all forms
├── types/
│   ├── session.ts         # SessionFormat enum, Exercise, ChatMessage
│   ├── user.ts            # CefrLevel enum, supported languages, UserProfile
│   └── vocab.ts           # ReviewGrade, VocabItem, SrsResult
└── __mocks__/             # Jest mocks for Streamdown and Framer Motion
```

---

## How Data Flows Through the Application

A typical request follows this path:

```
Browser
  │
  ├─ Page request (GET /dashboard)
  │    └─ Server Component (app/(app)/dashboard/page.tsx)
  │         ├─ auth() → session
  │         ├─ prisma.user.findUnique() → user data
  │         └─ Renders Client Components with data as props
  │
  └─ API request (POST /api/chat)
       └─ Route handler (app/api/chat/route.ts)
            ├─ auth() → session (guards the route)
            ├─ Reads body (messages, sessionId, format)
            ├─ buildSystemPrompt() → system prompt string
            ├─ streamText({ model, system, messages })
            └─ Returns streaming text response
```

For mutations (vocab review, session end):

```
Client Component
  └─ fetch("/api/vocab/review", { method: "POST", body: ... })
       └─ Route handler
            ├─ auth() → session
            ├─ Validates body
            ├─ calculateNextReview() → SRS result
            ├─ prisma.vocabItem.update() → persist
            └─ invalidateCache("progress:{userId}")
```

---

## Middleware and Route Protection

The application does not use a `middleware.ts` file for route protection. Instead, protection is applied at two levels:

**Server Component pages** call `auth()` at the top and redirect to `/login` if no session is present:
```
const session = await auth()
if (!session) redirect("/login")
```

**API route handlers** also call `auth()` and return a 401 response if unauthenticated:
```
const session = await auth()
if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })
```

**Onboarding enforcement** is handled via the `isOnboarded` flag embedded in the JWT token. After sign-in, if `isOnboarded` is false, the user is redirected to `/onboarding` before they can access any `(app)/` page.

This approach keeps protection co-located with the data fetching rather than in a centralised middleware file, which makes each route's access requirements explicit and easier to reason about.

---

## See Also

- [authentication.md](./authentication.md) — Session strategy and provider setup
- [api-routes.md](./api-routes.md) — All API route handlers with parameters
- [components.md](./components.md) — Component breakdown by folder
- [database.md](./database.md) — Prisma models and data access patterns
