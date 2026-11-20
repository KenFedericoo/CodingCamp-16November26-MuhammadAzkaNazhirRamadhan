# Personal Dashboard
### Muhammad Azka Nazhir Ramadhan — CodingCamp Assignment

A clean, minimal personal dashboard built with HTML, CSS, and Vanilla JavaScript. All data is saved locally using the browser's LocalStorage API — no backend or server required.

---

## Features

| Feature | Description |
|---|---|
| **Greeting** | Shows current date & time, with a greeting that changes by time of day |
| **Focus Timer** | 25-minute Pomodoro timer with Start, Stop, and Reset controls |
| **To-Do List** | Add, edit, mark done, and delete tasks — persisted in LocalStorage |
| **Quick Links** | Save and open your favourite websites with one click |

## Challenges Implemented ✅

1. **Light / Dark Mode** — Toggle button in the top-right corner of the header; preference saved in LocalStorage
2. **Custom Name in Greeting** — Click "✏️ Edit Name" to set your name; it appears in the greeting and persists on reload
3. **Change Pomodoro Time** — Duration field above the timer lets you set any value from 1–120 minutes; saved in LocalStorage
4. **Prevent Duplicate Tasks** — Adding or editing a task to match an existing one (case-insensitive) shows an error instead of creating a duplicate
5. **Sort / Filter Tasks** — Filter buttons to view All, Active (undone), or Done tasks

> Three challenges are required; all five are implemented.

---

## Project Structure

```
index.html          ← single HTML file
css/
  style.css         ← all styles (one file)
js/
  app.js            ← all JavaScript (one file)
README.md
```

## Tech Stack

- HTML5
- CSS3 (custom properties for theming, CSS Grid, Flexbox)
- Vanilla JavaScript (ES2020, no frameworks)
- Browser LocalStorage API

## How to Run

Open `index.html` directly in any modern browser. No build step or server needed.

## Deployment

Published via GitHub Pages at: `https://<username>.github.io/CodingCamp-16November26-MuhammadAzkaNazhirRamadhan/`
