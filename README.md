# Fluent — AI Language Tutor

Fluent is a web application that helps users learn foreign languages through AI-powered conversational tutoring. It combines structured learning sessions with a spaced repetition system to build vocabulary retention, tracks progress over time, and adapts to the learner's level and interests using Claude as the AI backbone.

## Live Demo

https://fluent-ai-web.vercel.app

## Features

- **Authentication** — email/password registration with password reset flow, Google OAuth via NextAuth.js v5
- **Onboarding flow** — guided setup for target language (8 languages), CEFR level (A1–C2), and personal interests
- **AI-powered chat tutor** — real-time streaming responses from Claude (Sonnet for complex tasks, Haiku for lightweight formats)
- **Multiple session formats** — Vocabulary, Grammar, Reading, Writing, Speaking, and Review
- **Spaced repetition system** — SM-2 algorithm schedules vocabulary reviews based on recall quality
- **Progress tracking and statistics** — streak calendar, accuracy ring, session history charts
- **Vocabulary management** — due-item cache via Redis, per-item review history
- **Dark/light theme** — system-aware via next-themes, togglable manually

## Tech Stack

| Category | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| UI Components | shadcn/ui, Framer Motion, Lucide React, Recharts |
| Markdown | Streamdown (streaming-optimised React renderer) |
| AI Integration | Anthropic Claude API (`@ai-sdk/anthropic`), Vercel AI SDK |
| Authentication | NextAuth.js v5 (`next-auth@beta`) |
| Database | PostgreSQL (Neon), Prisma ORM v7 |
| Caching | Upstash Redis |
| Email | Resend |
| Deployment | Vercel |
| Testing | Jest, React Testing Library |
| Code Quality | ESLint, Prettier, Husky, lint-staged |

## Architecture

### Next.js App Router structure

The project uses route groups to separate concerns:

```
src/app/
  (auth)/          # Public auth pages — login, register, password reset
  (app)/           # Protected app pages — dashboard, session, progress, settings
  api/             # Route handlers for all backend logic
  onboarding/      # Onboarding wizard (requires auth, redirected after sign-in)
```

### Server vs Client components

Pages in `(app)/` are Server Components that fetch data directly via Prisma. Interactive UI (chat window, session picker, charts) is extracted into `"use client"` components under `src/components/`. This keeps the data-fetching layer server-side and limits client bundle size.

### API routes pattern

All mutations and AI calls go through `src/app/api/` route handlers. The chat endpoint at `/api/chat` is the main AI integration point — it reads the session format, builds a system prompt, selects the appropriate Claude model, and streams the response back using `streamText` from the Vercel AI SDK.

### SRS algorithm (SM-2)

`src/lib/srs.ts` implements the SuperMemo 2 algorithm. Each vocabulary item stores `repetitions`, `easeFactor`, and `interval`. After each review, the ease factor is adjusted based on the recall grade (0–5), and the next review date is scheduled accordingly. Items graded below 3 reset to interval 1.

### Streaming chat

The `/api/chat` route uses `streamText` from `ai` and returns `.toTextStreamResponse()`. The client-side `ChatWindow` component consumes the stream incrementally and renders it through Streamdown for live Markdown display.

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database ([Neon](https://neon.tech) recommended)
- Anthropic API key
- Google OAuth credentials
- Upstash Redis instance
- Resend API key

### Environment Variables

Create a `.env.local` file at the project root:

```env
DATABASE_URL=              # Neon PostgreSQL connection string
ANTHROPIC_API_KEY=         # From console.anthropic.com
NEXTAUTH_SECRET=           # Random string: openssl rand -base64 32
NEXTAUTH_URL=              # http://localhost:3000 for local dev
GOOGLE_CLIENT_ID=          # From Google Cloud Console
GOOGLE_CLIENT_SECRET=      # From Google Cloud Console
UPSTASH_REDIS_REST_URL=    # From Upstash dashboard
UPSTASH_REDIS_REST_TOKEN=  # From Upstash dashboard
RESEND_API_KEY=            # From resend.com
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/fluent.git
cd fluent

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in the values above

# 4. Run database migrations
npx prisma db push

# 5. Start the development server
npm run dev
```

### Database Setup

```bash
npx prisma generate   # Generate the Prisma client
npx prisma db push    # Push the schema to the database
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Generate Prisma client and build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format all files with Prettier |
| `npm run test` | Run the Jest test suite |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
src/
  app/                    # Next.js App Router — pages and API routes
  components/
    auth/                 # Login, register, forgot/reset password forms
    dashboard/            # Stat cards, session picker, streak badge
    layout/               # Header, sidebar, theme provider, providers wrapper
    onboarding/           # Language selector, onboarding step UI
    progress/             # Accuracy ring, stats chart, streak calendar, vocab list
    session/              # Chat window, message bubbles, input bar, answer options
    ui/                   # Shared primitives (Avatar, etc.)
  hooks/                  # useTypewriter
  lib/                    # Server-side utilities
    ai.ts                 # System prompt builder
    auth.ts               # NextAuth configuration and session helpers
    prisma.ts             # Prisma client singleton
    progress.ts           # Progress aggregation queries
    redis.ts              # Upstash Redis helpers for due-item cache
    resend.ts             # Email sending via Resend
    srs.ts                # SM-2 spaced repetition algorithm
    utils.ts              # Shared utilities (cn, etc.)
    validations/          # Zod schemas for all forms
  prisma/                 # Prisma schema
  types/                  # TypeScript types and enums (session, user, vocab)
  __mocks__/              # Jest mocks for framer-motion and streamdown
```

## CI/CD

GitHub Actions runs on every push and pull request to `main` via `.github/workflows/ci.yml`.

### Pipeline jobs

1. **code-quality** — installs dependencies, runs ESLint, checks Prettier formatting, and runs `tsc --noEmit`
2. **test** — runs the full Jest test suite with coverage; uploads the coverage report as an artifact (7-day retention)
3. **build** — runs `npm run build` (includes `prisma generate`) against all production secrets to verify the build succeeds

The `test` job requires `code-quality` to pass; `build` requires `test` to pass.

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `NEXTAUTH_SECRET` | NextAuth secret |
| `NEXTAUTH_URL` | Deployed application URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `RESEND_API_KEY` | Resend API key |

## Contributing

### Commit message format

All commits must use a prefix in present tense, max 72 characters:

| Prefix | When to use |
|---|---|
| `init:` | Starting a project or new functionality |
| `feat:` | New feature visible to the user |
| `fix:` | Bug fix affecting the user |
| `refactor:` | Code restructuring without changing functionality |
| `chore:` | Maintenance tasks (dependencies, config, cleanup) |
| `docs:` | Documentation changes |
| `style:` | Formatting and code style only (no logic changes) |
| `perf:` | Performance improvements |
| `vendor:` | Dependency updates |
| `test:` | Adding or modifying tests |
| `minor:` | Small changes with negligible impact |

### Branch naming

```
feature/short-description
fix/short-description
chore/short-description
```

## License

MIT
