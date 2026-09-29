# Canton Supply Co. — Inventory & Product Management

A full-stack product catalog and inventory management system for a reseller
business. **The product catalog is public** — anyone can browse it without
an account. **Only the store owner logs in**, to manage products, pricing,
inventory, and see a history of changes.

Built with Next.js (App Router), TypeScript, Tailwind CSS, PostgreSQL, and
Drizzle ORM.

> **Note on the database layer:** the original spec suggested Prisma, but
> this project uses **Drizzle ORM** instead. Prisma's query engine requires
> downloading a compiled binary at install/build time; in the environment
> this project was built in, that download was blocked by network
> restrictions. Drizzle is a pure-JavaScript/TypeScript ORM with no binary
> dependency, so it was used as a drop-in equivalent. It talks to Postgres
> through `pg` and offers the same relational, type-safe query experience
> Prisma would have.

---

## Access model

- **Anyone** can browse `/products` and `/products/[id]` — no account,
  no login. This is the public storefront/catalog.
- **The Owner** is the only account type in the system. The very first time
  you visit `/register`, it lets you create that one owner account; once it
  exists, `/register` disables itself and redirects to `/login`. There is
  no self-serve customer signup.
- Everything under `/owner/*` (dashboard, add/edit product, inventory,
  pricing, activity history, settings) is protected server-side by
  middleware — a logged-out visitor hitting an owner URL is redirected to
  `/login`, not just visually blocked.

---

## 1. Prerequisites

- Node.js 18.18+ (20+ recommended)
- PostgreSQL 14+ running locally or reachable over the network
- npm

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

- `DATABASE_URL` — your PostgreSQL connection string.
- `JWT_SECRET` — a long random string used to sign session cookies. Generate
  one with `openssl rand -base64 48`.

If you don't already have a database, create one:

```bash
createdb reseller_db
# or, from the postgres superuser:
psql -c "CREATE DATABASE reseller_db;"
```

## 4. Push the database schema

This project uses Drizzle's schema-push workflow (no separate migration
files are checked in):

```bash
npm run db:push
```

This creates the `users`, `products`, `categories`, and `activities` tables
in your database based on `src/db/schema.ts`.

## 5. Seed realistic sample data

```bash
npm run db:seed
```

This wipes and repopulates the database with:

- An **owner** account: `owner@cantonsupply.com` / `owner123456`
- 12 realistic products across all categories, with some deliberately
  low-stock or out-of-stock so you can see status badges in action
- A short activity history

You can safely re-run `npm run db:seed` at any time to reset to a clean
demo state.

## 6. Run the app

```bash
npm run dev
```

Visit http://localhost:3000 — you'll be redirected straight to `/products`,
the public catalog. No login is needed to browse it.

To manage the store, click **Owner Login** in the header and sign in with
the seeded owner account above. That lands you on `/owner`, the management
dashboard.

If you skip seeding and start from a completely empty database, visiting
`/register` lets you create the one owner account for the store. After
that account exists, `/register` disables itself.

## 7. Production build

```bash
npm run build
npm start
```

---

## Project structure

```
src/
  app/                     Routes (App Router)
    login/                 Owner sign-in
    register/              One-time owner account bootstrap (self-disables after first use)
    products/, products/[id]/   Public product catalog & detail page (no login required)
    owner/                 Owner dashboard + product management table (auth required)
    owner/products/add/    Add product form
    owner/products/[id]/edit/  Edit product form
    owner/activity/        Activity history
    owner/settings/        Owner account settings
  components/              Shared UI (public/owner nav, status badges, modals, forms)
  components/owner/        Owner-only interactive components
  db/                      Drizzle schema + client
  lib/
    auth.ts                Session/JWT/password helpers
    data.ts                Read queries (products, stats, activity)
    utils.ts                Formatting & stock-status helpers
    actions/                Server Actions (mutations), with Zod validation
                             and server-side owner authorization checks
  middleware.ts            Edge route protection — only /owner/* requires a session
scripts/
  seed.ts                  Database seed script
```

## Security notes

- Passwords are hashed with bcrypt; plaintext passwords are never stored or logged.
- Sessions are httpOnly, signed JWTs — never trusted from the client for role checks.
- `/owner/*` routes are protected in `middleware.ts`, which runs on the
  server/edge — visiting an owner URL without a valid session redirects to
  `/login`, it doesn't just hide a button in the UI. The public catalog
  routes (`/products`, `/products/[id]`) intentionally require no session.
- `/register` checks the database on every request and redirects to
  `/login` once an owner account exists, so it can't be used to create a
  second account later.
- Every mutation (create/edit/delete product, change price, adjust stock)
  re-checks that the caller is the owner **inside the Server Action
  itself**, not just relying on the route-level middleware, and validates
  all input with Zod before touching the database.
- The public catalog never receives purchase price, supplier, profit, or
  activity history data — those fields are simply not fetched/rendered for
  unauthenticated requests.
