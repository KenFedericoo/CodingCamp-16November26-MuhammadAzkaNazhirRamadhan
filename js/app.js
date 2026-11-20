/* =====================================================
   DASHBOARD — app.js
   Vanilla JS, no frameworks.
   Features: Greeting + datetime, Focus Timer, To-Do,
             Quick Links, LocalStorage persistence.
   Challenges: Light/Dark mode, Custom name,
               Change Pomodoro time, Prevent duplicate
               tasks, Sort/filter tasks.
   ===================================================== */

'use strict';

/* ─────────────────────────────────────────────────────
   CONSTANTS & STATE
───────────────────────────────────────────────────── */
const STORAGE = {
  THEME:    'db_theme',
  NAME:     'db_username',
  TODOS:    'db_todos',
  LINKS:    'db_links',
  DURATION: 'db_timer_duration',
};

/* ─────────────────────────────────────────────────────
   UTILITY HELPERS
───────────────────────────────────────────────────── */

/** Load JSON from localStorage, return fallback on error. */
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Persist value as JSON to localStorage. */
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Sanitise user-supplied text to prevent XSS. */
function sanitise(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ─────────────────────────────────────────────────────
   1. DATETIME & GREETING
───────────────────────────────────────────────────── */
const datetimeEl = document.getElementById('datetime');
const greetingEl = document.getElementById('greeting');
const nameDisplayEl = document.getElementById('name-display');

function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

function updateDatetime() {
  const now  = new Date();
  const hour = now.getHours();

  // Date string
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Time string (12-hour)
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  datetimeEl.textContent = `${dateStr} · ${timeStr}`;

  // Greeting
  const name = load(STORAGE.NAME, '');
  const greeting = getGreeting(hour);
  greetingEl.textContent = name ? `${greeting}, ${name}! 👋` : `${greeting}! 👋`;

  nameDisplayEl.textContent = name ? `Logged in as: ${name}` : 'Who are you? Set your name →';
}

// Update every second
updateDatetime();
setInterval(updateDatetime, 1000);

/* ─────────────────────────────────────────────────────
   2. LIGHT / DARK MODE  (Challenge ✅)
───────────────────────────────────────────────────── */
const themeToggle = document.getElementById('theme-toggle');
const html        = document.documentElement;

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

// Initialise theme
applyTheme(load(STORAGE.THEME, 'light'));

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  save(STORAGE.THEME, next);
  applyTheme(next);
});

/* ─────────────────────────────────────────────────────
   3. CUSTOM NAME  (Challenge ✅)
───────────────────────────────────────────────────── */
const editNameBtn  = document.getElementById('edit-name-btn');
const nameEditor   = document.getElementById('name-editor');
const nameInput    = document.getElementById('name-input');
const saveNameBtn  = document.getElementById('save-name-btn');

editNameBtn.addEventListener('click', () => {
  nameEditor.classList.toggle('hidden');
  if (!nameEditor.classList.contains('hidden')) {
    nameInput.value = load(STORAGE.NAME, '');
    nameInput.focus();
  }
});

saveNameBtn.addEventListener('click', saveName);
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveName();
  if (e.key === 'Escape') nameEditor.classList.add('hidden');
});

function saveName() {
  const val = nameInput.value.trim();
  save(STORAGE.NAME, val);
  nameEditor.classList.add('hidden');
  updateDatetime(); // refresh greeting immediately
}

/* ─────────────────────────────────────────────────────
   4. FOCUS TIMER  (Challenge: change Pomodoro time ✅)
───────────────────────────────────────────────────── */
const timerTimeEl      = document.getElementById('timer-time');
const startBtn         = document.getElementById('timer-start');
const stopBtn          = document.getElementById('timer-stop');
const resetBtn         = document.getElementById('timer-reset');
const durationInput    = document.getElementById('timer-duration');
const applyDurationBtn = document.getElementById('apply-duration-btn');

let timerInterval  = null;
let timerRunning   = false;
let totalSeconds   = load(STORAGE.DURATION, 25) * 60;
let remainingSeconds = totalSeconds;

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() {
  timerTimeEl.textContent = formatTime(remainingSeconds);
}

function setTimerButtons(running) {
  startBtn.disabled = running;
  stopBtn.disabled  = !running;
}

// Initialise display with stored duration
durationInput.value = load(STORAGE.DURATION, 25);
renderTimer();

