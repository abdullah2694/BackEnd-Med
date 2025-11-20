# Medical Appointment & Records Management API

Simple Node.js + Express backend using MongoDB (Mongoose), JWT auth, and REST APIs.

Setup

1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Install deps: `npm install`.
3. Start dev: `npm run dev` or start: `npm start`.

Routes
- /api/auth/signup  (POST) { name, email, password, phone }
- /api/auth/login   (POST) { email, password }
- /api/appointments/book  (POST, auth) { doctor, date (YYYY-MM-DD), time }
- /api/appointments/upcoming (GET, auth)
- /api/appointments/history (GET, auth)
- /api/user/profile (GET, auth)
- /api/user/update (PUT, auth) { name?, phone? }
- /api/records/ (GET, auth)
- /api/records/upload (POST, auth) { title, fileUrl }

Notes
- Doctors hardcoded: Dr. Ahmed, Dr. Fatima, Dr. Ali
- All responses are JSON. Errors use 400 for validation, 401 for auth, 500 for server.

Vercel deployment
-----------------
This project supports deployment on Vercel by using a serverless adapter.

What I added for Vercel:
- `api/index.js` — serverless entry that adapts the Express `app` using `serverless-http`.
- `app.js` — the Express app (no `listen`), reused by both local `server.js` and serverless handler.
- `lib/db.js` — DB helper that reuses mongoose connection across invocations.
- `vercel.json` — routes & build config to point all traffic to the serverless handler.

Deploy steps (summary):
1. In Vercel dashboard create a new project and point it to this repository.
2. In Project Settings → Environment Variables add `MONGO_URI` and `JWT_SECRET` (do NOT add secrets in code).
3. Vercel will install dependencies and deploy — the API will be available at your project domain.

Notes and tips
- On Vercel, environment variables must be set in the project settings; do not commit secrets to the repo.
- Keep an eye on cold-start DB connections; `lib/db.js` attempts to reuse mongoose connections.
- If you prefer container-like hosting (persistent server), consider deploying to Render, Heroku, or a VM instead.

