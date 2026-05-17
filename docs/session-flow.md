# Session Flow

This document describes the complete lifecycle of a learning session in Fluent — from the moment the user picks a session format on the dashboard, through the live AI conversation, all the way to session completion and data persistence.

---

## Overview

A session consists of three phases:

1. **Start** — the user picks a format; a `LearningSession` record is created and due vocabulary items are fetched.
2. **Active** — the user exchanges messages with the AI tutor; exercises are scored and vocabulary items are updated after each exchange.
3. **End** — the session is closed; aggregate stats are calculated and caches are invalidated.

---

## Phase 1: Starting a Session

### Dashboard → SessionPicker

The dashboard page (`src/app/(app)/dashboard/page.tsx`) is a Server Component that fetches the user's profile and renders `SessionPicker`, a Client Component (`src/components/dashboard/SessionPicker.tsx`).

`SessionPicker` displays six format cards (REVIEW, VOCABULARY, GRAMMAR, READING, WRITING, SPEAKING). When the user clicks one, it:

1. Calls POST `/api/session/start` with `{ format }`.
2. Receives `{ session: LearningSession, dueItems: VocabItem[] }`.
3. Stores the session ID and due items in `sessionStorage`.
4. Navigates to `/session`.

### What `/api/session/start` Does

1. Authenticates the user via `auth()`.
2. Creates a `LearningSession` record in the database with `startedAt = now()`, `exercisesTotal = 0`, `exercisesCorrect = 0`.
3. Fetches due vocabulary items:
   - Checks Redis for the key `due_items:{userId}` (cached for 1 hour).
   - On a cache miss, queries Prisma for `VocabItem` records where `dueAt ≤ now`, ordered by `dueAt ASC`, limited to 10.
   - Writes the result to the Redis cache.
4. Returns the session and due items.

---

## Phase 2: Active Session

### ChatWindow Initialization

`ChatWindow` (`src/components/session/ChatWindow.tsx`) is the central Client Component for the session page. On mount:

1. Reads `sessionId` and `dueItems` from `sessionStorage`.
2. Reads saved messages (if any) from `sessionStorage` key `chat_messages_{sessionId}` — this restores state if the user refreshes the tab.
3. Reads the exercise count from `sessionStorage` key `exercise_count_{sessionId}`.

### First Message (Automatic)

If no messages are stored (new session), `ChatWindow` automatically sends the first message to `/api/chat` with an empty user message. This triggers the tutor to produce its opening greeting and first exercise without the user needing to type anything.

### Message Exchange and Streaming

Each time the user submits a message via `InputBar`:

1. The user message is appended to the message list and saved to `sessionStorage`.
2. A POST request is sent to `/api/chat` with the full message history, session format, and session ID.
3. The route handler builds the system prompt via `buildSystemPrompt()`, selects the Claude model, and calls `streamText()`.
4. The response is streamed back as UTF-8 text.
5. `ChatWindow` reads the stream chunk by chunk and updates the current assistant message in real time.
6. The message is rendered through `MarkdownContent` (using Streamdown) for live Markdown display.
7. Auto-scroll to the bottom is managed with a `ResizeObserver`. Manual scroll-up is respected — auto-scroll is suppressed if the user has scrolled up.

### Exercise Scoring

When the assistant message stream ends:

1. `parseScoreFromMessage()` is called on the full message text.
2. If a JSON score block is present, the client:
   - Increments the exercise counter and saves it to `sessionStorage`.
   - Updates the `ProgressBar` component to show the new exercise count.
   - POSTs to `/api/vocab/review` with `{ vocabItemId, score, feedback, vocabTerm }`.
3. `/api/vocab/review`:
   - Converts the score to a grade (0–5) using `gradeFromScore()`.
   - Calls `calculateNextReview()` to compute the new SM-2 values.
   - Updates the `VocabItem` in the database.
   - If the `vocabTerm` is new (not found in existing items), creates a new `VocabItem`.
   - Adds an `Exercise` record linked to the session and the vocab item.

---

## Phase 3: Ending a Session

The session ends when:

- The user clicks the "End session" button in the UI, or
- The exercise counter reaches the configured maximum (typically 10).

`ChatWindow` calls POST `/api/session/end` with `{ sessionId }`.

### What `/api/session/end` Does

1. Authenticates the user and validates that the session belongs to them.
2. Queries all `Exercise` records for this session.
3. Calculates:
   - `exercisesTotal` — count of all exercises
   - `exercisesCorrect` — count of exercises where `score ≥ 7`
   - `score` — arithmetic mean of all exercise scores
4. Updates the `LearningSession` record: sets `endedAt = now()`, `score`, `exercisesTotal`, `exercisesCorrect`.
5. Invalidates two Redis cache keys:
   - `due_items:{userId}` — so the next session reflects updated due dates
   - `progress:{userId}` — so the progress page reflects the completed session
6. Returns the updated session.

After receiving the response, `ChatWindow` clears all `sessionStorage` keys for this session and navigates to `/dashboard`.

---

## Session Persistence via sessionStorage

`sessionStorage` (not `localStorage`) is used intentionally — it is scoped to the browser tab, so two different sessions in different tabs don't interfere with each other.

| Key                          | Value                                  | Purpose                                      |
| ---------------------------- | -------------------------------------- | -------------------------------------------- |
| `active_session`             | JSON `{ sessionId, format, dueItems }` | Active session metadata                      |
| `chat_messages_{sessionId}`  | JSON array of messages                 | Full message history for recovery on refresh |
| `exercise_count_{sessionId}` | Number string                          | Current exercise count for the progress bar  |

All keys are cleared when the session ends.

---

## Session Formats Compared

| Format     | AI behavior                                                         | Primary skill trained           |
| ---------- | ------------------------------------------------------------------- | ------------------------------- |
| REVIEW     | Cycles through due words: translation → back-translation → sentence | Long-term vocabulary retention  |
| VOCABULARY | New words in context, fill-in-the-blank, multiple choice            | Vocabulary acquisition          |
| GRAMMAR    | Fill-the-gap, error correction, sentence transformation             | Grammar accuracy                |
| READING    | Short text followed by a comprehension question                     | Reading comprehension           |
| WRITING    | Free writing prompt with detailed feedback                          | Writing fluency                 |
| SPEAKING   | Open dialogue with gentle corrections                               | Speaking confidence and fluency |

---

## See Also

- [ai-integration.md](./ai-integration.md) — System prompt building and score parsing
- [srs-algorithm.md](./srs-algorithm.md) — How scores drive vocabulary scheduling
- [caching.md](./caching.md) — Redis cache keys used during session start and end
- [api-routes.md](./api-routes.md) — Full specification for session and vocab endpoints
- [components.md](./components.md) — ChatWindow, SessionPicker, and related component details
