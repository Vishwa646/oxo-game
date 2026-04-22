# OXO — Tic Tac Toe

A retro-terminal styled Tic Tac Toe game built with React + Vite.

## Features
- 🎮 Player vs Player mode
- 🤖 Player vs AI mode (unbeatable Minimax algorithm)
- 📊 Score tracking across rounds
- 💚 Retro CRT terminal aesthetic

## Local Development

```bash
npm install
npm run dev
```

## Deploy to Vercel (Recommended)

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel
```
Follow the prompts — it auto-detects Vite. Done in ~60 seconds.

### Option 2: GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new
3. Import the repo
4. Vercel auto-detects Vite settings — click **Deploy**

## Deploy to Netlify

```bash
npm run build
# Then drag-and-drop the `dist/` folder to https://app.netlify.com/drop
```

Or connect your GitHub repo at https://netlify.com and set:
- Build command: `npm run build`
- Publish directory: `dist`

## Deploy to GitHub Pages

```bash
npm install --save-dev gh-pages
```

Add to `package.json`:
```json
"homepage": "https://YOUR_USERNAME.github.io/oxo-game",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Then run: `npm run deploy`

## Tech Stack
- React 18
- Vite 5
- Pure CSS (no Tailwind dependency needed)
- Minimax AI algorithm
