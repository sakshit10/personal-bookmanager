# Shelfmark

A quiet, personal space to log what you're reading — built for the Thumbstack MERN Stack Developer assignment.

**Live demo:** _add your deployed Vercel URL here_
**Repo:** _add your GitHub URL here_

## What it does

- Sign up, log in, log out — sessions handled with JWTs in httpOnly cookies.
- Add, edit, and delete books (title, author, tags, status).
- Filter your collection by status or tag.
- A dashboard with a bookshelf visualization: every book is a spine, colored
  by its status (📖 Want to Read / 📘 Reading / ✅ Completed), so the shape
  of your reading habits is visible at a glance — not just a number.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend:** Next.js Route Handlers (`app/api/**`)
- **Database:** MongoDB + Mongoose
- **Auth:** JWTs signed/verified with [`jose`](https://github.com/panva/jose) (works identically in Node route handlers and in `proxy.ts`), passwords hashed with `bcryptjs`
- **Fonts:** self-hosted via `@fontsource` (Fraunces, Inter, IBM Plex Mono) — no runtime dependency on Google Fonts

## Project structure

```
app/
  page.tsx                 landing page (server component, redirects if already logged in)
  login/, signup/          auth pages + shared AuthForm
  dashboard/
    page.tsx                server component — fetches the user's books directly from the DB
    DashboardClient.tsx      client component — filters, optimistic add/edit/delete/status-change
  api/
    auth/{signup,login,logout,me}/route.ts
    books/route.ts           GET (list, filterable), POST (create)
    books/[id]/route.ts       PATCH (edit / change status), DELETE — both scoped to the owner
components/                Shelf, BookCard, BookForm, FilterBar, StatusBadge, Navbar
lib/
  db.ts                     Mongoose connection singleton (safe across hot reload / serverless)
  auth.ts                   JWT sign/verify + cookie config
models/
  User.ts                   password hashed on save, never returned by default queries
  Book.ts                   tags normalized (trimmed, lowercased, de-duplicated) on write
proxy.ts                    route protection (Next.js 16's replacement for middleware.ts)
```

## Design notes

- **Auth flow:** the session lives in an httpOnly, `sameSite=lax` cookie — never touched by
  client JS, so it isn't exposed to XSS. `proxy.ts` does the fast, cookie-presence redirect;
  every API route re-verifies the JWT itself and scopes every database query to
  `user: session.userId`, so knowing another user's book id isn't enough to edit or delete it.
- **Data model:** two collections, `User` and `Book`, linked by a `user` reference on `Book`.
  No separate "tags" or "status history" collections — the assignment doesn't call for that,
  and a reading list is small enough that embedding tags as a string array is simpler and just
  as queryable.
- **Dashboard:** the server component fetches the user's books straight from MongoDB (no
  client-side fetch waterfall on first load); the client component then owns filtering and
  optimistic updates so status changes feel instant.

## Running locally

**Requirements:** Node.js 20+, a MongoDB connection (local or [Atlas](https://www.mongodb.com/cloud/atlas)).

```bash
npm install
cp .env.example .env.local   # fill in MONGODB_URI and JWT_SECRET
npm run dev
```

Visit `http://localhost:3000`.

## Deploying (Vercel + Atlas)

1. Push this repo to GitHub.
2. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), add a database
   user, and allow network access from anywhere (`0.0.0.0/0`) or Vercel's IP ranges.
3. Import the repo into [Vercel](https://vercel.com/new).
4. Add environment variables in Vercel's project settings: `MONGODB_URI`, `JWT_SECRET`.
5. Deploy.

## What I'd add next

- Pagination / infinite scroll once a shelf gets large
- Search across title/author
- A read-only public shelf view for sharing
