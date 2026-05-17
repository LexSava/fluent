# Authentication

This document explains how authentication works in Fluent — the NextAuth.js v5 setup, both providers, session strategy, registration and password reset flows, and how authentication is consumed in components.

---

## NextAuth.js v5 Setup

Authentication is built on NextAuth.js v5 (installed as `next-auth@beta`). The configuration lives in two files:

- `src/lib/auth.ts` — Full configuration: adapter, providers, session strategy, callbacks
- `src/lib/auth.config.ts` — Base config used by middleware (pages, trust host settings)

The NextAuth handler is registered at `src/app/api/auth/[...nextauth]/route.ts` and delegates to the configuration in `src/lib/auth.ts`.

---

## Two Providers

### 1. Credentials Provider (email + password)

Users sign in with an email and a bcrypt-hashed password stored in the `User.passwordHash` field.

On sign-in attempt:
1. The user record is looked up by email.
2. If no record exists, or `passwordHash` is null (OAuth-only account), sign-in fails.
3. `bcrypt.compare()` validates the submitted password against the stored hash.
4. If valid, the user object is returned and NextAuth creates a JWT.

### 2. Google OAuth Provider

Google OAuth is configured with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. When a user signs in with Google, NextAuth creates or updates an `Account` record linked to the `User` via the PrismaAdapter. No password is involved; identity is asserted by Google.

---

## Session Strategy: JWT

The session strategy is set to `"jwt"`. Sessions are stored in a signed cookie, not in the database. This is the correct choice when using the Credentials provider, because NextAuth's database session strategy does not support Credentials — it relies on OAuth providers to manage account linking.

### JWT Callbacks

The `jwt()` callback runs when a JWT is created or updated. On first sign-in, it reads `isOnboarded` from the user record in the database and embeds it in the token. This allows the onboarding redirect check to happen on every page render without an extra database round-trip.

The `session()` callback exposes `user.id` and `user.isOnboarded` on the session object, making them available to Server Components and API routes via `auth()`.

---

## Using Auth in Server Components

```typescript
import { auth } from "@/lib/auth"

const session = await auth()
if (!session) redirect("/login")

const userId = session.user.id
```

The `auth()` function decodes the JWT cookie and returns the session or null. It is safe to call in any Server Component or Route Handler.

---

## Using Auth in Client Components

```typescript
import { useSession } from "next-auth/react"

const { data: session, status } = useSession()
```

`useSession()` reads the session from the React context provided by `SessionProvider` (wrapped in `src/components/layout/Providers.tsx`). It is only available in Client Components.

---

## User Registration Flow

1. The user fills out the registration form (`RegisterForm.tsx`) with email, password, and confirmed password.
2. The form validates locally using the Zod schema from `src/lib/validations/auth.ts`.

**Password requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character (`!@#$%^&*`)

3. The form submits a POST request to `/api/auth/register`.
4. The route handler checks that the email is not already in use.
5. The password is hashed with bcrypt (12 rounds).
6. A new `User` record is created with `isOnboarded: false`.
7. The client calls `signIn("credentials", ...)` to log in immediately.
8. NextAuth creates a JWT; the `isOnboarded: false` flag is embedded.
9. The user is redirected to `/onboarding`.

---

## Password Reset Flow

1. The user submits their email on the forgot-password page.
2. POST `/api/auth/forgot-password`:
   - Always returns HTTP 200 regardless of whether the email exists (prevents email enumeration).
   - If the user exists, a `PasswordResetToken` record is created with a UUID token and a 1-hour expiry.
   - An email is sent via Resend with a link containing the token: `/reset-password?token=<uuid>`
3. The user clicks the link and lands on the reset-password page.
4. They submit a new password. POST `/api/auth/reset-password`:
   - The token is looked up in the database.
   - If not found or expired, an error is returned.
   - The new password is hashed and saved to `User.passwordHash`.
   - The `PasswordResetToken` record is deleted (one-time use).
5. The user is redirected to `/login`.

---

## Protected Routes

| Route | Protection mechanism |
|-------|----------------------|
| `/dashboard`, `/progress`, `/session`, `/settings` | Server Component calls `auth()`, redirects to `/login` if null |
| `/onboarding` | Server Component calls `auth()`, redirects to `/login` if null |
| All `/api/*` routes except `/api/auth/*` | Route handler calls `auth()`, returns 401 if null |
| `(auth)` pages (login, register, reset-password) | Public — no protection, redirect to `/dashboard` if already signed in |

---

## See Also

- [architecture.md](./architecture.md) — Route groups and overall protection strategy
- [database.md](./database.md) — User, Account, Session, and PasswordResetToken models
- [api-routes.md](./api-routes.md) — Auth endpoint request and response formats
- [deployment.md](./deployment.md) — Environment variables for OAuth and NextAuth
