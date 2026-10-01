# ♟️ CHESS — Chess Academy V2

A responsive browser chess application with a built-in chess engine and learning academy.

## V2 upgrades

- Production-safe Flask configuration using Render's `PORT`.
- Security headers including CSP, clickjacking protection, MIME sniffing protection and a restricted Permissions Policy.
- Dark / light / system theme cycle with persistence.
- Sound feedback with a mute toggle.
- Fullscreen mode.
- Improved PWA install flow.
- Offline/online status feedback.
- Local statistics persistence.
- Global JavaScript error handling with user-friendly recovery messages.
- Keyboard shortcuts:
  - `N` — new game
  - `U` — undo
  - `P` — play
  - `A` — academy
  - `M` — mute/unmute
  - `F` — fullscreen
  - `Esc` — close modal
- Existing chess rules, AI, academy and PWA functionality retained.

## Stack

- Python + Flask
- Vanilla JavaScript
- HTML5
- CSS3
- Service Worker + Web App Manifest
- Render deployment

## Run locally

```bash
pip install -r requirements.txt
python app.py
```

Then open http://localhost:5000.

## Production

Render uses `gunicorn app:app` and automatically supplies `PORT`.
