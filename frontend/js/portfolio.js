document.getElementById('year').textContent = new Date().getFullYear();


/* -- TYPING ANIMATION -- */
const phrases = [
  'Node.js · Express · REST APIs',
  'SQL · Supabase · PostgreSQL',
  'React · HTML · CSS · JavaScript',
  'JWT auth · bcrypt · rate limiting',
  'Git · Vercel · Linux',
];
let phraseIdx = 0, charIdx = 0, deleting = false;
const typingEl = document.getElementById('typing-text');

function typeLoop() {
  const phrase = phrases[phraseIdx];
  if (!deleting) {
    typingEl.textContent = phrase.slice(0, ++charIdx);
    if (charIdx === phrase.length) { deleting = true; setTimeout(typeLoop, 2200); return; }
  } else {
    typingEl.textContent = phrase.slice(0, --charIdx);
    if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; }
  }
  setTimeout(typeLoop, deleting ? 38 : 68);
}
typeLoop();

/* -- NAVIGATION SCROLLSPY -- */
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => spyObserver.observe(s));

/* -- REVEAL ANIMATIONS (staggered effect) -- */
function observeReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
}

/* ── COUNT-UP ── */
function countUp(el, target, duration = 900) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── HAMBURGER ── */
const hamburger   = document.getElementById('hamburger');
const mobileNav   = document.getElementById('mobile-nav');
const mobileLinks = document.querySelectorAll('.mobile-link');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
  document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
});

mobileLinks.forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── LOAD PROJECTS (with tag filter + featured) ── */
let _allProjects = [];
let _activeTag   = 'all';

function renderProjects() {
  const grid = document.getElementById('projects-grid');
  const filtered = _activeTag === 'all'
    ? _allProjects
    : _allProjects.filter(p => p.tech && p.tech.split(',').map(t => t.trim()).includes(_activeTag));

  if (!filtered.length) {
    const emptyMessages = {
      'all': '// no projects yet — check back soon',
      'html': '// no HTML projects yet',
      'css': '// no CSS projects yet',
      'javascript': '// no JavaScript projects yet',
      'node.js': '// no Node.js projects yet',
      'express': '// no Express projects yet',
      'react': '// no React projects yet',
      'sql': '// no SQL projects yet',
      'supabase': '// no Supabase projects yet',
      'jwt': '// no JWT projects yet'
    };
    const message = emptyMessages[_activeTag] || `// no projects tagged "${_activeTag}" yet`;
    grid.innerHTML = `<div class="projects-empty">${message}</div>`;
    return;
  }

  let idx = 0;
  grid.innerHTML = filtered.map(p => {
    const tags      = p.tech ? p.tech.split(',').map(t => t.trim()).filter(Boolean) : [];
    const ghLink    = p.github_url ? `<a href="${p.github_url}" target="_blank" rel="noopener">GitHub</a>` : '';
    const liveLink  = p.live_url   ? `<a href="${p.live_url}"   target="_blank" rel="noopener">Live ↗</a>` : '';
    const techHtml  = tags.map(t => `<span class="tech-tag">${t}</span>`).join('');
    const num       = String(++idx).padStart(2, '0');

    if (p.featured && p.live_url) {
      return `
        <div class="project-card featured" data-reveal data-tags="${p.tech || ''}">
          <div class="project-card-body">
            <div class="project-card-top">
              <span class="project-featured-badge">Featured</span>
              <div class="project-links">${ghLink}${liveLink}</div>
            </div>
            <h3 class="project-title">${p.title}</h3>
            <p class="project-desc">${p.description || ''}</p>
            <div class="project-tech">${techHtml}</div>
          </div>
          <div class="project-card-preview">
            <iframe src="${p.live_url}" class="project-preview-frame" loading="lazy" sandbox="allow-scripts allow-same-origin" title="${p.title} preview"></iframe>
          </div>
        </div>`;
    }

    return `
      <div class="project-card" data-reveal data-tags="${p.tech || ''}">
        <div class="project-card-top">
          <span class="project-idx">${num}</span>
          <div class="project-links">${ghLink}${liveLink}</div>
        </div>
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description || ''}</p>
        <div class="project-tech">${techHtml}</div>
      </div>`;
  }).join('');

  observeReveal();
}

