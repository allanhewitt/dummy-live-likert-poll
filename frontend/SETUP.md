# Dummy Live Poll — Setup Guide

This project mirrors the real B1700/B1141 architecture exactly: a Vite/React
frontend with three views (respond, display, control), a small Express
backend, and Postgres as the shared data store. Once this works end-to-end,
the backend and frontend shells are largely reusable for the real apps.

There are two folders, each a separate project:
- `dummy-poll-backend` — the Express API
- `dummy-poll-frontend` — the React app (three routes)

---

## 1. Create the database

On your Hetzner Postgres instance, create a dedicated, disposable database:

```sql
CREATE DATABASE gedl_dummy_test;
```

Connect to it, then run the contents of `schema.sql` (in the backend folder)
against it. You can do this with `psql`:

```bash
psql "postgres://USERNAME:PASSWORD@HOST:5432/gedl_dummy_test" -f schema.sql
```

Or paste the contents into whatever Postgres GUI you use (e.g. Coolify's
built-in database tool, or pgAdmin). This creates the three tables and seeds
the five dummy questions.

---

## 2. Backend: local setup

```bash
cd dummy-poll-backend
npm install
cp .env.example .env
```

Open `.env` and fill in your real `DATABASE_URL` (connection string for
`gedl_dummy_test`). Leave `PORT=4000` and `ALLOWED_ORIGINS` as-is for now.

Start it:

```bash
npm run dev
```

You should see `Dummy poll backend running on port 4000`. Test it's alive by
visiting `http://localhost:4000/health` in a browser — you should see
`{"status":"ok"}`.

---

## 3. Frontend: local setup

In a **second terminal** (leave the backend running):

```bash
cd dummy-poll-frontend
npm install
cp .env.example .env.local
npm run dev
```

Vite will print a local URL, typically `http://localhost:5173`.

---

## 4. Test locally

Open three browser tabs:

- `http://localhost:5173/control` — pick a question to make it live
- `http://localhost:5173/respond` — should show that question within ~3
  seconds (it polls every 3s); submit a response
- `http://localhost:5173/display` — should show the same question and update
  with the new response within ~3 seconds

Try opening `/respond` in a couple more tabs (or an incognito window) to
simulate multiple students, and confirm `/display` aggregates all of them
correctly. Then use `/control` to switch to a different question and confirm
both other views follow.

If something isn't updating, check the backend terminal for errors first —
most issues at this stage are a wrong `DATABASE_URL` or a CORS mismatch
between `ALLOWED_ORIGINS` in the backend `.env` and the frontend's actual
local URL.

---

## 5. Push to GitHub

Two separate repositories, matching the two separate projects:

```bash
cd dummy-poll-backend
git init
git add .
git commit -m "Initial dummy poll backend"
# create an empty repo on GitHub first, then:
git remote add origin <your-backend-repo-url>
git push -u origin main
```

```bash
cd ../dummy-poll-frontend
git init
git add .
git commit -m "Initial dummy poll frontend"
git remote add origin <your-frontend-repo-url>
git push -u origin main
```

Note: `.env` and `.env.local` are real config with secrets/URLs — do not
commit them. Add a `.gitignore` containing at least:

```
node_modules
.env
.env.local
dist
```

---

## 6. Deploy via Coolify

**Backend service:**
- New service in Coolify, pointed at the backend GitHub repo
- Set environment variables in Coolify's dashboard (not committed): the real
  `DATABASE_URL`, and `ALLOWED_ORIGINS` set to your frontend's deployed URL
  once you know it
- Coolify runs `npm install` and `npm start` automatically for a Node service
- Give it a subdomain via Traefik, e.g. `api-poll-test.yourdomain.com`

**Frontend service:**
- New static site in Coolify, pointed at the frontend GitHub repo
- Set `VITE_API_BASE` in Coolify's environment variables to your deployed
  backend URL, e.g. `https://api-poll-test.yourdomain.com`
- Coolify runs `npm install` and `npm run build`, then serves the resulting
  `dist/` folder
- Give it a subdomain, e.g. `poll-test.yourdomain.com`

Once both are deployed, go back into the backend's `ALLOWED_ORIGINS` and set
it to the real frontend URL (rather than `*` or localhost), then redeploy the
backend.

---

## 7. Live test

Visit `https://poll-test.yourdomain.com/control` on your laptop and
`https://poll-test.yourdomain.com/respond` and `/display` on other devices
(phone, another laptop) over the actual internet, not localhost. Confirm the
same behaviour as the local test in step 4.

---

## What's reusable from here

Once this works, the backend (`server.js`, schema pattern) and the
respond/display/control structure are the template for the real
`B1700-live-likert-poll` and `B1141-live-likert-poll` projects — copy the
folders, swap the seeded questions in `schema.sql`, and adjust subdomains.
The same shape (write a response, read an aggregate, lecturer controls what's
live) will also apply to the CWD and Divergence Map projects later, with a
different response structure (position + confidence rather than a single
scale value).
