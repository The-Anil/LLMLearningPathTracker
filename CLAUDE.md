# CLAUDE.md

## Project

Personal LLM engineering skill tracker. React + Vite SPA deployed to GitHub Pages. Progress persists in `localStorage`; owner syncs to repo via a GitHub Actions workflow triggered directly from the browser using a PAT.

**Live URL:** `https://the-anil.github.io/LLMLearningPathTracker/`  
**Repo:** `https://github.com/The-Anil/LLMLearningPathTracker`

---

## Key files

| File | Role |
|------|------|
| `src/data.js` | Single source of truth for all skill/topic definitions and their default statuses (`have` / `learn` / `todo`). Updated by the sync workflow. |
| `src/App.jsx` | Entire UI: tier columns, topic chips, header, PAT modal, sync overlay, GitHub API polling state machine. |
| `src/main.jsx` | React 18 entry point. |
| `vite.config.js` | `base: '/LLMLearningPathTracker/'` — required for GitHub Pages asset paths. |
| `.github/workflows/deploy.yml` | Fires on push to `main`. Runs `npm ci && npm run build`, publishes `dist/` to `gh-pages` branch via `peaceiris/actions-gh-pages`. |
| `.github/workflows/update-data.yml` | `workflow_dispatch` — accepts `skills_json` input from browser. Runs `scripts/update_data.py`, commits `src/data.js` using `secrets.GH_PAT` (PAT push re-triggers `deploy.yml`; GITHUB_TOKEN push would not). |
| `scripts/update_data.py` | Reads `src/data.js` as text, regex-patches `{t:"<topic>",s:"<old>"}` → `{t:"<topic>",s:"<new>"}` for each topic in the JSON input. |

---

## Architecture decisions

- **No backend.** State lives in `localStorage` (per-browser) and `src/data.js` (repo default). Sync goes browser → GitHub API → Actions workflow → git commit → Pages redeploy.
- **PAT in localStorage, not source.** Owner enters PAT once per device; it's stored in `localStorage` and sent only to `api.github.com` over HTTPS. Never committed.
- **`secrets.GH_PAT` for the workflow commit.** `GITHUB_TOKEN` pushes don't re-trigger other workflows. A PAT push does, which fires `deploy.yml` automatically.
- **Inline styles throughout.** No CSS framework, no CSS modules — intentional for portability and no build config overhead.
- **Responsive breakpoint at 640px.** Below that: tier tab bar + single full-width column. Above: 6-column flex grid.

---

## Data shape

```js
// src/data.js
export const INIT = {
  T1: [
    {
      id: "t1-1",
      name: "Python (advanced)",
      freq: 5,                          // 1-5 importance rating
      topics: [
        { t: "Async / await patterns", s: "have" },  // s: "have" | "learn" | "todo"
      ],
      tools: "fastapi · pydantic · asyncio",
    },
    // ...
  ],
  T2: [...],  // T1–T6
};
```

`scripts/update_data.py` matches on the `t` field (topic text, assumed unique across the file) and replaces the `s` field in-place using regex.

---

## Sync flow (browser-side)

```
handleSyncClick()
  ↓ check localStorage for PAT → show PatModal if missing
startSync(pat)
  ↓ POST /repos/.../actions/workflows/update-data.yml/dispatches
  ↓ pollForRun() — polls GET /repos/.../actions/runs every 5s
    → matches by workflow name + new Date(r.created_at) >= new Date(afterIso)
  ↓ waitForRunCompletion() — polls run/{id} every 6s until status === "completed"
  ↓ repeat for deploy.yml (45s timeout — if no run found, data was unchanged, reload anyway)
  ↓ window.location.reload()
```

---

## Common tasks

**Add a new skill to a tier:**
Edit `src/data.js` — add an entry to the relevant tier array (`T1`–`T6`). Follow the existing shape. The UI derives status from topics automatically.

**Add a new tier:**
1. Add entry to `TIER_CONFIG` in `src/App.jsx`
2. Add matching key to `INIT` in `src/data.js`

**Change the mobile breakpoint:**
In `src/App.jsx`, find `const isMobile = width < 640` and update the value.

**Test the update script locally:**
```bash
python scripts/update_data.py '{"T1":[{"id":"t1-4","topics":[{"t":"Subgraphs & parallelism","s":"have"}]}]}'
```

---

## Build

```bash
npm install
npm run dev      # dev server — hot reload
npm run build    # output to dist/
```

Build must pass before pushing. `vite.config.js` `base` must match the GitHub repo name exactly.
