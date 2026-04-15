const API   = '/api';
const token = localStorage.getItem('tf_token');
const user  = JSON.parse(localStorage.getItem('tf_user') || 'null');

if (!token) window.location.href = '/';

let distChart = null;

function applyTheme() {
  const saved = localStorage.getItem('tf_theme');
  if (saved === 'light') {
    document.body.setAttribute('data-theme', 'light');
    document.getElementById('icon-moon').style.display = 'none';
    document.getElementById('icon-sun').style.display  = '';
  }
}

function initUser() {
  if (!user) return;
  document.getElementById('user-name').textContent   = user.name || 'User';
  document.getElementById('user-avatar').textContent = (user.name || 'U').charAt(0).toUpperCase();
}

document.getElementById('theme-btn').addEventListener('click', () => {
  const light = document.body.getAttribute('data-theme') === 'light';
  if (light) {
    document.body.removeAttribute('data-theme');
    localStorage.setItem('tf_theme', 'dark');
    document.getElementById('icon-moon').style.display = '';
    document.getElementById('icon-sun').style.display  = 'none';
  } else {
    document.body.setAttribute('data-theme', 'light');
    localStorage.setItem('tf_theme', 'light');
    document.getElementById('icon-moon').style.display = 'none';
    document.getElementById('icon-sun').style.display  = '';
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('tf_token');
  localStorage.removeItem('tf_user');
  window.location.href = '/';
});

function setView(view) {
  const isOverview = view === 'overview';
  document.getElementById('view-overview').style.display = isOverview ? '' : 'none';
  document.getElementById('view-tasks').style.display    = isOverview ? 'none' : '';

  ['nav-overview', 'nav-tasks', 'nav-pending', 'nav-inprogress', 'nav-urgent'].forEach(id => {
    document.getElementById(id).classList.remove('active');
  });

  const crumbEl = document.getElementById('crumb');

  if (isOverview) {
    document.getElementById('nav-overview').classList.add('active');
    crumbEl.innerHTML = 'taskflow / <span>overview</span>';
    loadOverview();
  } else {
    document.getElementById('nav-tasks').classList.add('active');
    crumbEl.innerHTML = 'taskflow / <span>tasks</span>';
    window.loadTasks();
  }
}

function setViewFiltered(navId, label, statusFilter, priorityFilter) {
  ['nav-overview', 'nav-tasks', 'nav-pending', 'nav-inprogress', 'nav-urgent'].forEach(id => {
    document.getElementById(id).classList.remove('active');
  });
  document.getElementById(navId).classList.add('active');

  document.getElementById('view-overview').style.display = 'none';
  document.getElementById('view-tasks').style.display    = '';
  document.getElementById('crumb').innerHTML = `taskflow / <span>${label}</span>`;
  document.getElementById('tasks-view-title').textContent = label;

  if (statusFilter) window.setStatusFilter(statusFilter);
  if (priorityFilter) window.setPriorityFilter(priorityFilter);
  window.loadTasks();
}

document.getElementById('nav-overview').addEventListener('click', () => setView('overview'));
document.getElementById('nav-tasks').addEventListener('click', () => {
  document.getElementById('tasks-view-title').textContent = 'All Tasks';
  setView('tasks');
});
document.getElementById('view-all-btn').addEventListener('click', () => {
  document.getElementById('tasks-view-title').textContent = 'All Tasks';
  setView('tasks');
});

document.getElementById('nav-pending').addEventListener('click', () =>
  setViewFiltered('nav-pending', 'Pending', 'pending', null));

document.getElementById('nav-inprogress').addEventListener('click', () =>
  setViewFiltered('nav-inprogress', 'In Progress', 'in-progress', null));

document.getElementById('nav-urgent').addEventListener('click', () =>
  setViewFiltered('nav-urgent', 'Urgent', null, 'urgent'));

document.getElementById('new-task-btn').addEventListener('click', () => window.openModal(null));

document.getElementById('search-input').addEventListener('input', (e) => {
  if (document.getElementById('view-tasks').style.display !== 'none') {
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(window.loadTasks, 300);
  }
});

document.addEventListener('keydown', (e) => {
  const tag = document.activeElement.tagName;
  const inInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);

  if (e.key === 'Escape') {
    window.closeModal();
    return;
  }

  if (inInput) return;

  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    setView('tasks');
    setTimeout(() => window.openModal(null), 50);
  }

  if (e.key === '/') {
    e.preventDefault();
    setView('tasks');
    setTimeout(() => document.getElementById('search-input').focus(), 50);
  }
});