function buildFilters(projects) {
  const filtersEl = document.getElementById('project-filters');
  if (!filtersEl) return;

  // Solo mostrar el filtro "All" para mantenerlo limpio y profesional
  filtersEl.innerHTML = '<button class="filter-btn active" data-tag="all">All</button>';

  filtersEl.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _activeTag = btn.dataset.tag;
      renderProjects();
    });
  });
}

async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  try {
    const res = await fetch('/api/projects');
    _allProjects = await res.json();

    if (!_allProjects.length) {
      grid.innerHTML = '<div class="projects-empty">// no projects yet — more coming soon!</div>';
      return;
    }

    buildFilters(_allProjects);
    renderProjects();
  } catch {
    grid.innerHTML = '<div class="projects-empty">// unable to load projects — refresh to try again</div>';
  }
}

/* ── LIVE STATS ── */
async function loadLiveStats() {
  try {
    const [projRes, contactRes] = await Promise.all([
      fetch('/api/projects'),
      fetch('/api/contact/count')
    ]);
    const lsProj = document.getElementById('ls-projects');
    const lsMsg  = document.getElementById('ls-messages');

    if (projRes.ok) {
      const projects = await projRes.json();
      if (lsProj) countUp(lsProj, projects.length);
    }
    if (contactRes.ok) {
      const data = await contactRes.json();
      const count = data.count ?? 0;
      if (lsMsg) countUp(lsMsg, count);
    }
  } catch {}
}

/* ── CONTACT FORM ── */
const contactForm = document.getElementById('contact-form');
const formStatus  = document.getElementById('form-status');
const formSubmit  = document.getElementById('form-submit');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formStatus.className = 'form-status';
  formStatus.style.display = 'none';
  formSubmit.disabled = true;
  formSubmit.textContent = 'Sending...';

  const body = {
    name:    document.getElementById('cf-name').value.trim(),
    email:   document.getElementById('cf-email').value.trim(),
    message: document.getElementById('cf-message').value.trim()
  };

  try {
    const res  = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error');
    formStatus.textContent = "// Message sent. I'll get back to you soon.";
    formStatus.className = 'form-status success';
    contactForm.reset();
  } catch (err) {
    formStatus.textContent = `// Error: ${err.message}`;
    formStatus.className = 'form-status error';
  } finally {
    formSubmit.disabled = false;
    formSubmit.textContent = 'Send Message';
  }
});

/* ── COPY RESPONSE ── */
function copyResp(type) {
  const el  = document.getElementById(`resp-${type}`);
  const btn = el.closest('.api-response-wrap').querySelector('.copy-btn');
  const text = el.innerText;
  if (!text || text.startsWith('//')) return;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('copied'); }, 1800);
  });
}

/* ── JSON SYNTAX HIGHLIGHT ── */
function syntaxHighlight(obj) {
  const str = JSON.stringify(obj, null, 2);
  return str.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    match => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span class="jk">${match}</span>`;
        return `<span class="js">${match}</span>`;
      }
      if (/true|false/.test(match)) return `<span class="jb">${match}</span>`;
      if (/null/.test(match))       return `<span class="jn">${match}</span>`;
      return `<span class="jnum">${match}</span>`;
    }
  );
}

/* ── API EXPLORER ── */
let _jwtToken = null;

async function runRequest(type) {
  const respEl = document.getElementById(`resp-${type}`);
  const metaEl = document.getElementById(`meta-${type}`);
  const btn    = respEl.closest('.api-card').querySelector('.api-run-btn');

  btn.disabled = true;
  respEl.className = 'api-response';
  respEl.innerHTML = '<span class="api-placeholder">// running...</span>';
  metaEl.textContent = '';

  if (type === 'tasks' && !_jwtToken) {
    respEl.className = 'api-response error';
    respEl.textContent = '// 401 Unauthorized\n// Run "Login" first to get a JWT token.';
    metaEl.textContent = '401 · 0ms';
    btn.disabled = false;
    return;
  }

  const configs = {
    projects: { url: '/api/projects', opts: { method: 'GET' } },
    contact: {
      url: '/api/contact',
      opts: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Jane Recruiter', email: 'jane@company.com', message: "We'd like to talk about a position." }) }
    },
    login: {
      url: '/api/auth/login',
      opts: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'demo@oulkadi.dev', password: 'demo1234' }) }
    },
    tasks: {
      url: '/api/tasks',
      opts: { method: 'GET', headers: { Authorization: `Bearer ${_jwtToken}` } }
    }
  };

  const t0  = performance.now();
  const cfg = configs[type];

  try {
    const res  = await fetch(cfg.url, cfg.opts);
    const ms   = Math.round(performance.now() - t0);
    const data = await res.json();

    if (type === 'login' && res.ok && data.token) {
      _jwtToken = data.token;
      const tasksCard = document.getElementById('req-tasks');
      if (tasksCard) {
        tasksCard.querySelector('.api-run-btn').textContent = 'Run ▶';
        tasksCard.querySelector('.api-placeholder').textContent = '// JWT acquired — click Run';
      }
    }

    respEl.className = `api-response ${res.ok ? 'success' : 'error'}`;
    respEl.innerHTML = syntaxHighlight(data);
    metaEl.textContent = `${res.status} · ${ms}ms`;
  } catch (err) {
    respEl.className = 'api-response error';
    respEl.textContent = `// Network error: ${err.message}`;
    metaEl.textContent = `err · ${Math.round(performance.now() - t0)}ms`;
  } finally {
    btn.disabled = false;
  }
}

