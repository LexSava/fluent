# Testing

This document describes the testing setup in Fluent — how to run tests, what is tested, how to write new tests, and what is mocked.

---

## Test Stack

| Tool | Version | Role |
|------|---------|------|
| Jest | 30.x | Test runner and assertion library |
| React Testing Library | 16.x | Component rendering and interaction |
| jest-dom | Latest | Additional DOM matchers (e.g. `toBeInTheDocument`) |
| jsdom | Built into Jest | Browser environment simulation |

---

## Running Tests

| Command | Description |
|---------|-------------|
| `npm run test` | Run all tests once and exit |
| `npm run test:watch` | Run tests in watch mode (re-runs on file change) |
| `npm run test:coverage` | Run all tests with coverage report (output to `coverage/`) |

Coverage reports are uploaded as artifacts in CI (7-day retention).

---

## Configuration

**`jest.config.js`** at the project root defines:

- `testEnvironment: "jsdom"` — simulates a browser environment for component tests
- Module name mappings:
  - `@/` → `<rootDir>/src/` — resolves the TypeScript path alias
  - `streamdown` → `src/__mocks__/streamdown.tsx` — mocks the Streamdown library
  - `framer-motion` → `src/__mocks__/framer-motion.tsx` — mocks Framer Motion

**`jest.setup.ts`** imports `@testing-library/jest-dom` to extend Jest's `expect` with DOM matchers.

---

## What Is Tested

### Unit Tests

**`src/lib/__tests__/srs.test.ts`** — The most important unit test file. Covers the SM-2 algorithm in `src/lib/srs.ts`:

- Grade < 3 resets `repetitions` to 0 and `interval` to 1
- Grade ≥ 3 increments `repetitions` and increases `interval`
- `easeFactor` is correctly updated by the formula
- `easeFactor` never drops below 1.3 (hard minimum)
- `dueAt` is always in the future after any review
- `gradeFromScore()` maps score ranges (0–10) to grades (0–5) correctly

**`src/lib/__tests__/utils.test.ts`** — Utility function tests (e.g. the `cn()` classname merger).

**`src/lib/__tests__/validations.test.ts`** — Zod schema validation tests:
- Valid email/password combinations pass
- Weak passwords fail with the correct error messages
- Missing fields produce the expected errors

### Component Tests

Component tests use React Testing Library to render components and assert on DOM output.

**`src/components/auth/__tests__/`**
- LoginForm renders the email and password fields
- RegisterForm shows validation errors on empty submission
- PasswordStrengthIndicator shows the correct strength level

**`src/components/dashboard/__tests__/`**
- StatCard renders the value and label
- SessionPicker renders all six format cards

**`src/components/layout/__tests__/`**
- Header renders the app logo and navigation links
- Sidebar highlights the active route

**`src/components/session/__tests__/`**
- MessageBubble renders user and assistant messages with correct styles
- InputBar calls `onSubmit` when the form is submitted
- ProgressBar shows the correct progress ratio

**`src/components/progress/__tests__/`**
- AccuracyRing renders with the correct percentage
- VocabList renders the vocabulary item terms

**`src/components/ui/__tests__/`**
- Button renders with the correct variant class
- Input shows an error message when `error` prop is set

---

## What Is Not Tested

- API route handlers — no integration tests against the actual database or Anthropic API
- The full streaming chat flow — too complex to test in jsdom without extensive mocking
- Prisma queries directly — tested implicitly via API tests (not yet implemented)
- Vercel AI SDK `streamText` — would require mocking the Anthropic provider

The focus is on pure logic (SRS algorithm, validation) and component rendering. End-to-end tests (Playwright or Cypress) are not currently part of the project.

---

## Mocks

### `src/__mocks__/streamdown.tsx`

Streamdown uses browser APIs and is difficult to run in jsdom. The mock replaces it with a simple `<div>` that renders the markdown text content as plain text. This is sufficient for testing that the component receives and passes content correctly.

### `src/__mocks__/framer-motion.tsx`

Framer Motion's animations trigger warnings in jsdom and slow down tests. The mock replaces `motion.*` elements with their HTML equivalents (e.g. `motion.div` becomes a plain `<div>`) and makes `AnimatePresence` a passthrough wrapper. Animation props (`initial`, `animate`, `exit`) are silently ignored.

### Mocking NextAuth in Component Tests

Components that use `useSession` require the `SessionProvider` context. In tests, wrap the component with a mock `SessionProvider`:

```typescript
import { SessionProvider } from "next-auth/react"

render(
  <SessionProvider session={{ user: { id: "1", name: "Test" }, expires: "2099-01-01" }}>
    <ComponentUnderTest />
  </SessionProvider>
)
```

### Mocking Prisma

If you need to test logic that calls Prisma, use `jest.mock("@/lib/prisma")` and provide mock return values:

```typescript
jest.mock("@/lib/prisma", () => ({
  prisma: {
    vocabItem: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}))
```

---

## Writing New Tests

### For a new utility function in `src/lib/`

1. Create `src/lib/__tests__/<filename>.test.ts`.
2. Import the function directly.
3. Write `describe` and `it` blocks covering the happy path and edge cases.
4. Do not mock anything unless the function calls external services.

### For a new React component

1. Create `src/components/<folder>/__tests__/<ComponentName>.test.tsx`.
2. Use `render()` from `@testing-library/react`.
3. Assert on visible text, roles, and attributes — not on class names or implementation details.
4. Use `screen.getByRole`, `screen.getByText`, `screen.getByLabelText` as the primary query methods.
5. Use `userEvent` (from `@testing-library/user-event`) for simulating user interactions.

### Example test structure

```typescript
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MyComponent } from "../MyComponent"

describe("MyComponent", () => {
  it("renders the title", () => {
    render(<MyComponent title="Hello" />)
    expect(screen.getByText("Hello")).toBeInTheDocument()
  })

  it("calls onSubmit when the button is clicked", async () => {
    const handleSubmit = jest.fn()
    render(<MyComponent onSubmit={handleSubmit} />)
    await userEvent.click(screen.getByRole("button", { name: /submit/i }))
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
})
```

---

## See Also

- [architecture.md](./architecture.md) — Project structure and module locations
- [srs-algorithm.md](./srs-algorithm.md) — The algorithm covered by the most important unit tests
- [deployment.md](./deployment.md) — CI pipeline that runs the test suite