applyDurationBtn.addEventListener('click', () => {
  if (timerRunning) return; // don't change while running
  const mins = parseInt(durationInput.value, 10);
  if (isNaN(mins) || mins < 1 || mins > 120) {
    durationInput.style.borderColor = '#e53e3e';
    setTimeout(() => durationInput.style.borderColor = '', 1200);
    return;
  }
  save(STORAGE.DURATION, mins);
  totalSeconds = mins * 60;
  remainingSeconds = totalSeconds;
  renderTimer();
});

startBtn.addEventListener('click', () => {
  if (timerRunning) return;
  timerRunning = true;
  setTimerButtons(true);

  timerInterval = setInterval(() => {
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      setTimerButtons(false);
      timerTimeEl.textContent = '00:00';
      showNotification('🎉 Focus session complete! Take a break.');
      return;
    }
    remainingSeconds--;
    renderTimer();
  }, 1000);
});

stopBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning = false;
  setTimerButtons(false);
});

resetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning = false;
  setTimerButtons(false);
  remainingSeconds = totalSeconds;
  renderTimer();
});

/** Show browser notification or console fallback. */
function showNotification(message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(message);
  } else {
    alert(message);
  }
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

/* ─────────────────────────────────────────────────────
   5. TO-DO LIST
   Challenge: Prevent duplicate tasks ✅
   Challenge: Sort / filter tasks ✅
───────────────────────────────────────────────────── */
const todoInput  = document.getElementById('todo-input');
const todoAddBtn = document.getElementById('todo-add-btn');
const todoListEl = document.getElementById('todo-list');
const todoEmptyEl = document.getElementById('todo-empty');
const sortBtns   = document.querySelectorAll('.sort-btn');

