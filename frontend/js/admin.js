const token = localStorage.getItem('admin_token');
if (!token) window.location.href = '/admin';

const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
document.getElementById('sidebar-user').textContent = user.email || '';

const api = (url, opts = {}) => fetch(url, {
  ...opts,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(opts.headers || {})
  }
}).then(async r => {
  if (r.status === 401) { localStorage.clear(); window.location.href = '/admin'; }
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Error');
  return d;
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = '/admin';
});

let projects = [];
let messages = [];
let tasks    = [];
let currentTaskFilter = 'all';

async function loadAll() {
  try {
    [projects, messages, tasks] = await Promise.all([
      api('/api/projects'),
      api('/api/contact'),
      api('/api/tasks')
    ]);
    renderStats();
    renderOverview();
    renderProjects();
    renderMessages();
    renderTasks();
  } catch (e) {
    console.error('loadAll error:', e.message);
  }
}

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDue(str) {
  if (!str) return '—';
  const d = new Date(str);
  const now = new Date(); now.setHours(0,0,0,0);
  const diff = d - now;
  const days = Math.ceil(diff / 86400000);
  const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  if (days < 0) return `<span style="color:#fca5a5">${label}</span>`;
  if (days === 0) return `<span style="color:#fde68a">${label}</span>`;
  if (days <= 3) return `<span style="color:#93c5fd">${label}</span>`;
  return `<span style="color:rgba(255,255,255,0.5)">${label}</span>`;
}

function statusBadge(s) {
  const map = { 'pending': '#6b7280', 'in-progress': '#3b82f6', 'completed': '#22c55e' };
  const label = s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1);
  return `<span style="font-family:var(--mono);font-size:10px;padding:3px 8px;border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);letter-spacing:0.04em">${label}</span>`;
}

function priorityBadge(p) {
  const map = { low: 'rgba(255,255,255,0.2)', medium: 'rgba(255,255,255,0.4)', high: '#f97316', urgent: '#ef4444' };
  return `<span style="font-family:var(--mono);font-size:10px;color:${map[p]||'#fff'};letter-spacing:0.04em">${p}</span>`;
}

