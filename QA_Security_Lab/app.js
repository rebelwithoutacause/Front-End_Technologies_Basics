// qa-security-lab: intentionally insecure demo app (for education!)
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// "Database"
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' }, // plaintext on purpose
  { id: 2, username: 'user',  password: 'test',     role: 'user'  }
];

const publicNotes = []; // used for stored XSS demo

// -------------------- helpers (insecure on purpose!) --------------------
function getSession(req) {
  try {
    return req.cookies.session ? JSON.parse(req.cookies.session) : null;
  } catch {
    return null;
  }
}

function setSession(res, sessionObj) {
  // INSECURE: unsigned, unencrypted cookie (HttpOnly disabled so XSS can steal it)
  res.cookie('session', JSON.stringify(sessionObj), { httpOnly: false });
}

// -------------------- UI --------------------
const page = (title, body, subtitle = '') => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title} · QA Security Lab</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root{
      --bg: #0b1020;
      --panel: #121933;
      --soft: #1b2447;
      --ink: #eaf0ff;
      --muted: #a9b3d6;
      --accent: #7aa2ff;
      --accent-2:#91ffd9;
      --danger: #ff6b6b;
      --shadow: 0 10px 30px rgba(0,0,0,.35);
      --radius: 16px;
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji";
      background: radial-gradient(1200px 800px at 20% -10%, #243159 0%, transparent 60%), 
                  radial-gradient(1000px 700px at 100% 0%, #1d2a4f 0%, transparent 55%), var(--bg);
      color: var(--ink);
      line-height: 1.55;
    }
    .container{
      max-width: 980px;
      margin: 0 auto;
      padding: 24px;
    }
    .header{
      background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,0));
      border-bottom: 1px solid rgba(255,255,255,.06);
      position: sticky; top: 0; backdrop-filter: blur(10px);
    }
    .brand{
      display:flex; align-items:center; gap:12px;
      padding: 18px 0;
    }
    .logo{
      width:36px; height:36px; border-radius:10px;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      box-shadow: 0 6px 20px rgba(122,162,255,.35);
    }
    .brand h1{ font-size:20px; margin:0; letter-spacing:.3px;}
    .subtitle{ margin: 2px 0 0; color: var(--muted); font-size: 13px; }
    .nav{
      display:flex; flex-wrap: wrap; gap:8px; margin: 10px 0 4px;
    }
    .nav a{
      text-decoration:none; color: var(--ink); font-size: 14px;
      border:1px solid rgba(255,255,255,.08);
      padding: 8px 12px; border-radius: 999px;
      background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.01));
      transition: .2s ease all;
    }
    .nav a:hover{ border-color: rgba(255,255,255,.18); transform: translateY(-1px); }
    .grid{
      display:grid; gap:16px; grid-template-columns: 1fr;
    }
    @media (min-width: 820px){ .grid{ grid-template-columns: 1fr; } }

    .card{
      background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
      border: 1px solid rgba(255,255,255,.08);
      border-radius: var(--radius);
      padding: 18px;
      box-shadow: var(--shadow);
    }
    .card h2{ margin: 0 0 6px; font-size: 18px; }
    .hint{ color: var(--muted); font-size: 13px; }
    .danger{ color: var(--danger); font-weight: 600; }

    .badge{
      display:inline-block; font-size: 12px; color: #0b1020; font-weight:700;
      background: linear-gradient(135deg, var(--accent-2), var(--accent));
      padding: 3px 8px; border-radius: 999px; letter-spacing:.3px;
      box-shadow: 0 6px 20px rgba(122,162,255,.35);
    }

    input, textarea, button {
      font: inherit;
    }
    .input, .textarea, select{
      width: 100%;
      padding: 10px 12px;
      border-radius: 12px;
      background: #0d1430;
      border: 1px solid rgba(255,255,255,.12);
      color: var(--ink);
      outline: none;
      transition: .2s ease border, .2s ease box-shadow;
    }
    .textarea{ min-height: 110px; }
    .input:focus, .textarea:focus{
      border-color: var(--accent);
      box-shadow: 0 0 0 4px rgba(122,162,255,.15);
    }

    .btn{
      display:inline-flex; align-items:center; justify-content:center; gap:8px;
      padding: 10px 14px; border-radius: 12px; cursor: pointer;
      border: 1px solid rgba(255,255,255,.14);
      background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
      color: var(--ink);
      transition: .2s ease transform, .2s ease border;
    }
    .btn:hover{ transform: translateY(-1px); border-color: rgba(255,255,255,.24); }
    .btn.primary{
      border-color: transparent;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #0b1020; font-weight:700;
      box-shadow: 0 10px 30px rgba(122,162,255,.35);
    }
    .row{ display:grid; gap: 10px; grid-template-columns: 1fr; }
    @media (min-width: 560px){ .row-2{ grid-template-columns: 1fr 1fr; } }

    code, pre{
      background: #0d1430;
      color: #d3dcff;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 10px;
      padding: .35rem .55rem;
    }
    pre{ padding: 12px; overflow:auto; }
    ul{ padding-left: 18px; }
    a { color: var(--accent-2); }
    footer{
      margin: 24px 0 8px; color: var(--muted); font-size: 12px; text-align:center;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <div class="brand">
        <div class="logo"></div>
        <div>
          <h1>QA Security Lab</h1>
          <p class="subtitle">${subtitle || 'Deliberately insecure app for classroom demos · Do not use in production'}</p>
        </div>
      </div>
      <nav class="nav">
        <a href="/">Home</a>
        <a href="/login">Login</a>
        <a href="/search">Search (XSS)</a>
        <a href="/admin">Admin</a>
        <a href="/reset-password">Reset Password</a>
        <a href="/notes">Notes (Stored XSS)</a>
        <a href="/debug/users" title="Intentionally exposed">Debug: Users</a>
        <a href="/logout">Logout</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <div class="grid">
      ${body}
    </div>
  </main>

  <footer>
    <span class="hint">Intentionally vulnerable · Use only on localhost for learning</span>
  </footer>
</body>
</html>`;

// -------------------- routes --------------------
app.get('/', (req, res) => {
  const sess = getSession(req);
  const who = sess
    ? `Logged in as <b>${sess.username}</b> <span class="badge">${sess.role}</span>`
    : 'Not logged in';
  res.send(page(
    'Home',
`<section class="card">
    <h2>Welcome</h2>
    <p>${who}</p>
    <p>This app is intentionally vulnerable. <b>Use it ONLY on your own machine for demos.</b></p>
    <ul>
      <li><b>SQLi-style login bypass</b> via crafted password</li>
      <li><b>Reflected XSS</b> in <code>/search</code></li>
      <li><b>Stored XSS</b> in <code>/notes</code></li>
      <li><b>Broken Access Control</b> via role tampering</li>
      <li><b>Weak passwords</b> & plaintext storage</li>
      <li><b>Insecure cookies</b> (unsigned, readable by JS)</li>
      <li><b>Debug endpoint</b> leaking sensitive data</li>
    </ul>
    <p class="hint">Tip: Open DevTools → Application → Cookies to inspect the <code>session</code> cookie.</p>
</section>`
  ));
});

// --- Login (SQLi-style bypass demo) ---
app.get('/login', (req, res) => {
  res.send(page(
    'Login',
`<section class="card">
    <h2>Login</h2>
    <form method="POST" action="/login" class="form">
      <div class="row">
        <label>Username<br/><input class="input" name="username" required></label>
        <label>Password<br/><input class="input" type="text" name="password" required></label>
      </div>
      <div style="margin-top:10px;">
        <button class="btn primary" type="submit">Login</button>
      </div>
    </form>
    <p class="hint" style="margin-top:10px;">
      Try password like <code>' OR '1'='1</code> to bypass (educational demo).
    </p>
</section>`
  ));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // INSECURE: simulate concatenated-SQL login check
  const bypass = typeof password === 'string' && /'\s*or\s*'1'\s*=\s*'1/i.test(password);
  const user = users.find(u => u.username === username && (u.password === password || bypass));
  if (user) {
    setSession(res, { username: user.username, role: user.role });
    return res.send(page('Login success',
`<section class="card">
  <h2>Welcome, <b>${user.username}</b> <span class="badge">${user.role}</span></h2>
  <p><a class="btn" href="/">Go Home</a></p>
</section>`));
  }
  res.status(401).send(page('Login failed',
`<section class="card">
  <h2 class="danger">Invalid credentials</h2>
  <p><a class="btn" href="/login">Try again</a></p>
</section>`));
});

// --- Reflected XSS ---
app.get('/search', (req, res) => {
  const q = req.query.q ?? '';
  // INSECURE: directly reflect user input without encoding
  res.send(page(
    'Search (Reflected XSS)',
`<section class="card">
  <h2>Search</h2>
  <form method="GET" action="/search">
    <input class="input" name="q" placeholder="Search term" value="${q}">
    <div style="margin-top:10px;">
      <button class="btn primary" type="submit">Search</button>
    </div>
  </form>
  <div class="card" style="margin-top:12px;">
    <p>Results for: ${q}</p>
    <p class="hint">Try: <code>&lt;script&gt;alert('XSS!')&lt;/script&gt;</code></p>
  </div>
</section>`
  ));
});

// --- Broken Access Control / role tampering ---
app.get('/admin', (req, res) => {
  const sess = getSession(req);
  const roleOverride = req.query.as;
  if (roleOverride) {
    if (sess) setSession(res, { ...sess, role: roleOverride });
  }
  const effective = getSession(req);
  if (effective && effective.role === 'admin') {
    return res.send(page('Admin dashboard',
`<section class="card">
  <h2>Admin Dashboard</h2>
  <p>Only admins should be here. But the checks are weak...</p>
  <p class="hint">Tricks: login as normal user, then visit <code>/admin?as=admin</code> or use <a href="/setRole?role=admin">/setRole?role=admin</a></p>
</section>`));
  }
  res.status(403).send(page('Forbidden',
`<section class="card">
  <h2 class="danger">403 – You are not admin.</h2>
  <p class="hint">…unless you can find a way to become one 😉</p>
</section>`));
});

app.get('/setRole', (req, res) => {
  // INSECURE: no auth check, lets anyone change their role cookie
  const role = req.query.role || 'user';
  const sess = getSession(req) || { username: 'guest', role: 'guest' };
  setSession(res, { ...sess, role });
  res.send(page('Role set',
`<section class="card">
  <h2>Your role is now: <span class="badge">${role}</span></h2>
  <p><a class="btn" href="/admin">Go to /admin</a></p>
</section>`));
});

// --- Weak password reset + plaintext storage ---
app.get('/reset-password', (req, res) => {
  res.send(page('Reset Password',
`<section class="card">
  <h2>Reset Password</h2>
  <form method="POST" action="/reset-password">
    <div class="row row-2">
      <label>Username<br/><input class="input" name="username" required></label>
      <label>New Password<br/><input class="input" name="newPassword" required></label>
    </div>
    <div style="margin-top:10px;">
      <button class="btn primary" type="submit">Update</button>
    </div>
  </form>
  <p class="hint" style="margin-top:10px;">Policy is intentionally weak: allows short and common passwords.</p>
</section>`));
});

app.post('/reset-password', (req, res) => {
  const { username, newPassword } = req.body;
  // INSECURE: weak policy
  if (!newPassword || newPassword.length < 4) {
    // still accepts it; shows a warning
    const user = users.find(u => u.username === username);
    if (user) user.password = newPassword || '';
    return res.send(page('Reset Password',
`<section class="card">
  <h2 class="danger">Too short, but accepted (for demo)</h2>
  <p>Weak policy allows short passwords and stores them in plaintext.</p>
  <p><a class="btn" href="/debug/users">View /debug/users</a></p>
</section>`));
  }
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.send(page('Reset Password',
`<section class="card">
  <h2 class="danger">User not found</h2>
  <p><a class="btn" href="/reset-password">Back</a></p>
</section>`));
  }
  // INSECURE: store plaintext, no hashing/salting
  user.password = newPassword;
  res.send(page('Password reset',
`<section class="card">
  <h2>Password updated (plaintext)</h2>
  <p><a class="btn" href="/debug/users">View /debug/users</a></p>
</section>`));
});

// --- Stored XSS (public notes) ---
app.get('/notes', (req, res) => {
  const items = publicNotes.map(n => `<li>${n}</li>`).join('');
  res.send(page('Public Notes (Stored XSS)',
`<section class="card">
  <h2>Public Notes</h2>
  <form method="POST" action="/notes">
    <textarea class="textarea" name="note" placeholder="Write a note… (no filtering!)"></textarea><br/>
    <button class="btn primary" type="submit">Add</button>
  </form>
  <div class="card" style="margin-top:12px;">
    <ul>${items}</ul>
    <p class="hint">Try posting a script tag and revisit the page.</p>
  </div>
</section>`));
});

app.post('/notes', (req, res) => {
  // INSECURE: no sanitization, saved as-is
  publicNotes.push(req.body.note || '');
  res.redirect('/notes');
});

// --- Debug endpoint (leaks secrets) ---
app.get('/debug/users', (req, res) => {
  res.type('json').send(JSON.stringify(users, null, 2));
});

// --- logout / clear session ---
app.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/');
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`qa-security-lab running on http://localhost:${PORT}`);
});
