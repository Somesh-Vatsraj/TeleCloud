import {
  signJWT,
  verifyJWT,
  hashPassword,
  verifyPassword,
  setAuthCookie,
  clearAuthCookie,
  getTokenFromRequest,
  getUserFromRequest,
  json,
} from './auth.js';
import {
  getMe,
  getUpdates,
  sendMessage,
  sendDocument,
  extractFileInfo,
  getFile,
  downloadFile,
} from './telegram.js';
import { chatAI } from './ai.js';
import {
  all,
  first,
  run,
  getSetting,
  setSetting,
  logActivity,
} from './db.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

function withCors(res) {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

function apiJson(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

function apiError(message, status = 400) {
  return apiJson({ error: message }, status);
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function uid() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 24);
}

function slugify(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 32);
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------- Route Handlers ----------------

async function handleRegister(request, env) {
  const body = await readJson(request);
  const { name, email, tg_username, password } = body;
  if (!name || !email || !password) return apiError('Name, email and password required');
  if (!emailRe.test(email)) return apiError('Invalid email');
  if (password.length < 6) return apiError('Password must be at least 6 characters');

  const existing = await first(env, 'SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (existing) return apiError('Email already registered');

  const password_hash = await hashPassword(password);
  const cleanTg = tg_username ? String(tg_username).replace(/^@/, '') : null;

  const res = await run(
    env,
    'INSERT INTO users (name, email, password_hash, tg_username) VALUES (?, ?, ?, ?)',
    [name.trim(), email.toLowerCase(), password_hash, cleanTg]
  );

  const userId = res.meta.last_row_id;
  const isFirst = (await first(env, 'SELECT COUNT(*) as c FROM users'))?.c === 1;
  if (isFirst) {
    await run(env, 'UPDATE users SET is_admin = 1 WHERE id = ?', [userId]);
  }

  const token = await signJWT({ sub: userId }, env.JWT_SECRET);
  const user = await first(env, 'SELECT id, name, email, tg_username, chat_id, is_admin, theme, avatar, bio, created_at FROM users WHERE id = ?', [userId]);
  await logActivity(env, userId, 'register', `Welcome ${name}!`);

  const res2 = apiJson({ user, token });
  setAuthCookie(res2.headers, token);
  return res2;
}

async function handleLogin(request, env) {
  const body = await readJson(request);
  const { email, password } = body;
  if (!email || !password) return apiError('Email and password required');

  const user = await first(env, 'SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!user) return apiError('Invalid credentials', 401);

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return apiError('Invalid credentials', 401);

  const token = await signJWT({ sub: user.id }, env.JWT_SECRET);
  delete user.password_hash;

  const res = apiJson({ user, token });
  setAuthCookie(res.headers, token);
  await logActivity(env, user.id, 'login', 'Signed in');
  return res;
}

async function handleLogout(request, env) {
  const res = apiJson({ ok: true });
  clearAuthCookie(res.headers);
  return res;
}

async function handleMe(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return apiError('Unauthorized', 401);
  return apiJson({ user });
}

async function handleBotInfo(request, env) {
  const token = await getSetting(env, 'bot_token');
  const bot_username = await getSetting(env, 'bot_username');
  return apiJson({
    bot_username: bot_username || null,
    ready: Boolean(token && bot_username),
  });
}

async function handlePublicShare(request, env, token) {
  const share = await first(
    env,
    `SELECT s.*, f.name as file_name, f.size as file_size, f.mime as file_mime
     FROM shares s JOIN files f ON f.id = s.file_id WHERE s.token = ?`,
    [token]
  );
  if (!share) return apiError('Share not found', 404);
  if (share.expires_at && share.expires_at < Math.floor(Date.now() / 1000)) {
    return apiError('Share expired', 410);
  }
  return apiJson({
    file_name: share.file_name,
    file_size: share.file_size,
    file_mime: share.file_mime,
    requires_password: Boolean(share.password),
    downloads: share.downloads,
    created_at: share.created_at,
    expires_at: share.expires_at,
  });
}

async function handlePublicDownload(request, env, token) {
  const share = await first(
    env,
    `SELECT s.*, f.tg_file_id, f.name as file_name, f.mime as file_mime, f.size as file_size
     FROM shares s JOIN files f ON f.id = s.file_id WHERE s.token = ?`,
    [token]
  );
  if (!share) return apiError('Share not found', 404);
  if (share.expires_at && share.expires_at < Math.floor(Date.now() / 1000)) {
    return apiError('Share expired', 410);
  }
  if (share.password) {
    const body = await readJson(request);
    if (!body.password) return apiError('Password required', 401);
    // password stored hashed
    const ok = await verifyPassword(body.password, share.password);
    if (!ok) return apiError('Invalid password', 401);
  }

  const botToken = await getSetting(env, 'bot_token');
  if (!botToken) return apiError('Bot not configured', 500);

  const fileInfo = await getFile(botToken, share.tg_file_id);
  const tgRes = await downloadFile(botToken, fileInfo.file_path);
  if (!tgRes.ok) return apiError('Failed to fetch file from Telegram', 502);

  await run(env, 'UPDATE shares SET downloads = downloads + 1 WHERE id = ?', [share.id]);

  const headers = new Headers();
  headers.set('Content-Type', share.file_mime || 'application/octet-stream');
  headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(share.file_name)}"`);
  if (share.file_size) headers.set('Content-Length', String(share.file_size));
  headers.set('Accept-Ranges', tgRes.headers.get('Accept-Ranges') || 'bytes');
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);

  return new Response(tgRes.body, { status: 200, headers });
}

// ---------- Auth-required handlers ----------

async function handleProfile(request, env, user) {
  const body = await readJson(request);
  const updates = [];
  const params = [];

  if (typeof body.name === 'string' && body.name.trim()) {
    updates.push('name = ?');
    params.push(body.name.trim());
  }
  if (typeof body.bio === 'string') {
    updates.push('bio = ?');
    params.push(body.bio.slice(0, 500));
  }
  if (typeof body.avatar === 'string') {
    updates.push('avatar = ?');
    params.push(body.avatar.slice(0, 1000));
  }
  if (typeof body.theme === 'string' && ['dark', 'light'].includes(body.theme)) {
    updates.push('theme = ?');
    params.push(body.theme);
  }
  if (typeof body.password === 'string' && body.password.length >= 6) {
    const hash = await hashPassword(body.password);
    updates.push('password_hash = ?');
    params.push(hash);
  }

  if (updates.length) {
    params.push(user.id);
    await run(env, `UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    await logActivity(env, user.id, 'profile_update', 'Updated profile');
  }

  const fresh = await first(
    env,
    'SELECT id, name, email, tg_username, chat_id, is_admin, theme, avatar, bio, created_at FROM users WHERE id = ?',
    [user.id]
  );
  return apiJson({ user: fresh });
}

async function handleDetectChatId(request, env, user) {
  const botToken = await getSetting(env, 'bot_token');
  if (!botToken) return apiError('Bot not configured yet. Ask admin to set token.', 400);
  if (!user.tg_username) return apiError('Please add your Telegram username in profile first.', 400);

  const desired = user.tg_username.replace(/^@/, '').toLowerCase();

  try {
    const updates = await getUpdates(botToken, 0, 0);
    let found = null;
    for (const u of updates || []) {
      const msg = u.message;
      if (!msg) continue;
      const from = msg.from || {};
      const uname = (from.username || '').toLowerCase();
      if (uname === desired) {
        found = msg.chat.id;
        break;
      }
    }
    if (!found) {
      return apiError(
        `No message found from @${user.tg_username}. Send /start to the bot on Telegram then try again.`,
        404
      );
    }
    await run(env, 'UPDATE users SET chat_id = ? WHERE id = ?', [String(found), user.id]);
    await logActivity(env, user.id, 'detect_chat', `Chat ID ${found} detected`);
    return apiJson({ chat_id: String(found) });
  } catch (e) {
    return apiError(e.message, 500);
  }
}

async function handleStats(request, env, user) {
  const totalFiles = (await first(env, 'SELECT COUNT(*) as c FROM files WHERE user_id = ?', [user.id]))?.c || 0;
  const totalSize = (await first(env, 'SELECT COALESCE(SUM(size),0) as s FROM files WHERE user_id = ?', [user.id]))?.s || 0;
  const totalFolders = (await first(env, 'SELECT COUNT(*) as c FROM folders WHERE user_id = ?', [user.id]))?.c || 0;
  const totalShares = (await first(env, 'SELECT COUNT(*) as c FROM shares WHERE user_id = ?', [user.id]))?.c || 0;
  const starred = (await first(env, 'SELECT COUNT(*) as c FROM files WHERE user_id = ? AND starred = 1', [user.id]))?.c || 0;

  const byType = await all(
    env,
    `SELECT mime, COUNT(*) as count, COALESCE(SUM(size),0) as size FROM files WHERE user_id = ? GROUP BY mime`,
    [user.id]
  );

  const recent = await all(
    env,
    'SELECT id, name, size, mime, created_at FROM files WHERE user_id = ? ORDER BY id DESC LIMIT 5',
    [user.id]
  );

  return apiJson({
    totalFiles,
    totalSize,
    totalFolders,
    totalShares,
    starred,
    byType,
    recent,
  });
}

async function handleListFiles(request, env, user) {
  const url = new URL(request.url);
  const folder = url.searchParams.get('folder');
  const search = url.searchParams.get('search');
  const filter = url.searchParams.get('filter');

  let sql = 'SELECT * FROM files WHERE user_id = ?';
  const params = [user.id];

  if (folder && folder !== 'all') {
    if (folder === 'null') {
      sql += ' AND folder_id IS NULL';
    } else {
      sql += ' AND folder_id = ?';
      params.push(parseInt(folder, 10));
    }
  }
  if (search) {
    sql += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }
  if (filter === 'starred') {
    sql += ' AND starred = 1';
  } else if (filter === 'images') {
    sql += " AND mime LIKE 'image/%'";
  } else if (filter === 'videos') {
    sql += " AND mime LIKE 'video/%'";
  } else if (filter === 'audio') {
    sql += " AND mime LIKE 'audio/%'";
  } else if (filter === 'docs') {
    sql += " AND (mime NOT LIKE 'image/%' AND mime NOT LIKE 'video/%' AND mime NOT LIKE 'audio/%')";
  }

  sql += ' ORDER BY id DESC LIMIT 500';
  const files = await all(env, sql, params);
  return apiJson({ files });
}

async function handleUpload(request, env, user) {
  const botToken = await getSetting(env, 'bot_token');
  if (!botToken) return apiError('Bot token not configured. Admin must set it.', 400);
  if (!user.chat_id) return apiError('Chat ID not set. Go to Profile → Detect Chat ID.', 400);

  let form;
  try {
    form = await request.formData();
  } catch {
    return apiError('Invalid form data');
  }

  const file = form.get('file');
  const folderId = form.get('folder_id');
  if (!file || typeof file === 'string') return apiError('No file provided');

  const MAX = 50 * 1024 * 1024;
  if (file.size > MAX) return apiError('File exceeds 50MB limit');

  const filename = file.name || 'file';

  let tgMsg;
  try {
    tgMsg = await sendDocument(botToken, user.chat_id, file, filename, `📁 Uploaded via TeleCloud`);
  } catch (e) {
    return apiError(`Telegram error: ${e.message}`, 502);
  }

  const info = extractFileInfo(tgMsg);
  if (!info) return apiError('Could not extract file info from Telegram response', 500);

  const folderVal = folderId && folderId !== 'null' && folderId !== '' ? parseInt(folderId, 10) : null;
  const res = await run(
    env,
    'INSERT INTO files (user_id, folder_id, tg_file_id, message_id, name, size, mime) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [user.id, folderVal, info.file_id, tgMsg.message_id, filename, info.size || file.size, info.mime || file.type || 'application/octet-stream']
  );

  const fileId = res.meta.last_row_id;
  await logActivity(env, user.id, 'upload', `Uploaded ${filename}`);

  const saved = await first(env, 'SELECT * FROM files WHERE id = ?', [fileId]);
  return apiJson({ file: saved });
}

async function handlePatchFile(request, env, user, id) {
  const file = await first(env, 'SELECT * FROM files WHERE id = ? AND user_id = ?', [id, user.id]);
  if (!file) return apiError('File not found', 404);

  const body = await readJson(request);
  const updates = [];
  const params = [];

  if (typeof body.starred === 'boolean' || typeof body.starred === 'number') {
    updates.push('starred = ?');
    params.push(body.starred ? 1 : 0);
  }
  if ('folder_id' in body) {
    updates.push('folder_id = ?');
    params.push(body.folder_id ? parseInt(body.folder_id, 10) : null);
  }
  if (!updates.length) return apiError('No updates');

  params.push(id);
  await run(env, `UPDATE files SET ${updates.join(', ')} WHERE id = ?`, params);
  const fresh = await first(env, 'SELECT * FROM files WHERE id = ?', [id]);
  return apiJson({ file: fresh });
}

async function handleDeleteFile(request, env, user, id) {
  const file = await first(env, 'SELECT * FROM files WHERE id = ? AND user_id = ?', [id, user.id]);
  if (!file) return apiError('File not found', 404);
  await run(env, 'DELETE FROM files WHERE id = ?', [id]);
  await logActivity(env, user.id, 'delete', `Deleted ${file.name}`);
  return apiJson({ ok: true });
}

async function handleDownloadFile(request, env, user, id) {
  const file = await first(env, 'SELECT * FROM files WHERE id = ? AND user_id = ?', [id, user.id]);
  if (!file) return apiError('File not found', 404);

  const botToken = await getSetting(env, 'bot_token');
  if (!botToken) return apiError('Bot not configured', 500);

  const fileInfo = await getFile(botToken, file.tg_file_id);
  const range = request.headers.get('Range');
  const fetchHeaders = {};
  if (range) fetchHeaders['Range'] = range;

  const tgRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${fileInfo.file_path}`, {
    headers: fetchHeaders,
  });

  const headers = new Headers();
  headers.set('Content-Type', file.mime || 'application/octet-stream');
  headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
  const cl = tgRes.headers.get('Content-Length');
  if (cl) headers.set('Content-Length', cl);
  headers.set('Accept-Ranges', 'bytes');
  const cr = tgRes.headers.get('Content-Range');
  if (cr) headers.set('Content-Range', cr);
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);

  return new Response(tgRes.body, { status: tgRes.status, headers });
}

async function handleListFolders(request, env, user) {
  const folders = await all(
    env,
    `SELECT f.*, (SELECT COUNT(*) FROM files WHERE folder_id = f.id) as file_count
     FROM folders f WHERE f.user_id = ? ORDER BY f.id DESC`,
    [user.id]
  );
  return apiJson({ folders });
}

async function handleCreateFolder(request, env, user) {
  const body = await readJson(request);
  const { name, color } = body;
  if (!name || !name.trim()) return apiError('Folder name required');
  const res = await run(
    env,
    'INSERT INTO folders (user_id, name, color) VALUES (?, ?, ?)',
    [user.id, name.trim().slice(0, 60), color || '#3b82f6']
  );
  const folder = await first(env, 'SELECT * FROM folders WHERE id = ?', [res.meta.last_row_id]);
  await logActivity(env, user.id, 'folder_create', `Created folder ${name}`);
  return apiJson({ folder });
}

async function handleDeleteFolder(request, env, user, id) {
  const folder = await first(env, 'SELECT * FROM folders WHERE id = ? AND user_id = ?', [id, user.id]);
  if (!folder) return apiError('Folder not found', 404);
  await run(env, 'UPDATE files SET folder_id = NULL WHERE folder_id = ?', [id]);
  await run(env, 'DELETE FROM folders WHERE id = ?', [id]);
  await logActivity(env, user.id, 'folder_delete', `Deleted folder ${folder.name}`);
  return apiJson({ ok: true });
}

async function handleListShares(request, env, user) {
  const shares = await all(
    env,
    `SELECT s.*, f.name as file_name, f.size as file_size, f.mime as file_mime
     FROM shares s JOIN files f ON f.id = s.file_id
     WHERE s.user_id = ? ORDER BY s.id DESC`,
    [user.id]
  );
  return apiJson({ shares });
}

async function handleCreateShare(request, env, user) {
  const body = await readJson(request);
  const { file_id, password, expiry } = body;
  if (!file_id) return apiError('file_id required');

  const file = await first(env, 'SELECT * FROM files WHERE id = ? AND user_id = ?', [file_id, user.id]);
  if (!file) return apiError('File not found', 404);

  const token = uid();
  const hashedPw = password ? await hashPassword(password) : null;
  let expires_at = null;
  if (expiry && typeof expiry === 'number' && expiry > 0) {
    expires_at = Math.floor(Date.now() / 1000) + expiry;
  } else if (expiry === '1d') {
    expires_at = Math.floor(Date.now() / 1000) + 86400;
  } else if (expiry === '7d') {
    expires_at = Math.floor(Date.now() / 1000) + 86400 * 7;
  } else if (expiry === '30d') {
    expires_at = Math.floor(Date.now() / 1000) + 86400 * 30;
  }

  await run(
    env,
    'INSERT INTO shares (user_id, file_id, token, password, expires_at) VALUES (?, ?, ?, ?, ?)',
    [user.id, file_id, token, hashedPw, expires_at]
  );

  const share = await first(env, 'SELECT * FROM shares WHERE token = ?', [token]);
  await logActivity(env, user.id, 'share_create', `Shared ${file.name}`);
  return apiJson({ share });
}

async function handleDeleteShare(request, env, user, id) {
  const share = await first(env, 'SELECT * FROM shares WHERE id = ? AND user_id = ?', [id, user.id]);
  if (!share) return apiError('Share not found', 404);
  await run(env, 'DELETE FROM shares WHERE id = ?', [id]);
  await logActivity(env, user.id, 'share_delete', `Removed share`);
  return apiJson({ ok: true });
}

async function handleAIChat(request, env, user) {
  const body = await readJson(request);
  const prompt = (body.prompt || '').trim();
  if (!prompt) return apiError('Prompt required');
  if (prompt.length > 2000) return apiError('Prompt too long');

  await run(
    env,
    'INSERT INTO messages (user_id, direction, sender, text) VALUES (?, ?, ?, ?)',
    [user.id, 'out', user.name, prompt]
  );

  const history = await all(
    env,
    'SELECT direction, text FROM messages WHERE user_id = ? ORDER BY id DESC LIMIT 10',
    [user.id]
  );
  history.reverse();

  const reply = await chatAI(env, prompt, history);

  await run(
    env,
    'INSERT INTO messages (user_id, direction, sender, text) VALUES (?, ?, ?, ?)',
    [user.id, 'in', 'TeleCloud AI', reply]
  );

  await logActivity(env, user.id, 'ai_chat', prompt.slice(0, 60));
  return apiJson({ reply });
}

async function handleListMessages(request, env, user) {
  const messages = await all(
    env,
    'SELECT id, direction, sender, text, created_at FROM messages WHERE user_id = ? ORDER BY id DESC LIMIT 100',
    [user.id]
  );
  messages.reverse();
  return apiJson({ messages });
}

async function handleListActivities(request, env, user) {
  const activities = await all(
    env,
    'SELECT id, action, detail, created_at FROM activities WHERE user_id = ? ORDER BY id DESC LIMIT 30',
    [user.id]
  );
  return apiJson({ activities });
}

// ---------- Admin ----------

async function handleSetBotToken(request, env, user) {
  if (!user.is_admin) return apiError('Admin only', 403);
  const body = await readJson(request);
  const { bot_token } = body;
  if (!bot_token || !/^\d+:[A-Za-z0-9_-]+$/.test(bot_token)) {
    return apiError('Invalid bot token format');
  }
  let me;
  try {
    me = await getMe(bot_token);
  } catch (e) {
    return apiError(`Token verification failed: ${e.message}`, 400);
  }
  await setSetting(env, 'bot_token', bot_token);
  await setSetting(env, 'bot_username', me.username);
  await logActivity(env, user.id, 'admin_bot_token', `Set bot @${me.username}`);
  return apiJson({ ok: true, bot_username: me.username });
}

async function handleAdminUsers(request, env, user) {
  if (!user.is_admin) return apiError('Admin only', 403);
  const users = await all(
    env,
    `SELECT u.id, u.name, u.email, u.tg_username, u.chat_id, u.is_admin, u.created_at,
      (SELECT COUNT(*) FROM files WHERE user_id = u.id) as file_count,
      (SELECT COALESCE(SUM(size),0) FROM files WHERE user_id = u.id) as total_size
     FROM users u ORDER BY u.id DESC`
  );
  const totals = {
    users: users.length,
    files: (await first(env, 'SELECT COUNT(*) as c FROM files'))?.c || 0,
    size: (await first(env, 'SELECT COALESCE(SUM(size),0) as s FROM files'))?.s || 0,
    shares: (await first(env, 'SELECT COUNT(*) as c FROM shares'))?.c || 0,
  };
  return apiJson({ users, totals });
}

// ---------------- Router ----------------

async function handleApi(request, env, ctx, pathname) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const method = request.method;

  // Public routes
  if (pathname === '/api/register' && method === 'POST') return handleRegister(request, env);
  if (pathname === '/api/login' && method === 'POST') return handleLogin(request, env);
  if (pathname === '/api/logout' && method === 'POST') return handleLogout(request, env);
  if (pathname === '/api/me' && method === 'GET') return handleMe(request, env);
  if (pathname === '/api/bot-info' && method === 'GET') return handleBotInfo(request, env);

  // Public share
  const shareMatch = pathname.match(/^\/api\/public\/share\/([A-Za-z0-9_-]+)$/);
  if (shareMatch && method === 'GET') return handlePublicShare(request, env, shareMatch[1]);
  const shareDlMatch = pathname.match(/^\/api\/public\/share\/([A-Za-z0-9_-]+)\/download$/);
  if (shareDlMatch && method === 'POST') return handlePublicDownload(request, env, shareDlMatch[1]);

  // Authed routes
  const user = await getUserFromRequest(request, env);
  if (!user) return apiError('Unauthorized', 401);

  if (pathname === '/api/profile' && method === 'PATCH') return handleProfile(request, env, user);
  if (pathname === '/api/detect-chat-id' && method === 'POST') return handleDetectChatId(request, env, user);
  if (pathname === '/api/stats' && method === 'GET') return handleStats(request, env, user);

  if (pathname === '/api/files' && method === 'GET') return handleListFiles(request, env, user);
  if (pathname === '/api/files/upload' && method === 'POST') return handleUpload(request, env, user);
  const fileMatch = pathname.match(/^\/api\/files\/(\d+)$/);
  if (fileMatch && method === 'PATCH') return handlePatchFile(request, env, user, parseInt(fileMatch[1], 10));
  if (fileMatch && method === 'DELETE') return handleDeleteFile(request, env, user, parseInt(fileMatch[1], 10));
  const fileDlMatch = pathname.match(/^\/api\/files\/(\d+)\/download$/);
  if (fileDlMatch && method === 'GET') return handleDownloadFile(request, env, user, parseInt(fileDlMatch[1], 10));

  if (pathname === '/api/folders' && method === 'GET') return handleListFolders(request, env, user);
  if (pathname === '/api/folders' && method === 'POST') return handleCreateFolder(request, env, user);
  const folderMatch = pathname.match(/^\/api\/folders\/(\d+)$/);
  if (folderMatch && method === 'DELETE') return handleDeleteFolder(request, env, user, parseInt(folderMatch[1], 10));

  if (pathname === '/api/shares' && method === 'GET') return handleListShares(request, env, user);
  if (pathname === '/api/shares' && method === 'POST') return handleCreateShare(request, env, user);
  const shareIdMatch = pathname.match(/^\/api\/shares\/(\d+)$/);
  if (shareIdMatch && method === 'DELETE') return handleDeleteShare(request, env, user, parseInt(shareIdMatch[1], 10));

  if (pathname === '/api/ai/chat' && method === 'POST') return handleAIChat(request, env, user);
  if (pathname === '/api/messages' && method === 'GET') return handleListMessages(request, env, user);
  if (pathname === '/api/activities' && method === 'GET') return handleListActivities(request, env, user);

  if (pathname === '/api/admin/bot-token' && method === 'POST') return handleSetBotToken(request, env, user);
  if (pathname === '/api/admin/users' && method === 'GET') return handleAdminUsers(request, env, user);

  return apiError('Not found', 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    try {
      if (pathname.startsWith('/api/')) {
        const res = await handleApi(request, env, ctx, pathname);
        return withCors(res);
      }

      // Serve static assets (React SPA)
      if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
        return env.ASSETS.fetch(request);
      }

      return new Response(
        'TeleCloud API is running. Frontend not deployed. Build the frontend with `npm run build` and deploy with `npm run deploy`.',
        { status: 200, headers: { 'Content-Type': 'text/plain' } }
      );
    } catch (err) {
      console.error('Worker error:', err);
      if (pathname.startsWith('/api/')) {
        return apiJson({ error: err.message || 'Internal error' }, 500);
      }
      return new Response('Internal error: ' + (err.message || 'unknown'), { status: 500 });
    }
  },
};