/* ── SIDE PANEL ── */
const sidePanel  = document.getElementById('side-panel');
const spBackdrop = document.getElementById('sp-backdrop');
const navLoginBtn = document.getElementById('nav-login-btn');
let _panelJwt = null;

function openPanel()  { sidePanel.classList.add('open'); spBackdrop.classList.add('open'); document.body.style.overflow = 'hidden'; sidePanel.setAttribute('aria-hidden', 'false'); }
function closePanel() { sidePanel.classList.remove('open'); spBackdrop.classList.remove('open'); document.body.style.overflow = ''; sidePanel.setAttribute('aria-hidden', 'true'); }

navLoginBtn.addEventListener('click', openPanel);
document.getElementById('sp-close').addEventListener('click', closePanel);
spBackdrop.addEventListener('click', closePanel);

document.getElementById('sp-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email    = document.getElementById('sp-email').value.trim();
  const password = document.getElementById('sp-password').value.trim();
  const errEl    = document.getElementById('sp-err');
  const btn      = document.getElementById('sp-submit');

  btn.disabled = true; btn.textContent = '...'; errEl.textContent = '';

  try {
    const res  = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();

    if (!res.ok) {
      errEl.textContent = '// ' + (data.detail || data.error || 'Login failed');
      return;
    }

    _panelJwt = data.token;
    _jwtToken = data.token;

    document.getElementById('sp-title').textContent = '// dashboard';
    document.getElementById('sp-login-view').style.display   = 'none';
    document.getElementById('sp-profile-view').style.display = 'block';
    document.getElementById('sp-tabs').style.display = 'none';
    document.getElementById('sp-user-name').textContent  = data.user.name;
    document.getElementById('sp-user-email').textContent = data.user.email;
    document.getElementById('sp-avatar').textContent     = data.user.name.charAt(0).toUpperCase();
    navLoginBtn.textContent = data.user.name.split(' ')[0];
    navLoginBtn.classList.add('active');
    loadPanelTasks();
  } catch {
    errEl.textContent = '// Network error';
  } finally {
    btn.disabled = false; btn.textContent = 'Login';
  }
});

document.getElementById('sp-logout').addEventListener('click', () => {
  _panelJwt = null; _jwtToken = null;
  document.getElementById('sp-title').textContent = '// auth';
  document.getElementById('sp-login-view').style.display   = 'block';
  document.getElementById('sp-register-view').style.display = 'none';
  document.getElementById('sp-profile-view').style.display  = 'none';
  document.getElementById('sp-tabs').style.display = 'flex';
  document.querySelectorAll('.sp-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  navLoginBtn.textContent = 'Login';
  navLoginBtn.classList.remove('active');
});

document.getElementById('sp-add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('sp-task-input');
  const title = input.value.trim();
  if (!title || !_panelJwt) return;
  input.value = '';
  try {
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${_panelJwt}` }, body: JSON.stringify({ title, status: 'pending', priority: 'medium' }) });
    if (res.ok) loadPanelTasks();
  } catch {}
});

async function loadPanelTasks() {
  const list = document.getElementById('sp-tasks-list');
  const cnt  = document.getElementById('sp-task-count');
  list.innerHTML = '<p class="sp-loading">// loading...</p>';
  try {
    const res   = await fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${_panelJwt}` } });
    const tasks = await res.json();
    if (!Array.isArray(tasks) || !tasks.length) { list.innerHTML = '<p class="sp-loading">// no tasks — add one above</p>'; cnt.textContent = '(0)'; return; }
    cnt.textContent = `(${tasks.length})`;
    list.innerHTML  = tasks.map(t => `
      <div class="sp-task">
        <button class="sp-task-toggle${t.status === 'completed' ? ' done' : ''}" onclick="toggleTask('${t.id}','${t.status}')">${t.status === 'completed' ? '✓' : '○'}</button>
        <span class="sp-task-name${t.status === 'completed' ? ' done' : ''}">${t.title}</span>
        <span class="sp-task-pri">${t.priority}</span>
      </div>`).join('');
  } catch {
    list.innerHTML = '<p class="sp-loading">// error</p>';
  }
}

