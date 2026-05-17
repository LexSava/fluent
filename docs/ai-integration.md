# AI Integration

This document explains how the Anthropic Claude API is integrated into Fluent — model selection, how the system prompt is built, how streaming works, and how the tutor's scored responses are parsed.

---

## Overview

The AI integration uses two packages:

- `@ai-sdk/anthropic` — Anthropic provider adapter for the Vercel AI SDK
- `ai` — Vercel AI SDK core (`streamText`, message types)

All AI calls go through a single route handler at `src/app/api/chat/route.ts`. The business logic (prompt building, model selection, parsing) lives in `src/lib/ai.ts`.

---

## Model Selection

Two Claude models are used depending on the session format:

| Session Formats              | Model                       | Reason                                                                           |
| ---------------------------- | --------------------------- | -------------------------------------------------------------------------------- |
| GRAMMAR, READING, WRITING    | `claude-sonnet-4-6`         | Complex reasoning: grammar correction, reading comprehension, writing evaluation |
| VOCABULARY, REVIEW, SPEAKING | `claude-haiku-4-5-20251001` | Fast, low-latency responses; simpler tasks that don't need deep reasoning        |

This keeps costs low for the majority of sessions while using a more capable model where quality matters most.

---

## Streaming with Vercel AI SDK

The `/api/chat` route handler:

1. Reads the incoming message history, session format, and session ID from the request body.
2. Fetches the user profile and due vocabulary items (from Redis cache or database).
3. Calls `buildSystemPrompt()` to construct the full system prompt.
4. Calls `streamText({ model, system, messages, maxOutputTokens: 1024 })`.
5. Returns `.toTextStreamResponse()` — a plain UTF-8 stream.

The client-side `ChatWindow` component consumes this stream incrementally and renders each chunk as it arrives using the Streamdown library, producing a live typewriter effect.

The `maxOutputTokens` cap of 1024 prevents runaway responses and keeps latency predictable.

---

## System Prompt Structure (`buildSystemPrompt`)

The function `buildSystemPrompt(profile: UserProfile, dueItems: VocabItem[], format: SessionFormat)` in `src/lib/ai.ts` assembles the system prompt that governs the tutor's entire behavior during a session.

The prompt has these sections, in order:

### 1. Role Definition

Identifies the AI as an AI tutor in the Fluent application. Sets the persona and overall goal.

### 2. Student Profile

Injects the learner's details:

- Target language (e.g., German, Japanese)
- CEFR proficiency level (A1–C2)
- Interests (used to contextualize exercises — a user interested in cooking might see food-related sentences)

### 3. Vocabulary List

A numbered list of due vocabulary items. Each entry includes the term, translation, and context sentence if available. These are the words the tutor should prioritize during the session.

### 4. Format-Specific Instructions

Each `SessionFormat` has a dedicated instruction block:

| Format     | Tutor behavior                                                          |
| ---------- | ----------------------------------------------------------------------- |
| REVIEW     | Rotate between: translate word → translate back → use in sentence       |
| VOCABULARY | Introduce new words in context, fill-in-the-blank, multiple choice      |
| GRAMMAR    | Fill-the-gap, error correction, sentence transformations                |
| READING    | Present a 3–5 sentence text, then ask a comprehension question          |
| WRITING    | Ask the user to write 2–4 sentences freely, then give detailed feedback |
| SPEAKING   | Free dialogue with gentle corrections                                   |

### 5. Behavioral Rules

Hard constraints the model must follow:

- Present **one exercise at a time**
- The **first message must not contain a JSON block** — only a greeting and the first exercise
- A JSON score block must appear **only after the user has answered**
- The JSON block must be at the **end of the message**
- Respond to the user **in Russian** (UI language); exercises are in the target language
- Adapt difficulty to the user's CEFR level
- Never announce the end of a session — the app controls session termination
- Multiple-choice options use the format: A), B), C)

---

## JSON Score Block Format

After the user answers an exercise, the tutor appends a fenced JSON block at the end of its response:

```json
{
  "score": 8,
  "feedback": "Good job! The word order is correct. A small note: ...",
  "correct": true,
  "vocabTerm": "Schlüssel"
}
```

| Field       | Type          | Description                                          |
| ----------- | ------------- | ---------------------------------------------------- |
| `score`     | Number (0–10) | How well the user answered the exercise              |
| `feedback`  | String        | Explanation and correction (in Russian)              |
| `correct`   | Boolean       | Whether the answer is considered passing (score ≥ 5) |
| `vocabTerm` | String?       | The vocabulary word being tested (if applicable)     |

The JSON is enclosed in a fenced code block (` ```json ... ``` `) so it is visually distinct in the rendered markdown and easy to parse with a regex.

---

## Parsing the Score (`parseScoreFromMessage`)

The function `parseScoreFromMessage(text: string)` in `src/lib/ai.ts` extracts the JSON score block from the tutor's raw message text.

The process:

1. A regex `/```json\s*([\s\S]*?)\s*```/` is applied to the full message text.
2. If a match is found, the captured group is parsed with `JSON.parse()`.
3. The `score` value is clamped to the range 0–10.
4. The function returns a partial `Exercise` object (score, feedback, vocabTerm) or `null` if no JSON block is present.

`null` is expected for the first message (greeting + first exercise) and for any streaming chunk that does not yet include the closing fence.

The client calls this after the stream completes for a given assistant message, then POSTs the result to `/api/vocab/review` to persist the grade and update the SM-2 schedule.

---

## Rate Limiting

The `/api/chat` route is protected by rate limiting using Upstash Redis. Each user is allowed a fixed number of requests per minute. Requests that exceed the limit receive an HTTP 429 response.

This prevents accidental or intentional API abuse and controls costs on the Anthropic side.

---

## See Also

- [session-flow.md](./session-flow.md) — How the chat route is called within the session lifecycle
- [srs-algorithm.md](./srs-algorithm.md) — How `score` from the JSON block maps to an SM-2 grade
- [caching.md](./caching.md) — Redis rate limiting and due-items cache used by the chat route
- [api-routes.md](./api-routes.md) — `/api/chat` request and response specification
