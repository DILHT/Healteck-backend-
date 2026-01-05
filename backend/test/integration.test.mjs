import assert from 'assert';

const BASE = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

const rand = () => Math.random().toString(36).slice(2, 8);

const log = (k, v) => console.log(k, JSON.stringify(v, null, 2));

const req = async (path, opts = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...opts,
  });
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch(e) { body = text }
  return { status: res.status, body };
};

const run = async () => {
  console.log('Integration test starting against', BASE);
  const email = `test+${rand()}@example.com`;
  const password = 'password123';

  // Register
  let r = await req('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
  log('register', r);
  assert(r.status === 201, 'register failed');
  const access = r.body.tokens.accessToken;
  const refresh = r.body.tokens.refreshToken;
  assert(access && refresh, 'tokens missing');

  // Login
  r = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  log('login', r);
  assert(r.status === 200, 'login failed');

  // Get /me
  r = await req('/me', { method: 'GET', headers: { Authorization: `Bearer ${access}` } });
  log('me', r);
  assert(r.status === 200, '/me failed');

  // Refresh
  r = await req('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: refresh }) });
  log('refresh', r);
  assert(r.status === 200, 'refresh failed');
  const newAccess = r.body.accessToken;
  const newRefresh = r.body.refreshToken;
  assert(newAccess && newRefresh, 'rotated tokens missing');

  // Logout (revoke newRefresh)
  r = await req('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: newRefresh }) });
  log('logout', r);
  assert(r.status === 204, 'logout failed');

  console.log('\nAll integration checks passed');
};

run().catch(err => { console.error('Integration test failed'); console.error(err); process.exit(1); });
