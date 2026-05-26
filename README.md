# Dijkstra's Game

A retro React/Electron game for exploring Dijkstra's pathfinding algorithm.

## Run

```powershell
npm install
npm start
```

Open `http://127.0.0.1:3000/`.

## Desktop App

```powershell
npm install
npm run desktop
```

`npm run desktop` builds the Vite app into `build/` and launches it in Electron.

If Electron reports that its binary did not install correctly on this Windows
machine, run:

```powershell
$env:NODE_OPTIONS='--use-system-ca'
npx install-electron --no
```

## Development Electron Window

```powershell
npm install
npm run dev
```

This starts the Vite dev server on port `3000` and opens Electron against it.

## Checks

```powershell
npm run build
$env:NODE_OPTIONS='--use-system-ca'
npm audit --audit-level=low
```
