const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const supabase = require('../supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'elias-portfolio-key-2024';

/* ── IN-MEMORY RATE LIMITER ──────────────────────────────── */
const _loginAttempts = new Map();
const RATE_WINDOW_MS  = 15 * 60 * 1000;
const RATE_MAX        = 10;

function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
}

function checkRateLimit(ip) {
  const now  = Date.now();
  const entry = _loginAttempts.get(ip) || { count: 0, reset: now + RATE_WINDOW_MS };

  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + RATE_WINDOW_MS;
  }

  entry.count++;
  _loginAttempts.set(ip, entry);

  const remaining = Math.max(0, Math.ceil((entry.reset - now) / 1000));
  return { blocked: entry.count > RATE_MAX, remaining };
}

/* ── INPUT HELPERS ───────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function sanitize(str, maxLen) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

/* ── REGISTER ────────────────────────────────────────────── */
router.post('/register', async (req, res) => {
  const name     = sanitize(req.body.name, 100);
  const email    = sanitize(req.body.email, 254).toLowerCase();
  const password = sanitize(req.body.password, 72);

  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  if (!EMAIL_RE.test(email))
    return res.status(400).json({ error: 'Invalid email address' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email).maybeSingle();

    if (existing)
      return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email, password: hash })
      .select('id, name, email')
      .single();

    if (error) throw error;

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch {
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

/* ── LOGIN ───────────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  const ip       = getClientIp(req);
  const { blocked, remaining } = checkRateLimit(ip);

  if (blocked) {
    res.setHeader('Retry-After', remaining);
    return res.status(429).json({ error: `Too many attempts. Try again in ${remaining}s.` });
  }

  const email    = sanitize(req.body.email, 254).toLowerCase();
  const password = sanitize(req.body.password, 72);

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  if (!EMAIL_RE.test(email))
    return res.status(400).json({ error: 'Invalid credentials' });

  try {
    const { data: user, error: dbErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (dbErr) return res.status(500).json({ error: 'Server error' });

    if (!user) {
      await bcrypt.hash('dummy-timing-prevention', 10);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

/* ── DIAGNOSTIC ──────────────────────────────────────────── */
router.get('/ping', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('users').select('*', { count: 'exact', head: true });
    if (error) return res.json({ ok: false, error: 'DB check failed' });
    res.json({ ok: true, users_count: count, jwt_set: !!process.env.JWT_SECRET });
  } catch {
    res.json({ ok: false, error: 'Server error' });
  }
});

/* ── SEED DEMO ───────────────────────────────────────────── */
router.post('/seed-demo', async (req, res) => {
  const email = 'demo@oulkadi.dev';
  const password = 'demo1234';
  const name = 'Demo User';
  try {
    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email).maybeSingle();
    if (existing) return res.json({ message: 'Demo account already exists' });
    const hash = await bcrypt.hash(password, 10);
    const { error } = await supabase.from('users').insert({ name, email, password: hash });
    if (error) throw error;
    res.status(201).json({ message: 'Demo account created' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
