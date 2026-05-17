# Components

This document describes all React components in `src/components/`, grouped by folder. Each entry includes the component's purpose, props, Server/Client designation, hooks used, and relationships with other components.

All components in this project are **Client Components** and carry the `"use client"` directive. Data is passed down from Server Component pages via props.

---

## `ui/` — Shared Primitives

### `Button`

A styled button element supporting multiple visual variants.

| Prop        | Type                                  | Description                    |
| ----------- | ------------------------------------- | ------------------------------ |
| `variant`   | `"primary" \| "secondary" \| "ghost"` | Visual style                   |
| `size`      | `"sm" \| "md" \| "lg"`                | Size preset                    |
| `disabled`  | Boolean                               | Disables and styles the button |
| `className` | String                                | Additional Tailwind classes    |

**Relationships:** Used throughout all other component folders.

---

### `Input`

A styled text input following the design system (flat, border-focus, no shadow).

| Prop          | Type    | Description                         |
| ------------- | ------- | ----------------------------------- |
| `placeholder` | String  | Placeholder text                    |
| `type`        | String  | Input type (text, email, password)  |
| `error`       | String? | Error message shown below the input |
| `className`   | String  | Additional Tailwind classes         |

**Relationships:** Used by all auth forms and settings forms.

---

### `Card`

A container with the standard card style (bg-card, 1px border, radius-md).

| Prop        | Type      | Description                 |
| ----------- | --------- | --------------------------- |
| `className` | String    | Additional Tailwind classes |
| `children`  | ReactNode | Card content                |

---

### `Badge`

A small label with colored background and text, used for tags and status indicators.

| Prop       | Type                                             | Description |
| ---------- | ------------------------------------------------ | ----------- |
| `variant`  | `"default" \| "success" \| "error" \| "warning"` | Color theme |
| `children` | ReactNode                                        | Badge text  |

---

### `Avatar`

Displays a user avatar image with a fallback to initials.

| Prop   | Type                   | Description                            |
| ------ | ---------------------- | -------------------------------------- |
| `src`  | String?                | Image URL                              |
| `name` | String                 | User name (used for initials fallback) |
| `size` | `"sm" \| "md" \| "lg"` | Size preset                            |

**Relationships:** Used in `Header` and settings page.

---

### `ThemeToggle`

A button that toggles between dark and light themes.

**Hooks:** `useTheme` from `next-themes`  
**Relationships:** Used in `Header`.

---

### `ConfirmModal`

A modal dialog that asks for confirmation before a destructive action.

| Prop        | Type     | Description                   |
| ----------- | -------- | ----------------------------- |
| `isOpen`    | Boolean  | Controls visibility           |
| `onConfirm` | Function | Called when the user confirms |
| `onCancel`  | Function | Called when the user cancels  |
| `title`     | String   | Modal title                   |
| `message`   | String   | Description of the action     |

---

## `auth/` — Authentication Forms

### `LoginForm`

Email and password login form. Calls `signIn("credentials", ...)` from NextAuth.

**Hooks:** `useState`, `useRouter`  
**Relationships:** Renders `Input`, `Button`, `PasswordStrengthIndicator` is not used here.

---

### `RegisterForm`

Registration form with email, password, and password confirmation fields.

**Hooks:** `useState`, `useRouter`  
**Relationships:** Renders `Input`, `Button`, `PasswordStrengthIndicator`. On success, calls `signIn("credentials", ...)` directly.

---

### `PasswordStrengthIndicator`

Shows a visual progress bar indicating password strength based on which requirements are met (length, uppercase, lowercase, digit, special character).

| Prop       | Type   | Description                            |
| ---------- | ------ | -------------------------------------- |
| `password` | String | The current password value to evaluate |

**Relationships:** Rendered inside `RegisterForm`.

---

### `ForgotPasswordForm`

Single email field form. POSTs to `/api/auth/forgot-password`.

**Hooks:** `useState`  
**Relationships:** Renders `Input`, `Button`.

---

### `ResetPasswordForm`

New password and confirm password form. Reads the token from the URL query string and POSTs to `/api/auth/reset-password`.

