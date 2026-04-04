# Deployment and GitHub Upload Guide

## 1) Prepare environment files

1. Backend:
- Copy `.env.example` to `.env`
- Set real values for `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`

2. Frontend (optional local override):
- Copy `frontend/.env.example` to `frontend/.env.development`

## 2) Test locally before pushing

From project root:

```bash
npm install
npm run build
npm start
```

Open `http://localhost:5000` (production-style server serving React build).

## 3) Initialize Git and push to GitHub

From project root:

```bash
git init
git add .
git commit -m "Prepare Freelancer system for deployment"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

If you already have a repo initialized, skip `git init` and adjust remote commands.

## 4) Deploy on Render (single web service)

Use one service for both backend + frontend build:

- Runtime: Node
- Build Command:

```bash
npm install
npm run build
```

- Start Command:

```bash
npm start
```

Set environment variables in Render dashboard:
- `NODE_ENV=production`
- `PORT=10000` (or leave default; Render provides one)
- `MONGODB_URI=<your-mongodb-uri>`
- `JWT_SECRET=<long-random-secret>`
- `JWT_EXPIRES_IN=7d`
- `CLIENT_URL=<your-render-domain>`

## 5) Deploy on Railway (alternative)

- Root directory: project root
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Add the same env vars as above.

## 6) Important security follow-up

Your existing local `.env` contains a concrete JWT secret.

1. Generate a new JWT secret for production.
2. Do not commit `.env`.
3. If `.env` was ever committed, rotate the secret immediately and remove it from git history.

## 7) Post-deploy smoke checks

1. Register a new account
2. Login/logout
3. Create, edit, delete a client
4. Create, edit, delete a project
5. Create, edit, delete a payment
6. Verify dashboard cards/charts update correctly
