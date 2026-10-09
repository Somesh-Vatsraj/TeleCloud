export const APP_NAME = 'TeleCloud';
export const APP_TAGLINE = 'AI-powered cloud storage on Telegram';

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const FILE_FILTERS = [
  { key: 'all', label: 'All', emoji: '📂' },
  { key: 'images', label: 'Images', emoji: '🖼️' },
  { key: 'videos', label: 'Videos', emoji: '🎬' },
  { key: 'audio', label: 'Audio', emoji: '🎵' },
  { key: 'docs', label: 'Docs', emoji: '📄' },
  { key: 'starred', label: 'Starred', emoji: '⭐' },
];

export const FOLDER_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#6366f1',
];

export const ACTION_ICONS = {
  register: '🎉',
  login: '🔑',
  upload: '📤',
  delete: '🗑️',
  share_create: '🔗',
  share_delete: '🚫',
  folder_create: '📁',
  folder_delete: '📂',
  ai_chat: '🤖',
  detect_chat: '📡',
  profile_update: '👤',
  admin_bot_token: '🛠️',
};

export const EXPIRY_OPTIONS = [
  { value: '', label: 'Never' },
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
];
