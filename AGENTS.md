# AGENTS.md

This file provides architecture, conventions, and workflow guidance to AI Coding Agents (such as Gemini Antigravity, Claude Code, Cursor, etc.) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Serve the production build locally
```

There are no automated unit tests. Verification is strictly manual by running the game in a browser environment.


Deploy to production:
```bash
vercel deploy --prod
```

## Architecture

The game is vanilla JavaScript + HTML5 Canvas with zero runtime frameworks. Vite is used only for bundling ESM and minification.

### File responsibilities

| File | Role |
|------|------|
| `game.js` | Main game engine: loop, physics, state machine, spawning, collisions, HUD, cutscenes, parallax |
| `audio.js` | Procedural Web Audio API engine: music scheduler, SFX synthesis — no audio files anywhere |
| `sprites.js` | All pixel-art sprites defined as 2D character matrices mapped to CSS colors via `COLOR_MAP` |
| `index.html` | Canvas element, all overlays (start screen, game over, help modal, leaderboard), touch controls |
| `styles.css` | Glassmorphism UI, responsive layout, virtual joystick, dark/light theme |
| `api/high-score.js` | Vercel serverless function — GET/POST for the global leaderboard via Supabase |
| `vite.config.js` | Vite bundler settings: dynamic Open Graph absolute URL injection |

### Game state machine (`game.js`)

States: `START → PLAYING ↔ PAUSED`, `PLAYING → DYING → GAMEOVER`, `PLAYING → CUTSCENE → PLAYING`.

The main `gameLoop()` dispatches rendering and update logic based on `gameState`. The 60 FPS loop uses `requestAnimationFrame` with delta-time throttling.

### Sprite system (`sprites.js`)

Every game object is a 2D array of single characters. `drawPixelSprite(ctx, matrix, x, y, w, h, flipX)` iterates the matrix and maps each character through `COLOR_MAP` to a CSS color, drawing scaled rectangles pixel-by-pixel. `.` is transparent (skipped). Sprites are defined at 24×24 or similar sizes and scaled to the desired render size.

### Audio engine (`audio.js`)

A step sequencer drives music: `schedulerTimerId` fires ahead of time and calls `scheduleNote()` to push `OscillatorNode`s into the `AudioContext`. BPM increases with game speed. Music themes (`sunrise`, `sunny`, `sunset`, `night`, `danger`, `chase`) are pattern arrays of note names mapped through `NOTE_FREQS`. SFX are created as one-shot oscillator/gain chains. The engine is exposed as `window.audioEngine`.

### Stage & difficulty system

`currentStage` (1–20) gates obstacle types, music themes, weather, and special events. Speed increases every stage. Special event stages (3 = eruption, 6 = school exit, 10 = tornado, 13 = beach tourists, 17 = cat alert) override background rendering and spawn behavior. Every 10 stages a cutscene plays. Stage 20 ends with the Chilean national anthem synthesized procedurally.

### HUD

The HUD is drawn directly onto the top 32px of the canvas — not HTML. Score, lives, collectibles, and event badges are rendered with `ctx.fillText` using the `Press Start 2P` bitmap font. Layout flows right-to-left anchored at x=730 with dynamic collapse when space is tight.

### Leaderboard backend

`api/high-score.js` is a Vercel serverless function that reads/writes to a Supabase table `cholga_leaderboard` (columns: `name`, `score`, `created_at`). It falls back to a hardcoded default leaderboard when env vars are absent.

Required environment variables (Vercel project settings or local `.env`):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Treat any change under `api/` as a production backend change even though the rest of the app is static — credentials never get committed, only set via env.

### DevOps & Environment Strategy (Staging vs. Production)

To prevent development/test sessions from polluting the global leaderboard, this project enforces strict environment isolation:

* **Git Branches**:
  * `main` is production-ready. Direct commits are blocked by GitHub branch protection — a PR is always required. This is not an agent workflow choice; it is enforced by GitHub.
  * `staging` is the integration/QA branch and the normal working branch. Commit directly here for all work — no feature branches are needed for this solo project. All preview deployments are built from here.
* **Database Isolation (Supabase)**:
  * **Production Database**: Linked strictly to Vercel's **Production** environment. Contains official high scores.
  * **Staging Database**: Linked to Vercel's **Preview** and **Development** environments. Used for development, local execution (`npm run dev`), and branch previews.
* **Environment Configuration**:
  * Scoped environment variables (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`) are managed securely within the Vercel Project Dashboard.
  * Local development variables can be set in an ignored `.env.local` file pointing to the Staging database.
  * The database schema is fully replicated and version-controlled under `docs/database-schema.sql` to initialize new staging/dev instances easily.
* **Release Flow via GitHub CLI (`gh`)**:
  * After pushing to `staging`, fetch the Vercel preview deployment URL and provide it to the user before asking for approval to continue. Use:
    `gh pr view <number> --json statusCheckRollup` (once the PR is open) or `vercel ls` to find the preview URL.
  * After merging to `main` and the deploy completes, provide the production URL to the user: **https://cholga-run.vercel.app**
  * Create a Pull Request from `staging` to `main`:
    `gh pr create --base main --head staging --title "release: ..." --body "..."`
  * Merge the Pull Request — **always use `--merge`**, never `--rebase`. GitHub cannot sign commits recreated by a rebase merge; `--rebase` will always be rejected on `main` because signed commits are required. Squash merges are disabled:
    `gh pr merge <number> --merge --delete-branch`
  * After merging, always fast-forward `staging` to stay in sync with `main`:
    `git fetch origin && git switch staging && git merge --ff-only origin/main && git push origin staging`
