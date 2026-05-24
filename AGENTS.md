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
