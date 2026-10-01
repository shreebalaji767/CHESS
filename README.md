# ♟️ CHESS — Chess Academy

A responsive browser chess application with a built-in chess engine and learning academy.

## Live Demo

Open Chess Academy Online: https://chess-master-gkgo.onrender.com/

## Features

- Play against the computer with multiple difficulty levels.
- Full chess rules handled by the built-in JavaScript engine.
- Chess Academy lessons with saved progress.
- Responsive UI for desktop, tablet and mobile.
- Progressive Web App support with install prompt and offline caching.
- Persistent light/dark theme.
- Online/offline status feedback.
- Keyboard shortcuts: N = new game, U = undo, P = play, A = academy, Esc = close modal.
- No database required for the browser game experience.
- Health endpoint for deployment monitoring.

## Stack

- Python + Flask
- Vanilla JavaScript
- HTML5
- CSS3
- Service Worker + Web App Manifest
- Render deployment

## Project Structure

- app.py — Flask application
- templates/index.html — application shell
- static/js/chess.js — chess rules and engine
- static/js/app.js — application controller
- static/js/academy.js — academy lessons
- static/js/enhancements.js — progressive UI and PWA enhancements
- static/css/style.css — main UI
- static/css/enhancements.css — theme and status enhancements
- static/service-worker.js — offline caching
- static/manifest.json — PWA metadata
- static/icons/icon.svg — application icon

## Run Locally

    pip install -r requirements.txt
    python app.py

Then open http://localhost:5000.

## Deployment

The repository includes render.yaml for Render deployment using Gunicorn.
