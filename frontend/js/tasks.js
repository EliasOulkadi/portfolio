const API_T = '/api/tasks';

let currentStatus   = 'all';
let currentPriority = 'all';
let selectedIds     = new Set();
let editingId       = null;

const overlay      = document.getElementById('task-overlay');
const taskForm     = document.getElementById('task-form');
const taskList     = document.getElementById('task-list');
const bulkBar      = document.getElementById('bulk-bar');
const bulkCountEl  = document.getElementById('bulk-count');

function openModal(task) {
  editingId = task ? task.id : null;
  document.getElementById('modal-label').textContent       = task ? 'Edit task' : 'New task';
  document.getElementById('modal-submit-btn').textContent  = task ? 'Save changes' : 'Create task';

  document.getElementById('f-title').value    = task ? task.title : '';
  document.getElementById('f-desc').value     = task ? (task.description || '') : '';
  document.getElementById('f-status').value   = task ? task.status : 'pending';
  document.getElementById('f-priority').value = task ? task.priority : 'medium';
  document.getElementById('f-due').value      = task && task.due_date ? task.due_date.split('T')[0] : '';

  const deleteArea = document.getElementById('modal-delete-area');
  if (task) {
    deleteArea.innerHTML = `<button type="button" class="btn btn-danger btn-sm" id="modal-del-btn">Delete</button>`;
    document.getElementById('modal-del-btn').addEventListener('click', async () => {
      if (!confirm('Delete this task?')) return;
      await deleteTask(task.id);
      closeModal();
    });
  } else {
    deleteArea.innerHTML = '';
  }

  overlay.classList.add('open');
  setTimeout(() => document.getElementById('f-title').focus(), 60);
}

function closeModal() {
  overlay.classList.remove('open');
  taskForm.reset();
  editingId = null;
}

window.openModal  = openModal;
window.closeModal = closeModal;

document.getElementById('modal-close-btn').addEventListener('click', closeModal);
document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('modal-submit-btn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const body = {
    title:       document.getElementById('f-title').value.trim(),
    description: document.getElementById('f-desc').value.trim(),
    status:      document.getElementById('f-status').value,
    priority:    document.getElementById('f-priority').value,
    due_date:    document.getElementById('f-due').value || null
  };

  try {
    const url    = editingId ? `${API_T}/${editingId}` : API_T;
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${window.apiToken}` },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json();
      toast(err.error || 'Something went wrong', 'error');
    } else {
      toast(editingId ? 'Task updated' : 'Task created', 'success');
      closeModal();
      loadTasks();
      window.reloadOverview();
    }
  } catch {
    toast('Connection error', 'error');
  }

  btn.disabled = false;
  btn.textContent = editingId ? 'Save changes' : 'Create task';
});

async function deleteTask(id) {
  try {
    const res = await fetch(`${API_T}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${window.apiToken}` }
    });
    if (res.ok) {
      toast('Task deleted', 'success');
      loadTasks();
      window.reloadOverview();
    } else {
      toast('Could not delete', 'error');
    }
  } catch {
    toast('Connection error', 'error');
  }
}

async function cycleStatus(task) {
  const cycle = { 'pending': 'in-progress', 'in-progress': 'completed', 'completed': 'pending' };
  const next  = cycle[task.status] || 'pending';
  try {
    const res = await fetch(`${API_T}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${window.apiToken}` },
      body: JSON.stringify({ status: next })
    });
    if (res.ok) { loadTasks(); window.reloadOverview(); }
  } catch {
    toast('Connection error', 'error');
  }
}

async function toggleDone(task) {
  const next = task.status === 'completed' ? 'pending' : 'completed';
  try {
    const res = await fetch(`${API_T}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${window.apiToken}` },
      body: JSON.stringify({ status: next })
    });
    if (res.ok) { loadTasks(); window.reloadOverview(); }
  } catch {
    toast('Connection error', 'error');
  }
}

function toggleSelect(id) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    selectedIds.add(id);
  }
  updateBulkBar();
  const row = taskList.querySelector(`[data-id="${id}"]`);
  if (row) row.style.background = selectedIds.has(id) ? 'var(--bg-4)' : '';
}

function updateBulkBar() {
  const n = selectedIds.size;
  if (n > 0) {
    bulkBar.classList.add('visible');
    bulkCountEl.textContent = `${n} selected`;
  } else {
    bulkBar.classList.remove('visible');
  }
}

document.getElementById('bulk-clear-btn').addEventListener('click', () => {
  selectedIds.clear();
  updateBulkBar();
  taskList.querySelectorAll('.task-row').forEach(r => r.style.background = '');
});

document.getElementById('bulk-delete-btn').addEventListener('click', async () => {
  if (!selectedIds.size) return;
  if (!confirm(`Delete ${selectedIds.size} task(s)?`)) return;

  const ids = [...selectedIds];
  await Promise.all(ids.map(id =>
    fetch(`${API_T}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${window.apiToken}` }
    })
  ));

  selectedIds.clear();
  updateBulkBar();
  toast(`${ids.length} tasks deleted`, 'success');
  loadTasks();
  window.reloadOverview();
});

document.getElementById('quick-add-input').addEventListener('keydown', async (e) => {
  if (e.key !== 'Enter') return;
  const title = e.target.value.trim();
  if (!title) return;

  e.target.disabled = true;
  try {
    const res = await fetch(API_T, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${window.apiToken}` },
      body: JSON.stringify({ title, status: 'pending', priority: 'medium' })
    });
    if (res.ok) {
      e.target.value = '';
      toast('Task added', 'success');
      loadTasks();
      window.reloadOverview();
    } else {
      toast('Could not add task', 'error');
    }
  } catch {
    toast('Connection error', 'error');
  }
  e.target.disabled = false;
  e.target.focus();
});

