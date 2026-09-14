# Church System — Frontend

React (Vite) frontend for the church management system, built against the
Express/MongoDB backend. Deploys to Vercel.

## Roles

- **Admin** — full access: members, schedules, Sunday attendance, discipleship
  reports, and full user management (approve/edit/delete/reset password).
- **Staff** — same day-to-day access as admin (members, schedules, Sunday
  attendance, reports), plus approving pending leader/staff accounts and
  resetting passwords, but can't edit roles or delete accounts.
- **Leader** — scoped to their own members and group schedules only.

## Pages

- `/login`, `/signup` — auth (signup is self-registration for leader/staff;
  new accounts start `pending` until approved)
- `/dashboard` — role-aware summary
- `/members`, `/members/:id` — member list + detail (discipleship progress
  editor, attendance log, progress history)
- `/schedules` — victory group schedules
- `/sunday-attendance` — aggregate Sunday headcounts (staff/admin)
- `/reports` — discipleship milestone breakdown (staff/admin)
- `/users` — approve accounts, reset passwords, manage roles (staff/admin)

## Local setup

```bash
npm install
cp .env.example .env
# set VITE_API_URL to your backend, e.g. http://localhost:5000/api
npm run dev
```

## Deploying to Vercel

1. Push this folder to GitHub (its own repo, or a `/client` folder alongside
   the backend in a monorepo).
2. In Vercel: **New Project** → import the repo → framework preset **Vite**
   → set the environment variable `VITE_API_URL` to your deployed Render
   backend URL, e.g. `https://your-api.onrender.com/api`.
3. Deploy. `vercel.json` is already set up so client-side routing (React
   Router) works on refresh/direct links.
4. Back on the backend (Render), set `CLIENT_ORIGIN` to your new Vercel URL
   so CORS allows the cookie-based auth to work.