**Hooks:** `useState`, `useSearchParams`, `useRouter`  
**Relationships:** Renders `Input`, `Button`, `PasswordStrengthIndicator`.

---

## `layout/` — App Shell

### `Providers`

Wraps the application with all required React context providers: `SessionProvider` (NextAuth) and `ThemeProvider`.

| Prop       | Type      | Description |
| ---------- | --------- | ----------- |
| `children` | ReactNode | App content |

**Relationships:** Rendered in the root `layout.tsx`. All other components are descendants.

---

### `ThemeProvider`

Wraps content with the `next-themes` provider. Sets `attribute="class"` so Tailwind dark mode works via the class strategy.

| Prop       | Type      | Description |
| ---------- | --------- | ----------- |
| `children` | ReactNode | App content |

**Relationships:** Rendered inside `Providers`.

---

### `Header`

Top navigation bar. Displays the app logo, current page title, and user controls (avatar, theme toggle).

**Hooks:** `useSession`, `usePathname`  
**Relationships:** Uses `Avatar`, `ThemeToggle`. Rendered in the `(app)` layout.

---

### `Sidebar`

Left side navigation menu with links to Dashboard, Progress, and Settings.

**Hooks:** `usePathname` (to highlight the active link)  
**Relationships:** Rendered in the `(app)` layout alongside `Header`.

---

## `dashboard/` — Dashboard Components

### `StatCard`

Displays a single progress metric: a large number, a label, and an optional trend indicator.

| Prop    | Type             | Description                               |
| ------- | ---------------- | ----------------------------------------- |
| `label` | String           | Metric name (e.g. "Words due")            |
| `value` | String \| Number | The primary value to display              |
| `icon`  | ReactNode        | Icon component                            |
| `trend` | String?          | Optional trend text (e.g. "+3 this week") |

**Relationships:** Rendered multiple times on the dashboard page.

---

### `SessionPicker`

Grid of six session format cards. Each card shows the format name, description, and a start button.

| Prop       | Type   | Description                                                     |
| ---------- | ------ | --------------------------------------------------------------- |
| `dueCount` | Number | Number of vocabulary items due today (shown on the REVIEW card) |

**Hooks:** `useState`, `useRouter`  
**Relationships:** POSTs to `/api/session/start`, then navigates to `/session`. Renders `Button`.

---

### `StreakBadge`

Displays the user's current streak count with a flame icon.

| Prop     | Type   | Description            |
| -------- | ------ | ---------------------- |
| `streak` | Number | Current streak in days |

---

### `ActiveSessionBanner`

A dismissible banner shown when the user has an unfinished session stored in `sessionStorage`.

**Hooks:** `useState`, reads `sessionStorage` on mount  
**Relationships:** Renders a `Button` to resume the session.

---

## `session/` — Learning Session Components

### `ChatWindow`

The main session component. Manages the full conversation: streaming, message history, exercise scoring, and session persistence.

| Prop          | Type          | Description               |
| ------------- | ------------- | ------------------------- |
| `sessionId`   | String        | Active session ID         |
| `format`      | SessionFormat | Session format            |
| `userProfile` | UserProfile   | Used to display user info |

**Hooks:** `useState`, `useEffect`, `useRef` (for scroll container), `ResizeObserver` (for auto-scroll), `useTypewriter`  
**What it does:**

- Reads and writes message history to `sessionStorage`
- Sends messages to `/api/chat` and streams the response
- Calls `parseScoreFromMessage()` after each complete assistant message
- POSTs to `/api/vocab/review` when a score block is detected
- Calls `/api/session/end` when the session is finished

**Relationships:** Renders `MessageBubble`, `InputBar`, `ProgressBar`, `AnswerOptions`.

---

### `MessageBubble`

Renders a single chat message — either a user message or an assistant message.

| Prop          | Type                    | Description                                          |
| ------------- | ----------------------- | ---------------------------------------------------- |
| `role`        | `"user" \| "assistant"` | Determines bubble style and alignment                |
| `content`     | String                  | Message text (Markdown for assistant)                |
| `isStreaming` | Boolean                 | If true, shows a typing indicator or partial content |

