# 🏴‍☠️ Treasure Hunt — The Glitch Protocol

A mobile-first, QR-code-based treasure hunt game built for technical events. Players scan QR codes at physical locations, solve coding puzzles, tech riddles, and rapid-fire questions across 4 rounds to win.

## 🎮 How It Works

1. **Login** — Player enters their team name
2. **QR Scan** — Camera opens to scan a QR code at the physical location
3. **Solve Questions** — Answer coding, logic, and tech questions
4. **Location Hints** — After each round, get a hint to find the next QR code
5. **Win or Get Eliminated** — 3 lifelines, lose them all and you're out!

## 🛠️ Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

## 🚀 Getting Started

```sh
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app will be running at `http://localhost:8080`

## 📝 Customization

To set up the game for your event, edit these files:

- **`src/data/questions.ts`** — Round questions, options, and correct answers
- **`src/data/gameData.ts`** — Level names and question data
- **`src/data/questions.ts` (locationHints)** — Physical location hints between rounds

## 🔒 Anti-Cheat Features

- Tab-switch detection (penalizes players who leave the app)
- Right-click disabled during gameplay
- Fullscreen mode enforced
- Dynamic watermark with team name + timestamp

## 📦 Build for Production

```sh
npm run build
```

Output will be in the `dist/` folder, ready to deploy on any static hosting.
