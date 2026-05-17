# Deployment

This document covers the Vercel deployment setup, CI/CD pipeline, all required environment variables, and production configuration steps.

---

## Hosting

Fluent is deployed on **Vercel**. The `main` branch is connected to the production environment. Every push to `main` that passes CI triggers an automatic production deployment.

Live URL: https://fluent-ai-web.vercel.app

---

## CI/CD Pipeline

The pipeline runs on GitHub Actions via `.github/workflows/ci.yml`. It triggers on:

- Every push to `main`
- Every pull request targeting `main`

### Job 1: `code-quality`

Runs on Ubuntu with Node.js 20. Steps:

1. Check out the repository
2. Cache `node_modules` keyed by `package-lock.json` hash
3. `npm ci` — install all dependencies
4. `npx prisma generate` — regenerate the Prisma client (required before TypeScript compilation)
5. `npm run lint` — ESLint check
6. `npm run format:check` — Prettier format check (fails if any file is not formatted)
7. `npx tsc --noEmit` — TypeScript type check without emitting files

### Job 2: `test`

**Requires:** `code-quality` to pass.

Steps:

1. Check out and install dependencies
2. `npm run test:coverage` — run all Jest tests with coverage
3. Upload the `coverage/` directory as a GitHub Actions artifact (7-day retention)

### Job 3: `build`

**Requires:** `test` to pass.

Steps:

1. Check out and install dependencies
2. Inject all GitHub Secrets as environment variables
3. `npm run build` — runs `prisma generate && next build`

This job validates that the production build compiles and links correctly against the real services.

---

## Environment Variables

All variables must be set in both `.env.local` (local development) and the Vercel project settings (production). Variables added to GitHub Secrets are used only by the `build` CI job.

### Database

| Variable       | Description                                          | Where to get it                                                          |
| -------------- | ---------------------------------------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string with connection pooling | Neon project dashboard → Connection Details → select "Pooled connection" |

The URL must point to the **pooled** endpoint, not the direct connection. Neon's pooler is required for serverless environments.

### AI

| Variable            | Description       | Where to get it                          |
| ------------------- | ----------------- | ---------------------------------------- |
| `ANTHROPIC_API_KEY` | Anthropic API key | https://console.anthropic.com → API Keys |

### Authentication

| Variable               | Description                          | Where to get it                                                                    |
| ---------------------- | ------------------------------------ | ---------------------------------------------------------------------------------- |
| `NEXTAUTH_SECRET`      | Secret for signing JWT tokens        | Run `openssl rand -base64 32` in a terminal                                        |
| `NEXTAUTH_URL`         | Full URL of the deployed application | `http://localhost:3000` for dev; `https://fluent-ai-web.vercel.app` for production |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID               | Google Cloud Console → APIs & Services → Credentials                               |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret           | Same as above                                                                      |

### Caching

| Variable                   | Description                        | Where to get it                       |
| -------------------------- | ---------------------------------- | ------------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis REST endpoint URL    | Upstash console → Database → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis authentication token | Same as above                         |

### Email

| Variable         | Description                                      | Where to get it               |
| ---------------- | ------------------------------------------------ | ----------------------------- |
| `RESEND_API_KEY` | Resend API key for sending password reset emails | https://resend.com → API Keys |

---

## Local Setup

```bash
# Copy the example file
cp .env.example .env.local

# Fill in all the values listed above
# Then set up the database
npx prisma db push

# Start the development server
npm run dev
```

---

## Configuring Google OAuth

Google OAuth requires exact redirect URIs to be registered in the Google Cloud Console.

**For local development:**
Add to "Authorized redirect URIs":

```
http://localhost:3000/api/auth/callback/google
```

**For production:**
Add:

```
https://fluent-ai-web.vercel.app/api/auth/callback/google
```

If the URI is not registered, Google will reject the OAuth callback with an error.

---

## Adding GitHub Secrets

The CI `build` job injects all secrets as environment variables. To add them:

1. Go to the GitHub repository → Settings → Secrets and variables → Actions.
2. Click "New repository secret".
3. Add each variable from the table above with the exact name shown.

The secret names must match the environment variable names exactly (case-sensitive).

---

## Protecting the `main` Branch

To prevent direct pushes to `main` and require CI to pass before merging:

1. GitHub repository → Settings → Branches → Add branch protection rule.
2. Branch name pattern: `main`.
3. Enable:
   - "Require a pull request before merging"
   - "Require status checks to pass before merging" → select `code-quality`, `test`, `build`
   - "Do not allow bypassing the above settings"

---

## `.env.local` vs Vercel Environment Variables

| Aspect           | `.env.local`                   | Vercel dashboard                                              |
| ---------------- | ------------------------------ | ------------------------------------------------------------- |
| Used in          | Local development only         | Production and preview deployments                            |
| Committed to git | Never (listed in `.gitignore`) | No — stored encrypted in Vercel                               |
| Access           | Only on your machine           | All Vercel deployment environments                            |
| Updating         | Edit the file directly         | Vercel dashboard → Project → Settings → Environment Variables |

After updating environment variables in the Vercel dashboard, a new deployment is required for the changes to take effect. Trigger it by pushing any commit to `main`.

---

## See Also

- [architecture.md](./architecture.md) — Project structure overview
- [authentication.md](./authentication.md) — `NEXTAUTH_SECRET` and Google OAuth usage
- [database.md](./database.md) — Prisma and Neon connection details
- [caching.md](./caching.md) — Upstash Redis usage
- [testing.md](./testing.md) — CI test job details
