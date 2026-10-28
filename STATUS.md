# STATUS

## What was built

**FFXIV Fishing Log** — a static, single-file web app (`index.html`) for logging Final Fantasy XIV fishing catches by manual entry only (no bots, no packet sniffing, nothing that touches the game client). Pure HTML/CSS/JavaScript, zero dependencies, works fully offline, all data in `localStorage`.

Features:

- **Per-spot view** — spot cards with **saltwater / freshwater tags** (plus filter buttons), notes, and caught/total counts; click a spot header to expand its fish list.
- **Window times (in-game clock)** — per-fish windows in Eorzean time (`8:00-12:00`, midnight-crossing `20:00-04:00` supported); live Eorzean clock in the header (1 Eorzean hour = 2m 55s real); every window shows **Open now** (time left) or **Closed** (countdown in Eorzean and real time), refreshed continuously.
- **Weather and bait notes** — free-text fields per fish.
- **Caught / still-needed statuses** — one-click toggle with badges and per-spot counts.
- **Wish list** — ranked rare targets (`#1`, `#2`, ...), reorderable, with live window status.
- **Push list** — ordered chase queue of still-needed fish for the next session; "Caught it!" logs a milestone and clears the entry automatically.
- **Milestone log** — automatic entries when a fish is marked caught (fish, spot, bait, Eorzean time) plus manual milestone entries.
- **Backups** — JSON export/import; **Reset all** with confirmation.
- First run seeds small sample data (clearly marked as samples) so the app is usable immediately.

## Files

- `index.html` — the entire app (single file)
- `tests.js` — dependency-free test suite (`node tests.js`, needs Node 14+)
- `README.md` — usage, run instructions, data/privacy notes, credits
- `LICENSE` — MIT, copyright line exactly `Copyright (c) 2026 Asdale Dynamics, LLC`
- `.gitignore`, `STATUS.md` (this file)

## How to run

Open `index.html` in any modern browser (double-click it, or serve it: `python3 -m http.server 8000` → http://localhost:8000). Serving locally is recommended if your browser restricts `file://` localStorage. Run tests with `node tests.js`.

## Verification results

Environment: Linux, Node v20.19.2, git 2.47.3, Python 3.13.5.

1. **Test suite:** `node tests.js` → **73 passed, 0 failed** (exit code 0). Covers Eorzean clock conversion (70-min day, 20.57x ratio, day wrap, 1 ET hour = 175 real seconds), window parsing (valid/invalid/midnight-crossing), open/closed boundary semantics (start inclusive, end exclusive), midnight-crossing windows, countdowns (minutes-until-open/close), `describeWindow` labels, data migration/normalization, HTML escaping, ID uniqueness, plus a **DOM smoke test**: the script is extracted from `index.html` and booted against a stubbed browser environment (document/window/localStorage), asserting the app renders the seed data, shows an `HH:MM` Eorzean clock, and persists to localStorage.
2. **Syntax check:** the inline `<script id="app-js">` was extracted and passed `node --check`.
3. **HTML structure:** tag balance verified with a Python HTMLParser pass → no errors.
4. The test suite intentionally reads the script **out of the shipped `index.html`**, so the tests verify the real artifact rather than a copy.

## Known gaps

- Sample data is illustrative — windows/weather/bait in the seed are plausible examples, not authoritative; verify in game (e.g. Lodestone or a fishing database) before a trip.
- No built-in fish database — the tracker is deliberately manual-entry only, so users type their own fish/windows (this is the feature that keeps it ToS-safe, but it means more typing).
- No automated test in a real browser (the DOM test uses stubs); render behavior should be eyeballed once in your browser of choice.
- Data is per-browser/per-origin localStorage only — no sync across devices or browsers (use Export/Import to move data manually).
- Milestone log grows unbounded (no auto-pruning); deletions are manual.
- No localization beyond English; no dark/light theme toggle (single dark theme).
- The window countdown chips refresh every 5 seconds; sub-minute precision on "opens in" labels is approximate by design.
