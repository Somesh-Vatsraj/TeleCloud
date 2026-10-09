const BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const contentType = res.headers.get('Content-Type') || '';
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => ({}))
    : await res.text();
  if (!res.ok) {
    const message = data && data.error ? data.error : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  // Public
  register: (body) => request('/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/logout', { method: 'POST' }),
  me: () => request('/me'),
  botInfo: () => request('/bot-info'),

  // Profile
  updateProfile: (body) => request('/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  detectChatId: () => request('/detect-chat-id', { method: 'POST' }),

  // Stats
  stats: () => request('/stats'),

  // Files
  listFiles: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    const q = qs.toString();
    return request(`/files${q ? `?${q}` : ''}`);
  },
  uploadFile: (file, folder_id) => {
    const fd = new FormData();
    fd.append('file', file);
    if (folder_id) fd.append('folder_id', folder_id);
    return request('/files/upload', { method: 'POST', body: fd });
  },
  updateFile: (id, body) => request(`/files/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteFile: (id) => request(`/files/${id}`, { method: 'DELETE' }),
  downloadUrl: (id) => `${BASE}/files/${id}/download`,

  // Folders
  listFolders: () => request('/folders'),
  createFolder: (body) => request('/folders', { method: 'POST', body: JSON.stringify(body) }),
  deleteFolder: (id) => request(`/folders/${id}`, { method: 'DELETE' }),

  // Shares
  listShares: () => request('/shares'),
  createShare: (body) => request('/shares', { method: 'POST', body: JSON.stringify(body) }),
  deleteShare: (id) => request(`/shares/${id}`, { method: 'DELETE' }),

  // AI
  aiChat: (prompt) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ prompt }) }),
  listMessages: () => request('/messages'),
  listActivities: () => request('/activities'),

  // Admin
  setBotToken: (bot_token) =>
    request('/admin/bot-token', { method: 'POST', body: JSON.stringify({ bot_token }) }),
  adminUsers: () => request('/admin/users'),

  // Public share
  publicShare: (token) => request(`/public/share/${token}`),
  publicShareDownloadUrl: (token) => `${BASE}/public/share/${token}/download`,
};
