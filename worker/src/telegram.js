// Telegram Bot API wrapper

const API_BASE = 'https://api.telegram.org';

function apiUrl(token, method) {
  return `${API_BASE}/bot${token}/${method}`;
}

export async function callBot(token, method, payload) {
  if (!token) throw new Error('No bot token configured');
  const res = await fetch(apiUrl(token, method), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.description || `Telegram API error: ${method}`);
  }
  return data.result;
}

export async function getMe(token) {
  return callBot(token, 'getMe', {});
}

export async function getUpdates(token, offset = 0, timeout = 0) {
  return callBot(token, 'getUpdates', { offset, timeout, allowed_updates: ['message'] });
}

export async function sendMessage(token, chat_id, text) {
  return callBot(token, 'sendMessage', { chat_id, text });
}

// Send file to Telegram chat: accepts a File/Blob and metadata
export async function sendDocument(token, chat_id, fileBlob, filename, caption) {
  if (!token) throw new Error('No bot token configured');
  if (!chat_id) throw new Error('No chat_id configured');

  const form = new FormData();
  form.append('chat_id', String(chat_id));
  form.append('document', fileBlob, filename || 'file');
  if (caption) form.append('caption', caption);

  const res = await fetch(apiUrl(token, 'sendDocument'), {
    method: 'POST',
    body: form,
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'sendDocument failed');
  return data.result;
}

// Extract file_id + name from a Telegram message
export function extractFileInfo(msg) {
  if (!msg) return null;
  if (msg.document) {
    return {
      file_id: msg.document.file_id,
      name: msg.document.file_name || 'document',
      mime: msg.document.mime_type || 'application/octet-stream',
      size: msg.document.file_size || 0,
    };
  }
  if (msg.video) {
    return {
      file_id: msg.video.file_id,
      name: msg.video.file_name || `video_${msg.message_id}.mp4`,
      mime: msg.video.mime_type || 'video/mp4',
      size: msg.video.file_size || 0,
    };
  }
  if (msg.audio) {
    return {
      file_id: msg.audio.file_id,
      name: msg.audio.file_name || `audio_${msg.message_id}.mp3`,
      mime: msg.audio.mime_type || 'audio/mpeg',
      size: msg.audio.file_size || 0,
    };
  }
  if (msg.voice) {
    return {
      file_id: msg.voice.file_id,
      name: `voice_${msg.message_id}.ogg`,
      mime: msg.voice.mime_type || 'audio/ogg',
      size: msg.voice.file_size || 0,
    };
  }
  if (msg.animation) {
    return {
      file_id: msg.animation.file_id,
      name: msg.animation.file_name || `animation_${msg.message_id}.mp4`,
      mime: msg.animation.mime_type || 'video/mp4',
      size: msg.animation.file_size || 0,
    };
  }
  if (msg.photo && msg.photo.length) {
    const largest = msg.photo[msg.photo.length - 1];
    return {
      file_id: largest.file_id,
      name: `photo_${msg.message_id}.jpg`,
      mime: 'image/jpeg',
      size: largest.file_size || 0,
    };
  }
  return null;
}

// Get file path for downloading
export async function getFile(token, file_id) {
  return callBot(token, 'getFile', { file_id });
}

export async function downloadFile(token, file_path) {
  const url = `${API_BASE}/file/bot${token}/${file_path}`;
  return fetch(url);
}
