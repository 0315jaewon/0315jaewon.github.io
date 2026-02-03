# Research Ops Planner

A lightweight Research Ops Planner built with Next.js App Router, TypeScript, and Tailwind. Designed for time‑boxed weekly planning across research, recruiting, and classes. All data stays in the browser via `localStorage` and can be exported/imported as JSON.

## Features
- **Goals**: Direction Goals and 3–6 month Outcomes (linkable, status, due dates)
- **North Star**: Select one active outcome as the current focus
- **This Week**: Commitments, time blocks, task inbox, and MED targets
- **Log**: Date‑stamped research notes with search + weekly summary generator
- **Export/Import**: Single JSON file download, replace-on-import for simplicity
- **Shortcuts**: `n` new task, `l` new log entry

## Tech
- Next.js (App Router) + TypeScript
- Tailwind CSS
- `localStorage` persistence with basic schema versioning

## Getting Started
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build & Deploy
### Vercel
1. Push this folder to a Git repo.
2. Import the project in Vercel.
3. Framework preset: **Next.js**.
4. Build command: `npm run build`.

### Static Export
This project is configured for static export.
```bash
npm run build
```
The static site is emitted to `out/`. Upload `out/` to any static host (GitHub Pages, Netlify, S3, etc.).

## Data Safety
- Auto-saves to `localStorage` on every change.
- Export/Import allows easy backup and restore.
- Schema versioning: `storageVersion` is stored alongside the data.

## How to Use
1. **Set Direction Goals + Outcomes** in the Goals view.
2. **Pick a North Star Outcome** (one active outcome).
3. **Plan the week**: add time blocks + commitments + MED targets.
4. **Execute**: mark blocks done, update task statuses.
5. **Log results daily** in the Log view.
6. **Generate weekly summary** and copy it for reporting.

---

### Notes
- No backend or database required.
- All data stays in your browser unless exported.
