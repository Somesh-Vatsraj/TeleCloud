// D1 helpers

export function db(env) {
  return env.DB;
}

export async function q(env, sql, params = []) {
  const stmt = env.DB.prepare(sql);
  return params.length ? stmt.bind(...params) : stmt;
}

export async function all(env, sql, params = []) {
  const stmt = await q(env, sql, params);
  const res = await stmt.all();
  return res.results || [];
}

export async function first(env, sql, params = []) {
  const stmt = await q(env, sql, params);
  return await stmt.first();
}

export async function run(env, sql, params = []) {
  const stmt = await q(env, sql, params);
  return await stmt.run();
}

export async function getSetting(env, key) {
  const row = await first(env, 'SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : null;
}

export async function setSetting(env, key, value) {
  await run(
    env,
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value]
  );
}

export async function logActivity(env, userId, action, detail = '') {
  try {
    await run(
      env,
      'INSERT INTO activities (user_id, action, detail) VALUES (?, ?, ?)',
      [userId, action, detail]
    );
  } catch (e) {
    // non-fatal
  }
}