document.getElementById('status-filters').addEventListener('click', (e) => {
  const pill = e.target.closest('.filter-pill');
  if (!pill) return;

  if (pill.dataset.status !== undefined) {
    document.querySelectorAll('[data-status]').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentStatus = pill.dataset.status;
    loadTasks();
  }

  if (pill.dataset.priority !== undefined) {
    document.querySelectorAll('[data-priority]').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentPriority = pill.dataset.priority;
    loadTasks();
  }
});

function setStatusFilter(status) {
  document.querySelectorAll('[data-status]').forEach(p => p.classList.remove('active'));
  const pill = document.querySelector(`[data-status="${status}"]`);
  if (pill) pill.classList.add('active');
  currentStatus = status;
}

function setPriorityFilter(priority) {
  document.querySelectorAll('[data-priority]').forEach(p => p.classList.remove('active'));
  const pill = document.querySelector(`[data-priority="${priority}"]`);
  if (pill) pill.classList.add('active');
  currentPriority = priority;
}

window.setStatusFilter   = setStatusFilter;
window.setPriorityFilter = setPriorityFilter;

function renderTasks(tasks) {
  if (!tasks.length) {
    taskList.innerHTML = `
      <div class="empty-state">
        <p class="empty-line">// no tasks found</p>
        <p>Use the quick-add bar or press <strong>N</strong></p>
      </div>`;
    return;
  }

  taskList.innerHTML = tasks.map(t => {
    const id       = 'TF-' + t.id.slice(0, 4).toUpperCase();
    const done     = t.status === 'completed';
    const due      = t.due_date ? window.formatDueDate(t.due_date) : null;
    const dueClass = due ? window.getDueCls(t.due_date, t.status) : '';
    const selected = selectedIds.has(t.id);

    return `
      <div class="task-row ${done ? 'completed-row' : ''}" data-id="${t.id}" style="${selected ? 'background:var(--bg-4)' : ''}">
        <div class="task-check ${done ? 'done' : ''}" onclick="toggleDone(${JSON.stringify(t).replace(/"/g,'&quot;')})" title="Toggle done"></div>
        <div class="task-priority-bar pbar-${t.priority}"></div>
        <span class="task-id" onclick="toggleSelect('${t.id}')" style="cursor:pointer" title="Select">${id}</span>
        <div class="task-title-cell">
          <span class="task-title-text ${done ? 'struck' : ''}">${window.escHtml(t.title)}</span>
          ${t.description ? `<span class="task-desc-snippet">${window.escHtml(t.description).slice(0, 40)}</span>` : ''}
        </div>
        <span class="status-tag status-${t.status}" onclick="cycleStatus(${JSON.stringify(t).replace(/"/g,'&quot;')})" title="Click to cycle status">${t.status}</span>
        <span class="priority-tag priority-${t.priority}">${t.priority}</span>
        <span class="due-cell ${dueClass}">${due || '—'}</span>
        <div class="row-actions">
          <button class="icon-btn" onclick="openModal(${JSON.stringify(t).replace(/"/g,'&quot;')})" title="Edit">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          </button>
          <button class="icon-btn danger" onclick="deleteTask('${t.id}')" title="Delete">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function loadTasks() {
  taskList.innerHTML = '<div class="loading-row"><div class="spinner"></div> loading tasks</div>';

  const params = new URLSearchParams();
  if (currentStatus !== 'all')   params.set('status', currentStatus);
  if (currentPriority !== 'all') params.set('priority', currentPriority);
  const search = document.getElementById('search-input').value.trim();
  if (search) params.set('search', search);

  try {
    const res   = await fetch(`${API_T}?${params}`, { headers: { Authorization: `Bearer ${window.apiToken}` } });
    const tasks = await res.json();
    renderTasks(tasks);
  } catch {
    taskList.innerHTML = '<div class="empty-state"><p style="color:var(--danger)">Failed to load tasks</p></div>';
  }
}

function toast(msg, type = 'info') {
  const container = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.25s';
    setTimeout(() => el.remove(), 250);
  }, 2800);
}

window.toast        = toast;
window.loadTasks    = loadTasks;
window.deleteTask   = deleteTask;
window.cycleStatus  = cycleStatus;
window.toggleDone   = toggleDone;
window.toggleSelect = toggleSelect;