// Modal elements for editing
const editModal     = document.getElementById('edit-modal');
const editTaskInput = document.getElementById('edit-task-input');
const modalSaveBtn  = document.getElementById('modal-save-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

let todos     = load(STORAGE.TODOS, []);  // [{ id, text, done }]
let editingId = null;
let currentFilter = 'all';

function saveTodos() {
  save(STORAGE.TODOS, todos);
}

/** Returns filtered list based on currentFilter. */
function getFilteredTodos() {
  if (currentFilter === 'active') return todos.filter(t => !t.done);
  if (currentFilter === 'done')   return todos.filter(t => t.done);
  return todos;
}

function renderTodos() {
  todoListEl.innerHTML = '';
  const list = getFilteredTodos();

  if (list.length === 0) {
    todoEmptyEl.classList.remove('hidden');
  } else {
    todoEmptyEl.classList.add('hidden');
  }

  list.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item${todo.done ? ' done' : ''}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.done ? 'checked' : ''}
             aria-label="Mark '${sanitise(todo.text)}' as done" />
      <span class="todo-text">${sanitise(todo.text)}</span>
      <div class="todo-actions">
        <button class="btn btn-outline btn-sm todo-edit-btn" aria-label="Edit task">✏️</button>
        <button class="btn btn-danger btn-sm todo-delete-btn" aria-label="Delete task">🗑️</button>
      </div>`;

    // Toggle done
    li.querySelector('.todo-checkbox').addEventListener('change', (e) => {
      const t = todos.find(t => t.id === todo.id);
      if (t) t.done = e.target.checked;
      saveTodos();
      renderTodos();
    });

    // Edit
    li.querySelector('.todo-edit-btn').addEventListener('click', () => {
      openEditModal(todo.id, todo.text);
    });

    // Delete
    li.querySelector('.todo-delete-btn').addEventListener('click', () => {
      todos = todos.filter(t => t.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    todoListEl.appendChild(li);
  });
}

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  // Challenge: Prevent duplicate tasks (case-insensitive) ✅
  const isDuplicate = todos.some(
    t => t.text.toLowerCase() === text.toLowerCase()
  );
  if (isDuplicate) {
    showInlineError(todoInput, '⚠️ Task already exists!');
    return;
  }

  todos.push({ id: Date.now(), text, done: false });
  saveTodos();
  todoInput.value = '';
  currentFilter = 'all';
  updateSortButtons();
  renderTodos();
}

todoAddBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

// Sort / filter buttons
sortBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.sort;
    updateSortButtons();
    renderTodos();
  });
});

function updateSortButtons() {
  sortBtns.forEach(b => {
    b.classList.toggle('active', b.dataset.sort === currentFilter);
  });
}

// Edit modal
function openEditModal(id, currentText) {
  editingId = id;
  editTaskInput.value = currentText;
  editModal.classList.remove('hidden');
  editTaskInput.focus();
  editTaskInput.select();
}

function closeEditModal() {
  editModal.classList.add('hidden');
  editingId = null;
}

modalSaveBtn.addEventListener('click', saveEdit);
editTaskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveEdit();
  if (e.key === 'Escape') closeEditModal();
});
modalCancelBtn.addEventListener('click', closeEditModal);
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});

function saveEdit() {
  const newText = editTaskInput.value.trim();
  if (!newText) return;

  // Prevent duplicate on edit too
  const isDuplicate = todos.some(
    t => t.id !== editingId && t.text.toLowerCase() === newText.toLowerCase()
  );
  if (isDuplicate) {
    showInlineError(editTaskInput, '⚠️ A task with this name already exists!');
    return;
  }

  const t = todos.find(t => t.id === editingId);
  if (t) t.text = newText;
  saveTodos();
  closeEditModal();
  renderTodos();
}

// Initial render
renderTodos();

/* ─────────────────────────────────────────────────────
   6. QUICK LINKS
───────────────────────────────────────────────────── */
const linkNameInput = document.getElementById('link-name-input');
const linkUrlInput  = document.getElementById('link-url-input');
const linkAddBtn    = document.getElementById('link-add-btn');
const linksGrid     = document.getElementById('links-grid');
const linksEmptyEl  = document.getElementById('links-empty');

let links = load(STORAGE.LINKS, []); // [{ id, name, url }]

function saveLinks() {
  save(STORAGE.LINKS, links);
}

function renderLinks() {
  linksGrid.innerHTML = '';

  if (links.length === 0) {
    linksEmptyEl.classList.remove('hidden');
    return;
  }
  linksEmptyEl.classList.add('hidden');

  links.forEach(link => {
    // Build chip
    const chip = document.createElement('div');
    chip.className = 'link-chip';

    const anchor = document.createElement('a');
    anchor.href   = link.url;
    anchor.target = '_blank';
    anchor.rel    = 'noopener noreferrer';
    anchor.textContent = link.name;
    anchor.style.textDecoration = 'none';
    anchor.style.color = 'inherit';

    const delBtn = document.createElement('button');
    delBtn.className = 'link-delete';
    delBtn.textContent = '✕';
    delBtn.setAttribute('aria-label', `Remove ${link.name}`);
    delBtn.addEventListener('click', (e) => {
      e.preventDefault();
      links = links.filter(l => l.id !== link.id);
      saveLinks();
      renderLinks();
    });

    chip.appendChild(anchor);
    chip.appendChild(delBtn);
    linksGrid.appendChild(chip);
  });
}

function addLink() {
  const name = linkNameInput.value.trim();
  const rawUrl = linkUrlInput.value.trim();
  if (!name || !rawUrl) return;

  // Auto-prepend https:// if missing
  const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    showInlineError(linkUrlInput, 'Please enter a valid URL.');
    return;
  }

  links.push({ id: Date.now(), name, url });
  saveLinks();
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  renderLinks();
}

linkAddBtn.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addLink();
});
linkNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') linkUrlInput.focus();
});

// Initial render
renderLinks();

/* ─────────────────────────────────────────────────────
   SHARED: Inline error helper
───────────────────────────────────────────────────── */
function showInlineError(inputEl, message) {
  inputEl.style.borderColor = '#e53e3e';
  inputEl.setAttribute('title', message);
  inputEl.focus();

  // Create or update tooltip
  let tip = inputEl.parentElement.querySelector('.error-tip');
  if (!tip) {
    tip = document.createElement('span');
    tip.className = 'error-tip';
    tip.style.cssText = `
      display:block; color:#e53e3e; font-size:0.78rem;
      margin-top:4px; animation: fadeIn 0.2s ease;
    `;
    inputEl.insertAdjacentElement('afterend', tip);
  }
  tip.textContent = message;

  setTimeout(() => {
    inputEl.style.borderColor = '';
    inputEl.removeAttribute('title');
    if (tip) tip.remove();
  }, 2500);
}