**Relationships:** Renders `MarkdownContent` for assistant messages.

---

### `MarkdownContent`

Wraps the Streamdown library to render AI responses as styled Markdown.

| Prop      | Type   | Description             |
| --------- | ------ | ----------------------- |
| `content` | String | Markdown text to render |

**Relationships:** Uses custom components from `mdComponents.tsx`. Rendered inside `MessageBubble`.

---

### `InputBar`

Text input area for the user to type and submit messages.

| Prop       | Type                     | Description                               |
| ---------- | ------------------------ | ----------------------------------------- |
| `onSubmit` | `(text: string) => void` | Called when the user sends a message      |
| `disabled` | Boolean                  | Disables input while the AI is responding |

**Hooks:** `useState`, `useRef`  
**Relationships:** Rendered inside `ChatWindow`.

---

### `AnswerOptions`

Renders multiple-choice answer buttons (A, B, C) extracted from the assistant's message.

| Prop       | Type                       | Description                     |
| ---------- | -------------------------- | ------------------------------- |
| `options`  | String[]                   | Array of option texts           |
| `onSelect` | `(option: string) => void` | Called when an option is tapped |

**Relationships:** Rendered inside `ChatWindow` when the AI message contains multiple-choice options.

---

### `ProgressBar`

Shows the current exercise count vs. the session target.

| Prop      | Type   | Description                      |
| --------- | ------ | -------------------------------- |
| `current` | Number | Exercises completed so far       |
| `total`   | Number | Target exercises for the session |

---

## `progress/` — Progress Tracking Components

### `AccuracyRing`

A donut chart (Recharts) showing the user's accuracy percentage.

| Prop       | Type   | Description                 |
| ---------- | ------ | --------------------------- |
| `accuracy` | Number | Accuracy percentage (0–100) |

**Relationships:** Rendered on the progress page.

---

### `StatsChart` / `StatsChartWrapper`

A bar chart showing daily sessions and exercises for the past 7 days. `StatsChartWrapper` adds a Suspense boundary and loading skeleton.

| Prop   | Type             | Description                             |
| ------ | ---------------- | --------------------------------------- |
| `data` | WeeklyActivity[] | Array of `{ day, sessions, exercises }` |

**Relationships:** `StatsChartWrapper` is rendered on the progress page; it renders `StatsChart` once data is ready.

---

### `StreakCalendar`

Displays a calendar grid highlighting days on which the user completed at least one session.

| Prop         | Type   | Description                  |
| ------------ | ------ | ---------------------------- |
| `activeDays` | Date[] | Dates with learning activity |
| `streak`     | Number | Current streak count         |

---

### `VocabList`

A scrollable list of the user's vocabulary items with their status (new, learning, mastered) and next review date.

| Prop    | Type        | Description                 |
| ------- | ----------- | --------------------------- |
| `items` | VocabItem[] | Vocabulary items to display |

---

## `onboarding/` — Onboarding Components

### `LanguageSelector`

An 8-option grid for choosing the target language. Supports: German (de), French (fr), Spanish (es), Italian (it), English (en), Portuguese (pt), Japanese (ja), Chinese (zh).

| Prop       | Type                     | Description                        |
| ---------- | ------------------------ | ---------------------------------- |
| `selected` | String?                  | Currently selected language code   |
| `onChange` | `(code: string) => void` | Called when a language is selected |

---

### `OnboardingStep`

A reusable wrapper for each step in the onboarding wizard. Shows a title, description, and a "Next" button.

| Prop          | Type      | Description                          |
| ------------- | --------- | ------------------------------------ |
| `title`       | String    | Step title                           |
| `description` | String    | Explanatory text                     |
| `onNext`      | Function  | Called when the user advances        |
| `children`    | ReactNode | Step content (selector, input, etc.) |

---

## See Also

- [design-system.md](./design-system.md) — CSS variables and styling rules used in all components
- [session-flow.md](./session-flow.md) — How ChatWindow interacts with the backend
- [architecture.md](./architecture.md) — Server vs Client Component boundaries