async function toggleTask(id, current) {
  const next = current === 'completed' ? 'pending' : 'completed';
  try {
    await fetch(`/api/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${_panelJwt}` }, body: JSON.stringify({ status: next }) });
    loadPanelTasks();
  } catch {}
}

/* ── SP TABS ── */
document.querySelectorAll('.sp-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.sp-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const which = tab.dataset.tab;
    document.getElementById('sp-login-view').style.display    = which === 'login'    ? 'block' : 'none';
    document.getElementById('sp-register-view').style.display = which === 'register' ? 'block' : 'none';
  });
});

/* ── REGISTER ── */
document.getElementById('sp-reg-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name     = document.getElementById('sp-reg-name').value.trim();
  const email    = document.getElementById('sp-reg-email').value.trim();
  const password = document.getElementById('sp-reg-password').value.trim();
  const errEl    = document.getElementById('sp-reg-err');
  const btn      = document.getElementById('sp-reg-submit');

  btn.disabled = true; btn.textContent = '...'; errEl.textContent = '';

  try {
    const res  = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
    const data = await res.json();

    if (!res.ok) { errEl.textContent = '// ' + (data.error || 'Error'); return; }

    _panelJwt = data.token; _jwtToken = data.token;
    document.getElementById('sp-title').textContent = '// dashboard';
    document.getElementById('sp-register-view').style.display = 'none';
    document.getElementById('sp-profile-view').style.display  = 'block';
    document.getElementById('sp-tabs').style.display = 'none';
    document.getElementById('sp-user-name').textContent  = data.user.name;
    document.getElementById('sp-user-email').textContent = data.user.email;
    document.getElementById('sp-avatar').textContent     = data.user.name.charAt(0).toUpperCase();
    navLoginBtn.textContent = data.user.name.split(' ')[0];
    navLoginBtn.classList.add('active');
    loadPanelTasks();
  } catch { errEl.textContent = '// Network error'; }
  finally { btn.disabled = false; btn.textContent = 'Create Account'; }
});

/* ── ANNOTATION CALLOUTS (SVG overlay) ── */
const ANN_NS = 'http://www.w3.org/2000/svg';
let _annRaf = null;

function buildAnnSvg() {
  let svg = document.getElementById('ann-svg');
  if (!svg) {
    svg = document.createElementNS(ANN_NS, 'svg');
    svg.id = 'ann-svg';
    svg.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:6;overflow:visible';
    document.body.appendChild(svg);
  }
  return svg;
}

