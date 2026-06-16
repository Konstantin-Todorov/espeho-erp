# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full production ERP system for **ЕСПЕХО ООД** (Bulgarian glass manufacturer). Monorepo with a Node.js/Express backend and a React 18 + Vite frontend, deployed on **Railway** at `https://espeho-erp-production.up.railway.app/`.

## Development Commands

### Backend (port 5001 locally, 5000 in prod)
```bash
cd backend
npm run dev        # nodemon — auto-restart on changes
npm run migrate    # run pending SQL migrations
npm run seed       # load demo data (idempotent)
npm run setup      # migrate + seed in one step
```

### Frontend (port 5173)
```bash
cd frontend
npm run dev        # Vite dev server with HMR
npm run build      # outputs to frontend/dist/
```

### Root (used by Railway)
```bash
npm run build      # builds frontend and copies dist → backend/public
npm start          # node backend/src/index.js
```

> **Local proxy**: Vite proxies `/api` → `http://localhost:5001`. Backend reads `PORT` from env (defaults to 5000; set to 5001 locally if needed to avoid conflict).

## Demo Accounts (after seed)

| Email | Password | Role |
|---|---|---|
| admin@espeho.com | espeho2024 | admin |
| office1@espeho.com | espeho2024 | office |
| prod1@espeho.com | espeho2024 | production |
| warehouse1@espeho.com | espeho2024 | warehouse |

## Architecture

### Backend (`backend/src/`)

- **`index.js`** — Express app setup. Calls `runMigrations()` before `app.listen()` so Railway auto-migrates on every deploy. Also starts hourly cron jobs for overdue-order and low-stock notifications.
- **`db/migrate.js`** — Exported async function (not auto-called). Tracks run migrations in a `migrations` table; skips already-applied files. **Never** call `pool.end()` here.
- **`db/migrations/`** — Sequential SQL files (`001_...` → `007_...`). Always add new ones at the end with the next number.
- **`db/seed.js`** — Idempotent seed via `ON CONFLICT DO NOTHING`.
- **`middleware/auth.js`** — Verifies JWT from `Authorization: Bearer <token>`. Populates `req.user`.
- **`middleware/roleCheck.js`** — `roleCheck('admin', 'office')` — use after `authMiddleware`.
- **`utils/notify.js`** — Helper to insert into `notifications` table by role array.
- **`utils/email.js`** — Nodemailer wrappers for overdue and low-stock emails.

### Frontend (`frontend/src/`)

- **`api/axios.js`** — Single axios instance with base `/api`, auto-attaches JWT from `localStorage`, redirects to `/login` on 401.
- **`context/AuthContext.jsx`** — Exposes `user`, `login()`, `logout()`, and boolean helpers `isAdmin`, `isOffice`, `isProduction`, `isWarehouse`.
- **`context/ThemeContext.jsx`** — Dark/light theme toggle. Persisted in `localStorage('erp-theme')`. Toggles `.light` class on `<html>`.
- **`App.jsx`** — React Router routes wrapped in `AuthProvider` + `ThemeProvider`. Protected routes check `user` from context.
- **`components/Layout.jsx`** — Shell: `Sidebar` + `<Outlet>`.
- **`components/NotificationBell.jsx`** — Uses `createPortal` + `getBoundingClientRect` for a fixed-position dropdown that never goes off-screen. Uses `navigate()` (not `<Link>`) to avoid mousedown-close race.

## Styling System

Tailwind v3 with CSS custom properties for theming. Colors are defined as `rgb(var(--rgb-*) / <alpha-value>)` in `tailwind.config.js` so opacity variants like `bg-border/30` work in both themes.

- **Dark mode vars** (`:root`), **light mode vars** (`:root.light`) — defined in `frontend/src/index.css`
- Semantic colors: `bg`, `surface`, `border`, `muted`, `accent` (blue), `success`, `warning`, `danger`
- Chart-specific CSS vars: `--chart-bg`, `--chart-border`, `--chart-grid`, `--chart-tick`
- Light mode text inversion: `.text-white` → dark text, except `.btn-primary`, `.btn-danger`, `.bg-accent`
- Font: IBM Plex Sans

## Role-Based Access

Four roles with additive permissions (admin sees everything):
- **admin** — full access
- **office** — orders, clients, quotations, deliveries, reports
- **production** — production tasks only, no prices/financials
- **warehouse** — stock management, deliveries

Frontend checks via `useAuth()` helpers; backend enforces via `roleCheck()` middleware on every sensitive route.

## Database Notes

- The `suppliers` table uses column `contact` (not `contact_person`).
- Order status flow is one-directional: `НОВА → МАТЕРИАЛИ → ПРОИЗВОДСТВО → ГОТОВА → ДОСТАВЕНА`. Admins can skip steps.
- All migrations are transactional — a failed migration rolls back and throws, preventing server start.

## Deployment (Railway)

Push to GitHub → Railway auto-runs `npm run build` then `npm start`. Migrations run automatically on startup. Required env vars: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.