* **Repository Protection & Signed Commits**:
  * `main` is protected on GitHub: pull requests are required, signed commits are required, force-pushes and branch deletion are blocked, and protections apply to admins.
  * `staging` is also protected: signed commits are required, branch deletion is blocked, and force-push is allowed only to support signed rebases with `--force-with-lease`.
  * Signed commits are required on both `main` and `staging`. Local development must keep Git signing enabled, including commits recreated during rebase:
    `git config --global commit.gpgsign true`
    `git config --global rebase.gpgsign true`
  * Merge commits are enabled. Squash merges are disabled. `gh pr merge --merge` is the correct method for all staging→main PRs. Auto-merge, update-branch, and delete-branch-on-merge are enabled.
  * Secret scanning, secret scanning push protection, Dependabot alerts, and Dependabot security updates are enabled for the repository.
  * If a temporary backup branch is created before an exceptional history rewrite or force-push, delete it from both local and remote after verifying that `main` and `staging` point to the intended signed commit:
    `git branch -D <backup-branch>`
    `git push origin --delete <backup-branch>`
* **Dependabot Security PR Flow**:
  * Dependabot security PRs normally target the default branch (`main`) directly, so they are the exception to the usual feature-branch-to-`staging` flow.
  * If a Dependabot PR shows many unrelated commits, deleted branches, or conflicts after a history rewrite, do not resolve it manually first. Comment `@dependabot rebase`. If Dependabot closes it as superseded, use the replacement PR it opens.
  * Before merging a Dependabot PR, verify that it is clean/mergeable, changes only dependency files unless clearly expected, has passing Vercel checks, and that the Dependabot commit is verified:
    `gh pr view <number> --json mergeStateStatus,mergeable,files,statusCheckRollup`
    `gh api repos/cannobbio/cholga-run/commits/<sha> --jq .commit.verification`
  * Test locally before merging:
    `gh pr checkout <number>`
    `npm install`
    `npm run build`
  * Merge Dependabot PRs with a merge commit, not rebase. GitHub cannot automatically sign rebase-merge commits under `Require signed commits`, but it can create a verified merge commit. GitHub UI is acceptable if it shows "Create a merge commit"; CLI equivalent:
    `gh pr merge <number> --merge --delete-branch`
  * After a Dependabot PR is merged into `main`, fast-forward `staging` to match `main` so both protected branches stay equivalent:
    `git fetch origin`
    `git switch staging`
    `git merge --ff-only origin/main`
    `git push origin staging`

### Coding conventions

- Vanilla JS only — no frameworks, no external runtime dependencies beyond `@supabase/supabase-js` and Vercel analytics.
- All rendering goes through `ctx` (Canvas 2D). Set `ctx.imageSmoothingEnabled = false` to preserve pixel-art sharpness.
- Style: 2-space indentation, semicolons, single quotes in JS. `UPPER_SNAKE_CASE` for game constants (`CANVAS_WIDTH`, `GRAVITY`), `camelCase` for variables/functions, `kebab-case` for CSS classes and asset names.
- New sprites: add a character matrix to `sprites.js` with `COLOR_MAP` characters; register any new color letter in `COLOR_MAP`.
- New music theme: add `MELODY`, `CHORDS`, and `BASS` arrays to `audio.js` using note names from `NOTE_FREQS`, then wire it in `selectMusicTheme()`.
- Mobile controls are handled via the virtual analog joystick tracked by `touch.identifier` — avoid breaking multi-touch behavior when touching input handling.

### Pre-Commit & Verification Workflow

AI Agents **MUST** test and verify all changes locally before generating any commits or pushing code. Follow this protocol strictly:

1. **Serve Development Local**: Run `npm run dev` to start the local Vite server at `http://localhost:5173`. Ask the user to manually verify:
   - Specific stage mechanics (e.g. Colegios or Turistas), visual layout alignment, and Web Audio API synthesizers.
   - Mobile responsive portrait orientation: open DevTools and toggle simulated portrait screen view to check that the full-screen orientation alert displays on top of everything without any clipping.
2. **Build and Check Bundler**: Run `npm run build` to verify the code compiles successfully without any minification or bundling errors.
3. **Serve Production Preview**: Run `npm run preview` to preview the production bundle locally at `http://localhost:4173` to guarantee the compiled assets load cleanly.
4. **Stage & Commit**: Only commit when the build compiles flawlessly and local manual testing is fully verified by the user.

### Pre-PR Checklist

Before proposing a Pull Request, verify:
- Keyboard controls, mobile/touch UI, audio start/resume.
- Stage progression and special event stages.
- Leaderboard GET/POST **with and without** `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` set (fallback path must still work).

### Commit format

Follow Conventional Commits with scope: `feat(audio): rebalance jump SFX`, `fix(hud): prevent score overlap at stage 6`, `chore(deps): bump vite`. PRs should include a short user-facing summary, files changed, manual test notes, and screenshots/clips for UI or gameplay changes.