function drawAnn(svg, sel, lines, side, existingLabels = []) {
  const el = document.querySelector(sel);
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (r.bottom < -20 || r.top > window.innerHeight + 20) return;

  /* Text label dimensions */
  const LINE_H = 14, PAD = 52, GAP = 14; 
  const LH = lines.length * LINE_H;
  const rmx = r.left + r.width / 2;
  const rmy = r.top  + r.height / 2;

  /* Anchor point on element edge */
  let ex, ey;
  switch (side) {
    case 'right':  ex = r.right;  ey = rmy;      break;
    case 'left':   ex = r.left;   ey = rmy;      break;
    case 'top':    ex = rmx;      ey = r.top;    break;
    case 'bottom': ex = rmx;      ey = r.bottom; break;
  }

  /* Text anchor — placed in the margin away from element */
  let tx, ty;
  switch (side) {
    case 'right':  tx = r.right  + PAD;          ty = rmy - LH / 2; break;
    case 'left':   tx = r.left   - PAD - 160;    ty = rmy - LH / 2; break;
    case 'top':    tx = rmx      - 80;            ty = r.top - PAD - LH; break;
    case 'bottom': tx = rmx      - 80;            ty = r.bottom + PAD; break;
  }

  const W = window.innerWidth, H = window.innerHeight;
  const LABEL_W = 160, LABEL_H = LH + 15; 
  
  if (tx < 6)         tx = 6;
  if (tx + LABEL_W > W - 6) tx = W - 166;
  if (ty < 6)         ty = 6;
  if (ty + LABEL_H > H - 6) ty = H - LH - 6;

  /* Skip if label would still land on top of target element */
  const lR = tx + LABEL_W, lB = ty + LABEL_H;
  if (lR > r.left - GAP && tx < r.right + GAP && lB > r.top - GAP && ty < r.bottom + GAP) return;
  
  /* Check collision with existing labels */
  for (const existing of existingLabels) {
    if (lR > existing.left - GAP && tx < existing.right + GAP && 
        lB > existing.top - GAP && ty < existing.bottom + GAP) {
      return; // Skip if would overlap with existing annotation
    }
  }
  
  /* Skip if off-screen */
  if (tx < 0 || tx + LABEL_W > W || ty < 0 || ty + LABEL_H > H) return;
  
  // Add this label to existing labels for collision detection
  existingLabels.push({ left: tx, right: lR, top: ty, bottom: lB });

  /* Bezier control point -- connect anchor to text midpoint */
  const tmx = tx + LABEL_W / 2, tmy = ty + LH / 2;
  const bend = (side === 'top' || side === 'bottom') ? 28 : -28;
  const cpx = (ex + tmx) / 2 + (side === 'top' || side === 'bottom' ? bend : 0);
  const cpy = (ey + tmy) / 2 + (side === 'left' || side === 'right' ? bend : 0);

  /* Dashed curved line */
  const path = document.createElementNS(ANN_NS, 'path');
  path.setAttribute('d', `M ${ex} ${ey} Q ${cpx} ${cpy} ${tmx} ${tmy}`);
  path.setAttribute('stroke', 'rgba(255,255,255,0.22)');
  path.setAttribute('stroke-width', '0.8');
  path.setAttribute('stroke-dasharray', '4 4');
  path.setAttribute('fill', 'none');
  svg.appendChild(path);

  /* Dot at anchor */
  const dot = document.createElementNS(ANN_NS, 'circle');
  dot.setAttribute('cx', ex); dot.setAttribute('cy', ey);
  dot.setAttribute('r', '2.5'); dot.setAttribute('fill', 'rgba(255,255,255,0.45)');
  svg.appendChild(dot);

  /* Text — outline stroke so it reads on any background without a box */
  lines.forEach((line, i) => {
    const fillC = i === 0 ? 'rgba(240,240,240,0.95)' : 'rgba(180,180,180,0.70)';
    const t = document.createElementNS(ANN_NS, 'text');
    t.setAttribute('font-family', "'Space Mono', monospace");
    t.setAttribute('font-size', '9'); // Slightly smaller font
    t.setAttribute('stroke', 'rgba(0,0,0,0.92)');
    t.setAttribute('stroke-width', '3.5');
    t.setAttribute('paint-order', 'stroke fill');
    t.setAttribute('fill', fillC);
    t.setAttribute('x', tx);
    t.setAttribute('y', ty + 12 + i * LINE_H);
    t.textContent = line;
    svg.appendChild(t);
  });
}

