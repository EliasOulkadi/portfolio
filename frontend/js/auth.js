const API = '/api';

if (localStorage.getItem('tf_token')) {
  window.location.href = '/dashboard.html';
}

const loginView    = document.getElementById('login-view');
const registerView = document.getElementById('register-view');

document.getElementById('goto-register').addEventListener('click', () => {
  loginView.style.display = 'none';
  registerView.style.display = '';
});

document.getElementById('goto-login').addEventListener('click', () => {
  registerView.style.display = 'none';
  loginView.style.display = '';
});

function showErr(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('show');
}

function clearErr(id) {
  const el = document.getElementById(id);
  el.textContent = '';
  el.classList.remove('show');
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErr('login-err');

  const btn   = document.getElementById('login-btn');
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-password').value;

  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });

    const data = await res.json();

    if (!res.ok) {
      showErr('login-err', data.error || 'Login failed');
      btn.disabled = false;
      btn.textContent = 'Sign in';
      return;
    }

    localStorage.setItem('tf_token', data.token);
    localStorage.setItem('tf_user', JSON.stringify(data.user));
    window.location.href = '/dashboard.html';
  } catch {
    showErr('login-err', 'Cannot reach server');
    btn.disabled = false;
    btn.textContent = 'Sign in';
  }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErr('register-err');

  const btn  = document.getElementById('register-btn');
  const name = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const pass  = document.getElementById('r-password').value;

  if (pass.length < 6) {
    showErr('register-err', 'Password must be at least 6 characters');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Creating account...';

  try {
    const res  = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass })
    });

    const data = await res.json();

    if (!res.ok) {
      showErr('register-err', data.error || 'Registration failed');
      btn.disabled = false;
      btn.textContent = 'Create account';
      return;
    }

    localStorage.setItem('tf_token', data.token);
    localStorage.setItem('tf_user', JSON.stringify(data.user));
    window.location.href = '/dashboard.html';
  } catch {
    showErr('register-err', 'Cannot reach server');
    btn.disabled = false;
    btn.textContent = 'Create account';
  }
});