async function loadOverview() {
  try {
    const res  = await fetch(`${API}/tasks/stats`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();

    document.getElementById('s-total').textContent   = data.total;
    document.getElementById('s-pending').textContent = data.pending;
    document.getElementById('s-progress').textContent = data.inProgress;
    document.getElementById('s-done').textContent    = data.completed;
    document.getElementById('s-overdue').textContent  = data.overdue;

    document.getElementById('badge-total').textContent    = data.total;
    document.getElementById('badge-tasks').textContent    = data.total;
    document.getElementById('badge-pending').textContent  = data.pending;
    document.getElementById('badge-progress').textContent = data.inProgress;
    document.getElementById('badge-urgent').textContent   = data.urgent;

    const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
    document.getElementById('completion-bar').style.width = pct + '%';
    document.getElementById('completion-pct').textContent = pct + '%';

    const t = data.total || 1;
    document.getElementById('bar-pending').style.width   = ((data.pending / t) * 100) + '%';
    document.getElementById('bar-progress').style.width  = ((data.inProgress / t) * 100) + '%';
    document.getElementById('bar-completed').style.width = ((data.completed / t) * 100) + '%';

    document.getElementById('bv-pending').textContent   = data.pending;
    document.getElementById('bv-progress').textContent  = data.inProgress;
    document.getElementById('bv-completed').textContent = data.completed;

    renderDistChart(data);
    loadRecentTasks();
  } catch (err) {
    console.error('stats error:', err);
  }
}

function renderDistChart(data) {
  const ctx   = document.getElementById('dist-chart').getContext('2d');
  const empty = data.total === 0;

  if (distChart) distChart.destroy();

  distChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'In Progress', 'Completed'],
      datasets: [{
        data: empty ? [1, 0, 0] : [data.pending, data.inProgress, data.completed],
        backgroundColor: empty
          ? ['rgba(255,255,255,0.05)']
          : ['rgba(255,255,255,0.25)', '#60a5fa', '#22c55e'],
        borderWidth: 0,
        hoverOffset: 3
      }]
    },
    options: {
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: !empty }
      },
      animation: { duration: 500 }
    }
  });
}

async function loadRecentTasks() {
  const el = document.getElementById('recent-tasks-list');
  try {
    const res  = await fetch(`${API}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
    const list = await res.json();
    const recent = list.slice(0, 6);

    if (!recent.length) {
      el.innerHTML = '<div class="empty-state"><p>no tasks yet</p></div>';
      return;
    }

    const statusOrder = ['pending', 'in-progress', 'completed'];

    el.innerHTML = recent.map(t => {
      const id    = 'TF-' + t.id.slice(0, 4).toUpperCase();
      const due   = t.due_date ? formatDueDate(t.due_date) : null;
      const dueClass = due ? getDueCls(t.due_date, t.status) : '';

      return `
        <div class="task-row" data-id="${t.id}" style="cursor:default;">
          <div class="task-check ${t.status === 'completed' ? 'done' : ''}"></div>
          <div class="task-priority-bar pbar-${t.priority}"></div>
          <span class="task-id">${id}</span>
          <div class="task-title-cell">
            <span class="task-title-text ${t.status === 'completed' ? 'struck' : ''}">${esc(t.title)}</span>
          </div>
          <span class="status-tag status-${t.status}">${t.status}</span>
          <span class="priority-tag priority-${t.priority}">${t.priority}</span>
          <span class="due-cell ${dueClass}">${due || '—'}</span>
          <div class="row-actions">
            <button class="icon-btn" onclick="openModal(${JSON.stringify(t).replace(/"/g,'&quot;')})" title="Edit">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch {
    el.innerHTML = '<div class="empty-state"><p>failed to load</p></div>';
  }
}

function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatDueDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getDueCls(dateStr, status) {
  if (status === 'completed') return '';
  const d     = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff < 0)  return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 3)  return 'soon';
  return '';
}

window.escHtml      = esc;
window.formatDueDate = formatDueDate;
window.getDueCls     = getDueCls;
window.apiToken      = token;
window.reloadOverview = loadOverview;

applyTheme();
initUser();
loadOverview();