function updateAnnotations() {
  if (window.innerWidth < 1200) { document.getElementById('ann-svg')?.remove(); return; }
  const svg = buildAnnSvg();
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  function vis(sel, margin) {
    const el = document.querySelector(sel);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const m = margin ?? 0;
    return r.bottom > m && r.top < window.innerHeight - m;
  }

  /* NAV -- skip: fixed bar is too narrow, labels land in hero */

  /* HERO */
  if (vis('#hero', 80)) {
    drawAnn(svg, '.hero-label',      ['<p> hero label', 'CSS uppercase letter-spacing'],            'left');
    drawAnn(svg, '.hero-role',       ['JS typing loop', 'setTimeout + phrase array, charIdx++'],    'right');
    drawAnn(svg, '.hero-desc',       ['Vanilla HTML <p>', 'no framework, pure CSS styled'],         'left');
    drawAnn(svg, '.hero-actions',    ['<a href="#id"> btns', 'CSS scroll-behavior: smooth anchor'], 'left');
    drawAnn(svg, '#hero-stats',      ['Live DB data', 'fetch /api/projects + /api/contact/count'],  'right');
  }

  /* ABOUT */
  if (vis('#about', 60)) {
    drawAnn(svg, '#about .section-header', ['Section header', 'data-reveal --> IntersectionObserver fade-in'], 'left');
    drawAnn(svg, '.about-text',      ['Vanilla HTML text', 'no framework -- raw <p> tags'],          'left');
    drawAnn(svg, '.about-facts',     ['Fact grid', 'CSS grid, fact-item flex rows'],                'right');
    drawAnn(svg, '.fact-item',       ['fact-label + fact-val', 'flexbox space-between layout'],     'right');
  }

  /* PROJECTS */
  if (vis('#work', 60)) {
    drawAnn(svg, '#projects-grid',   ['fetch /api/projects', 'rendered by renderProjects()'], 'right');
  }

  /* API EXPLORER */
  if (vis('#api-explorer', 40)) {
    drawAnn(svg, '#req-projects .api-path',  ['GET /api/projects', 'Express router, no auth, public'],    'left');
    drawAnn(svg, '#req-contact .api-path',   ['POST /api/contact', 'body --> Supabase .insert()'],          'left');
    drawAnn(svg, '#req-login .api-path',     ['bcrypt.compare()', 'hash --> jwt.sign() 7d token'],          'left');
    drawAnn(svg, '#req-tasks .api-path',     ['GET /api/tasks', 'JWT guard -- verifies Bearer token'],     'left');
    drawAnn(svg, '.api-auth-badge',          ['JWT required', 'req.headers.authorization guard'],         'right');
    drawAnn(svg, '.api-body-pre',            ['Request body', 'JSON sent with fetch() POST'],             'left');
    drawAnn(svg, '.api-demo-cta',            ['Admin panel', 'full CRUD: tasks / projects / msgs'],     'right');
  }

  /* STACK */
  if (vis('#stack', 60)) {
    drawAnn(svg, '.stack-group:nth-child(1)', ['CSS grid: 3 cols', '.stack-group border layout'],  'left');
    drawAnn(svg, '.stack-group:nth-child(6)', ['Creative tools', 'DaVinci · Premiere · C4D'],       'right');
  }

  /* EDUCATION */
  if (vis('#courses', 60)) {
    drawAnn(svg, '#courses .section-header',    ['Section 04', 'Education -- all self-taught'],              'left');
    drawAnn(svg, '.course-group:nth-child(1)',  ['freeCodeCamp', '4 certifications completed'],             'left');
    drawAnn(svg, '.course-group:nth-child(2)',  ['The Odin Project', 'Full Stack JS path'],                 'left');
    drawAnn(svg, '.course-group:nth-child(3)',  ['Udemy courses', 'React + Node.js/Express'],               'right');
    drawAnn(svg, '.course-tag',                 ['<span class="course-tag">', 'CSS badge style'],           'right');
  }

  /* EXPERIENCE */
  if (vis('#experience', 60)) {
    drawAnn(svg, '#experience .section-header', ['Section 05', 'Real work experience'],                    'left');
    drawAnn(svg, '.exp-item:nth-child(1)',       ['Electric Mobility Tech', 'hardware + ECU repair'],       'left');
    drawAnn(svg, '.exp-item:nth-child(2)',       ['PC Hardware Technician', 'build diagnose repair'],             'left');
    drawAnn(svg, '.exp-item:nth-child(3)',       ['Video Editor &amp; Digital Creator', '10k+ views -- DaVinci Premiere'],         'right');
    drawAnn(svg, '.exp-points',                 ['<ul> bullet list', 'CSS list-style + padding-left'],      'right');
  }

  /* CONTACT */
  if (vis('#contact', 40)) {
    drawAnn(svg, '#contact .section-header',    ['Section 06', 'Contact -- stored in Supabase'],            'left');
    drawAnn(svg, '#cf-message',                 ['<textarea required>', 'resize: vertical CSS'],            'left');
    drawAnn(svg, '#form-submit',                ['fetch() POST /api/contact', 'disabled during req --> re-enabled'], 'right');
    drawAnn(svg, '.contact-links',              ['Direct links', 'email / GitHub / LinkedIn hrefs'],        'right');
  }
}

window.addEventListener('load', updateAnnotations);
window.addEventListener('scroll', () => {
  if (_annRaf) cancelAnimationFrame(_annRaf);
  _annRaf = requestAnimationFrame(updateAnnotations);
}, { passive: true });
window.addEventListener('resize', updateAnnotations);

/* ── INIT ── */
loadProjects();
loadLiveStats();
observeReveal();