function esc(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderStats() {
  const unread = messages.filter(m => !m.read).length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  document.getElementById('stat-projects').textContent = projects.length;
  document.getElementById('stat-tasks').textContent = tasks.length;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-messages').textContent = messages.length;
  document.getElementById('stat-unread').textContent = unread;
  document.getElementById('badge-projects').textContent = projects.length;
  document.getElementById('badge-tasks').textContent = tasks.length;
  document.getElementById('badge-messages').textContent = unread || messages.length;
}

function renderOverview() {
  const msgBody = document.getElementById('overview-msgs-body');
  const recent = messages.slice(0, 4);
  msgBody.innerHTML = recent.length
    ? recent.map(m => `<tr>
        <td>${m.read ? '' : '<span class="unread-dot"></span>'}</td>
        <td>${esc(m.name)}</td>
        <td class="td-muted">${esc(m.email)}</td>
        <td class="td-muted">${fmtDate(m.created_at)}</td>
      </tr>`).join('')
    : '<tr class="empty-row"><td colspan="4">// no messages yet</td></tr>';

  const taskBody = document.getElementById('overview-tasks-body');
  const recentT = tasks.slice(0, 4);
  taskBody.innerHTML = recentT.length
    ? recentT.map(t => `<tr>
        <td>${esc(t.title)}</td>
        <td>${statusBadge(t.status)}</td>
        <td>${priorityBadge(t.priority)}</td>
        <td>${fmtDue(t.due_date)}</td>
      </tr>`).join('')
    : '<tr class="empty-row"><td colspan="4">// no tasks yet</td></tr>';
}

function renderTasks() {
  const filtered = currentTaskFilter === 'all'
    ? tasks
    : tasks.filter(t => t.status === currentTaskFilter);

  const tbody = document.getElementById('tasks-body');
  if (!filtered.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">// no tasks — use the input above or + New Task</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map((t, i) => `
    <tr>
      <td class="td-muted" style="font-family:var(--mono);font-size:11px">${String(i+1).padStart(2,'0')}</td>
      <td><strong>${esc(t.title)}</strong>${t.description ? `<br><span class="td-muted" style="font-size:12px">${esc(t.description.slice(0,60))}${t.description.length>60?'...':''}</span>` : ''}</td>
      <td>${statusBadge(t.status)}</td>
      <td>${priorityBadge(t.priority)}</td>
      <td>${fmtDue(t.due_date)}</td>
      <td>
        <div class="actions">
          <button class="btn btn-outline btn-sm" onclick="openEditTask('${t.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteTask('${t.id}')">Del</button>
        </div>
      </td>
    </tr>`).join('');
}

function renderProjects() {
  const tbody = document.getElementById('projects-body');
  if (!projects.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">// no projects — click + New Project to add one</td></tr>';
    return;
  }
  tbody.innerHTML = projects.map((p, i) => {
    const gh   = p.github_url ? `<a href="${p.github_url}" target="_blank" style="font-family:var(--mono);font-size:11px;color:rgba(255,255,255,0.5);border:1px solid var(--border);padding:3px 8px">GH</a>` : '';
    const live = p.live_url   ? `<a href="${p.live_url}" target="_blank" style="font-family:var(--mono);font-size:11px;color:rgba(255,255,255,0.5);border:1px solid var(--border);padding:3px 8px">↗</a>` : '';
    return `<tr>
      <td class="td-muted" style="font-family:var(--mono);font-size:11px">${String(i+1).padStart(2,'0')}</td>
      <td><strong>${esc(p.title)}</strong></td>
      <td class="td-muted" style="font-size:12px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.tech||'')}</td>
      <td style="display:flex;gap:6px;align-items:center">${gh} ${live}</td>
      <td><div class="actions">
        <button class="btn btn-outline btn-sm" onclick="openEditProject('${p.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProject('${p.id}')">Del</button>
      </div></td>
    </tr>`;
  }).join('');
}

function renderMessages() {
  const tbody = document.getElementById('messages-body');
  if (!messages.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">// no messages yet</td></tr>';
    return;
  }
  tbody.innerHTML = messages.map(m => `
    <tr style="cursor:pointer" onclick="openMessage(${JSON.stringify(JSON.stringify(m))})">
      <td>${m.read ? '' : '<span class="unread-dot"></span>'}</td>
      <td>${esc(m.name)}</td>
      <td class="td-muted">${esc(m.email)}</td>
      <td class="td-muted" style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px">${esc(m.message)}</td>
      <td class="td-muted" style="white-space:nowrap">${fmtDate(m.created_at)}</td>
    </tr>`).join('');
}

function openMessage(jsonStr) {
  const m = JSON.parse(jsonStr);
  document.getElementById('msg-modal-title').textContent = `Message from ${m.name}`;
  document.getElementById('msg-from').textContent  = m.name;
  document.getElementById('msg-email').textContent = m.email;
  document.getElementById('msg-text').textContent  = m.message;
  document.getElementById('msg-modal').classList.add('open');
  if (!m.read) {
    api(`/api/contact/${m.id}/read`, { method: 'PATCH' }).then(() => {
      m.read = true;
      const idx = messages.findIndex(x => x.id === m.id);
      if (idx !== -1) messages[idx].read = true;
      renderStats();
      renderMessages();
      renderOverview();
    }).catch(() => {});
  }
}

document.getElementById('new-task-btn').addEventListener('click', () => {
  document.getElementById('task-modal-title').textContent = 'New Task';
  document.getElementById('task-id').value  = '';
  document.getElementById('t-title').value  = '';
  document.getElementById('t-desc').value   = '';
  document.getElementById('t-status').value = 'pending';
  document.getElementById('t-priority').value = 'medium';
  document.getElementById('t-due').value    = '';
  document.getElementById('task-err').classList.remove('show');
  document.getElementById('task-modal').classList.add('open');
  setTimeout(() => document.getElementById('t-title').focus(), 50);
});

function openEditTask(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  document.getElementById('task-modal-title').textContent = 'Edit Task';
  document.getElementById('task-id').value   = t.id;
  document.getElementById('t-title').value   = t.title || '';
  document.getElementById('t-desc').value    = t.description || '';
  document.getElementById('t-status').value  = t.status || 'pending';
  document.getElementById('t-priority').value = t.priority || 'medium';
  document.getElementById('t-due').value     = t.due_date ? t.due_date.slice(0,10) : '';
  document.getElementById('task-err').classList.remove('show');
  document.getElementById('task-modal').classList.add('open');
}

document.getElementById('save-task-btn').addEventListener('click', async () => {
  const id  = document.getElementById('task-id').value;
  const err = document.getElementById('task-err');
  const btn = document.getElementById('save-task-btn');
  err.classList.remove('show');
  btn.disabled = true; btn.textContent = 'Saving...';

  const body = {
    title:       document.getElementById('t-title').value.trim(),
    description: document.getElementById('t-desc').value.trim(),
    status:      document.getElementById('t-status').value,
    priority:    document.getElementById('t-priority').value,
    due_date:    document.getElementById('t-due').value || null
  };

  try {
    if (id) await api(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    else     await api('/api/tasks', { method: 'POST', body: JSON.stringify(body) });
    document.getElementById('task-modal').classList.remove('open');
    tasks = await api('/api/tasks');
    renderStats(); renderTasks(); renderOverview();
  } catch (e) {
    err.textContent = e.message;
    err.classList.add('show');
  } finally {
    btn.disabled = false; btn.textContent = 'Save';
  }
});

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  try {
    await api(`/api/tasks/${id}`, { method: 'DELETE' });
    tasks = tasks.filter(t => t.id !== id);
    renderStats(); renderTasks(); renderOverview();
  } catch (e) { alert(e.message); }
}

const quickInput = document.getElementById('quick-task-input');
quickInput.addEventListener('keydown', async (e) => {
  if (e.key !== 'Enter') return;
  const title = quickInput.value.trim();
  if (!title) return;
  try {
    const t = await api('/api/tasks', { method: 'POST', body: JSON.stringify({ title, status: 'pending', priority: 'medium' }) });
    tasks.unshift(t);
    quickInput.value = '';
    renderStats(); renderTasks(); renderOverview();
  } catch (err) { alert(err.message); }
});

document.getElementById('task-filters').querySelectorAll('.filter-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTaskFilter = btn.dataset.status;
    renderTasks();
  });
});

document.getElementById('new-project-btn').addEventListener('click', () => {
  document.getElementById('project-modal-title').textContent = 'New Project';
  document.getElementById('project-id').value = '';
  document.getElementById('p-title').value = '';
  document.getElementById('p-desc').value  = '';
  document.getElementById('p-tech').value  = '';
  document.getElementById('p-github').value = '';
  document.getElementById('p-live').value  = '';
  document.getElementById('p-order').value = '0';
  document.getElementById('project-err').classList.remove('show');
  document.getElementById('project-modal').classList.add('open');
  setTimeout(() => document.getElementById('p-title').focus(), 50);
});

function openEditProject(id) {
  const p = projects.find(x => x.id === id);
  if (!p) return;
  document.getElementById('project-modal-title').textContent = 'Edit Project';
  document.getElementById('project-id').value  = p.id;
  document.getElementById('p-title').value  = p.title || '';
  document.getElementById('p-desc').value   = p.description || '';
  document.getElementById('p-tech').value   = p.tech || '';
  document.getElementById('p-github').value = p.github_url || '';
  document.getElementById('p-live').value   = p.live_url || '';
  document.getElementById('p-order').value  = p.order_idx || 0;
  document.getElementById('project-err').classList.remove('show');
  document.getElementById('project-modal').classList.add('open');
}

document.getElementById('save-project-btn').addEventListener('click', async () => {
  const id  = document.getElementById('project-id').value;
  const err = document.getElementById('project-err');
  const btn = document.getElementById('save-project-btn');
  err.classList.remove('show');
  btn.disabled = true; btn.textContent = 'Saving...';

  const body = {
    title:       document.getElementById('p-title').value.trim(),
    description: document.getElementById('p-desc').value.trim(),
    tech:        document.getElementById('p-tech').value.trim(),
    github_url:  document.getElementById('p-github').value.trim(),
    live_url:    document.getElementById('p-live').value.trim(),
    order_idx:   parseInt(document.getElementById('p-order').value) || 0
  };

  try {
    if (id) await api(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    else     await api('/api/projects', { method: 'POST', body: JSON.stringify(body) });
    document.getElementById('project-modal').classList.remove('open');
    projects = await api('/api/projects');
    renderStats(); renderProjects(); renderOverview();
  } catch (e) {
    err.textContent = e.message;
    err.classList.add('show');
  } finally {
    btn.disabled = false; btn.textContent = 'Save';
  }
});

async function deleteProject(id) {
  if (!confirm('Delete this project? It will also disappear from the public portfolio.')) return;
  try {
    await api(`/api/projects/${id}`, { method: 'DELETE' });
    projects = projects.filter(p => p.id !== id);
    renderStats(); renderProjects();
  } catch (e) { alert(e.message); }
}

function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${name}`).classList.add('active');
  document.querySelectorAll('.sidebar-nav a[data-view]').forEach(a => {
    a.classList.toggle('active', a.dataset.view === name);
  });
  const labels = { overview: 'Overview', tasks: 'Tasks', projects: 'Projects', messages: 'Messages' };
  document.getElementById('topbar-title').textContent = labels[name] || name;
}

document.querySelectorAll('.sidebar-nav a[data-view]').forEach(a => {
  a.addEventListener('click', e => { e.preventDefault(); switchView(a.dataset.view); });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

loadAll();
