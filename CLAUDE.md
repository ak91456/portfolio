# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run dev server (from the core/ directory where manage.py lives)
python manage.py runserver

# Apply migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Run tests
python manage.py test

# Run a specific test
python manage.py test desktop.tests.SomeTestCase

# Run with pytest
pytest
pytest desktop/tests.py::SomeTestCase::test_method

# Lint / format
black .
isort .
flake8 .
```

## Architecture

This is a Django 5 backend for **AryaOS** — a portfolio project that simulates a browser-based desktop OS. There is no frontend framework; the frontend is a single Django-served HTML page with vanilla JS.

**Django project layout:**
- `core/` — Django project config (settings, root URLconf, wsgi/asgi)
- `desktop/` — the only Django app; handles all views, URLs, and services

**Request flow:**
1. `GET /` → `desktop` view renders `desktop/templates/desktop/index.html`
2. `GET /fs/tree/` → `file_tree` view calls `desktop/services/filesystem/tree.py::build_tree()` and returns JSON
3. `POST /api/terminal/` → `terminal_api` view parses commands and dispatches them inline

**Filesystem sandbox (`aryaos_storage/`):**
All filesystem operations are sandboxed to the `aryaos_storage/` directory (resolved at runtime relative to `cwd` when `manage.py runserver` is launched). Path traversal is blocked by checking that resolved paths still start with `BASE_FS`.

There are two filesystem service modules that overlap:
- `desktop/services/filesystem/commands.py` — older service with permission checks; uses `permissions.py` to read/write `aryaos_storage/.permissions.json`
- `desktop/services/filesystem/tree.py` — builds a recursive JSON tree for the Files app

The `terminal_api` view in `views.py` **does not use** `commands.py`; it re-implements all commands inline. `commands.py` is currently unused but retained.

**Frontend (`desktop/static/desktop/js/os.js`):**
- Manages draggable windows (`makeDraggable`), a window registry by DOM id, and app templates in `appContent`
- Terminal sends commands to `/api/terminal/` and dispatches a `fs:changed` event on mutating operations, which triggers a file tree refresh if the Files app is open
- Auto-opens the AI info window on load

**Permissions:**
Unix-style octal permissions (e.g. `755`, `644`) are stored as a JSON map in `aryaos_storage/.permissions.json`. Permission checks only look at the owner digit (index `[0]` of the mode string).

## Docker

The Dockerfile is a two-stage build: a Node.js stage that builds a frontend (currently no-op since there's no `package.json`) and a Python 3.11-slim stage that runs gunicorn on `$PORT` (default `10000`). Static files are collected during build via `manage.py collectstatic`.

## Key notes

- The database is SQLite (`db.sqlite3`) and has no models yet — `desktop/models.py` is empty.
- `requirements.txt` lists heavy ML dependencies (`torch`, `transformers`, `sentence-transformers`, `faiss-cpu`, `langchain`) that are not yet used in the codebase. They are likely planned for the AI assistant window.
- Many packages in `requirements.txt` (`djangorestframework`, `channels`, `celery`, `redis`, `django-allauth`) are also not yet integrated into `settings.py` or used anywhere.
