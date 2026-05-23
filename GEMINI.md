# 🐶 CHOLGA RUN - Project Context

## Project Overview
**CHOLGA RUN** is a high-performance, retro-style 8-bit infinite runner game built with vanilla JavaScript. It is set in the landscapes of southern Chile (Puerto Varas, Lake Llanquihue) and features a Chilean Terrier named Cholga.

### Core Technologies
- **Frontend:** Vanilla JavaScript, HTML5 Canvas API.
- **Audio:** Procedural 8-bit music and SFX synthesis via **Web Audio API**.
- **Backend:** Vercel Serverless Functions (`Node.js`).
- **Database:** Supabase (PostgreSQL) for the global leaderboard.
- **Tooling:** Vite (Build tool), Vercel (Deployment & Analytics).

### Architecture
- **Engine (`cholga-run/game.js`):** Manages the core game loop, physics (gravity, jumps), AABB collision detection, and state machine (Start, Playing, Paused, Game Over, Cutscene).
- **Audio Engine (`cholga-run/audio.js`):** Synthesizes music and sounds in real-time. No external audio files are used; everything is procedural.
- **Sprites (`cholga-run/sprites.js`):** Contains pixel-art definitions stored as character matrices (ASCII-like) which are drawn pixel-by-pixel to the canvas.
- **API (`cholga-run/api/high-score.js`):** Handles leaderboard GET/POST requests using Supabase.

## Building and Running

### Development
```bash
cd cholga-run
npm install
npm run dev
```
Starts the Vite development server at `http://localhost:5173`.

### Production Build
```bash
cd cholga-run
npm run build
npm run preview
```
Generates a minified production build in the `cholga-run/dist/` directory.

### Deployment
The project is configured for **Vercel**.
```bash
cd cholga-run
vercel deploy --prod
```

## Development Conventions

### Coding Style
- **Vanilla JS:** Prioritize pure JavaScript and Web APIs over external libraries or frameworks.
- **Modular Design:** Keep game logic, audio synthesis, and visual definitions separated into their respective files (`cholga-run/game.js`, `cholga-run/audio.js`, `cholga-run/sprites.js`).
- **Canvas Rendering:** All game objects must be rendered through the Canvas 2D context. Use `ctx.imageSmoothingEnabled = false` for sharp pixel art.
- **Performance:** Maintain 60 FPS using `requestAnimationFrame`. Use delta time for frame-rate independence (though current implementation leans on 60Hz targeting).

### Key Systems to Note
- **HUD:** Integrated directly into the Canvas (top 32px).
- **Mobile Support:** Features a custom virtual analog joystick and touch-friendly controls.
- **Dynamic Weather:** 7 distinct weather/time-of-day modes that affect background colors, particles (rain/lava), and music themes.
- **Stage System:** Every 10 stages, a cutscene plays. Difficulty and speed increase progressively.

### Environment Variables
For the leaderboard to function, the following are required in Vercel/Local `.env`:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Project Structure
- `cholga-run/index.html`: UI, HUD, and Canvas container.
- `cholga-run/game.js`: Main engine and logic.
- `cholga-run/audio.js`: Procedural audio synthesis.
- `cholga-run/sprites.js`: ASCII pixel-art data.
- `cholga-run/styles.css`: Layout, glassmorphism, and responsive UI.
- `cholga-run/api/`: Serverless backend functions.
- `cholga-run/public/`: Static assets (favicon, OG image).
