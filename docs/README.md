# Fluent Developer Documentation

Fluent is an AI-powered language tutoring web application. It combines real-time Claude streaming chat, a spaced repetition vocabulary system, and structured learning sessions to help users acquire foreign languages. This directory contains technical documentation for developers working on the project.

---

## Contents

| File | Description |
|------|-------------|
| [architecture.md](./architecture.md) | App Router structure, folder layout, data flow, and middleware |
| [authentication.md](./authentication.md) | NextAuth v5 setup, providers, session strategy, registration and password reset |
| [database.md](./database.md) | All Prisma models with fields and relations, Prisma client usage, and DB commands |
| [ai-integration.md](./ai-integration.md) | Claude API integration, model selection, system prompt, streaming, and response parsing |
| [srs-algorithm.md](./srs-algorithm.md) | SM-2 spaced repetition algorithm, formulas, grade mapping, and vocabulary lifecycle |
| [session-flow.md](./session-flow.md) | Complete learning session lifecycle from start to end, including client-side state |
| [caching.md](./caching.md) | Upstash Redis caching, cache keys, TTLs, invalidation, and rate limiting |
| [api-routes.md](./api-routes.md) | All API endpoints with methods, parameters, response formats, and error codes |
| [components.md](./components.md) | All React components grouped by folder with props, hooks, and component relationships |
| [design-system.md](./design-system.md) | CSS variables, typography scale, component rules, theme switching, and Tailwind utilities |
| [testing.md](./testing.md) | Test setup, running tests, patterns, mocks, and coverage |
| [deployment.md](./deployment.md) | Vercel deployment, CI/CD pipeline, environment variables, and production configuration |

---

## Getting Started as a New Developer

Read the documents in this order to build a complete mental model of the project:

1. **[architecture.md](./architecture.md)** — Start here. Understand the overall structure, what lives where, and how a request flows through the app.
2. **[authentication.md](./authentication.md)** — Learn how users sign in, how sessions work, and which routes are protected.
3. **[database.md](./database.md)** — Understand all data models and their relationships before touching any business logic.
4. **[session-flow.md](./session-flow.md)** — The learning session is the core product feature. Read this to understand the full user journey from start to finish.
5. **[ai-integration.md](./ai-integration.md)** — See how Claude is called, how the system prompt is built, and how the tutor's responses are parsed.
6. **[srs-algorithm.md](./srs-algorithm.md)** — Understand the spaced repetition logic that drives vocabulary scheduling.
7. **[caching.md](./caching.md)** — Learn what is cached and why, so you know when to invalidate.
8. **[api-routes.md](./api-routes.md)** — Reference for all backend endpoints.
9. **[components.md](./components.md)** — Reference for the component library when working on the frontend.
10. **[design-system.md](./design-system.md)** — Read before touching any styles or building new UI.
11. **[testing.md](./testing.md)** — Read when you need to write or run tests.
12. **[deployment.md](./deployment.md)** — Read when setting up the project locally or managing production secrets.
