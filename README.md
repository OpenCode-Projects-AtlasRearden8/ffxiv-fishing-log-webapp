# FFXIV Fishing Log

A manual-entry fishing tracker for Final Fantasy XIV: log fish by spot with saltwater/freshwater tags, Eorzean window times, weather and bait notes, caught / still-needed statuses, a ranked rare-fish wish list, a push list for your next trip, and a milestone log.

Built by **Asdale Dynamics, LLC** as one of their practical, local-first tools. Zero dependencies, one HTML file, fully offline.

## What it does

- **Spots (per-spot view):** add fishing spots and tag them **Saltwater** or **Freshwater** (with filter buttons). Each spot card lists its fish with live window status.
- **Window times (Eorzean clock):** record windows like `8:00-12:00` or night windows like `20:00-04:00`. The app shows a live Eorzean clock in the header and marks every window **Open now** (with time remaining) or **Closed** (with a countdown in both Eorzean and real time — 1 Eorzean hour = 2m 55s real).
- **Weather and bait notes:** free-text fields per fish, e.g. `Snow` or `Clear or Fair skies`, plus the bait that worked.
- **Caught / still-needed:** every fish has a status badge and a one-click toggle.
- **Wish list:** rank your rare targets (`#1`, `#2`, ...), reorder them, and see live window status for each.
- **Push list:** an ordered chase queue of still-needed fish for your next session, with up/down ordering. Marking one caught logs it and clears it automatically.
- **Milestone log:** catches are logged automatically (fish, spot, bait, Eorzean time); you can also add manual milestones like "100 unique species!".
- **Backups:** export/import your data as a JSON file. Everything lives in your browser's localStorage — no accounts, no network, no tracking.

Manual entry only — no bots, no packet sniffing, no addons. That keeps it fully in line with the game's Terms of Service.

## How to run

No install, no build, no dependencies.

1. Download `index.html`.
2. Open it in any modern browser (double-click works; or serve it locally, e.g. `python3 -m http.server 8000` and visit `http://localhost:8000`).

The first run loads small sample data so you can see how everything works — edit or delete it and add your own spots. On first run the sample spots are expanded; click any spot header to expand or collapse it.

**Offline use:** the file makes zero network requests, so it works with Wi-Fi off. Some browsers restrict localStorage for `file://` pages; if your data does not persist, serve the file over localhost (command above) or use Export/Import backups.

## Data and privacy

- All data is stored in your browser under the key `ffxiv-fishing-log-v1`.
- Nothing is sent anywhere. The file contains no analytics, fonts, CDNs, or scripts from third parties.
- Use **Export backup** regularly, especially before clearing browser data. **Import backup** replaces current data with a backup file.
- **Reset all** wipes everything (it asks first).

## Window format

Windows are Eorzean (in-game) times: `HH:MM-HH:MM`. Midnight-crossing windows are fine: `20:00-04:00`. The window field is optional (some fish are anytime).

How the clock math works: one Eorzean day is 70 real minutes, so Eorzean time runs at 1440/70 = about 20.57x real time. The app derives the current Eorzean clock from your device's clock — no game connection involved.

## Tests

Window logic (Eorzean clock conversion, window parsing, open/closed boundaries, midnight-crossing windows, countdowns, data migration, HTML escaping) is covered by a dependency-free test suite that also smoke-tests the app against a stubbed DOM:

```
node tests.js
```

Requires Node.js 14 or newer. No `npm install` needed — the suite reads `index.html` directly and tests the code that actually ships.

## Project layout

- `index.html` — the entire app (HTML + CSS + JS, single file)
- `tests.js` — test suite (`node tests.js`)
- `LICENSE` — MIT
- `STATUS.md` — current build status, verification results, known gaps

## Credits, license, disclaimer

Copyright (c) 2026 Asdale Dynamics, LLC. Released under the [MIT License](LICENSE). See the LLC's other beginner-friendly AI guides and tools at dylanasdale.github.io.

FFXIV Fishing Log is an unofficial fan work. Final Fantasy XIV is a trademark of Square Enix Holdings Co., Ltd.; this project is not affiliated with or endorsed by Square Enix. Window and weather information you enter is your own; sample data in the first run is illustrative and should be verified in game.
