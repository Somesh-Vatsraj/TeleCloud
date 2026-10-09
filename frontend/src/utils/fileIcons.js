export function fileEmoji(mime = '', name = '') {
  const m = (mime || '').toLowerCase();
  const n = (name || '').toLowerCase();
  if (m.startsWith('image/')) return '🖼️';
  if (m.startsWith('video/')) return '🎬';
  if (m.startsWith('audio/')) return '🎵';
  if (m.includes('pdf') || n.endsWith('.pdf')) return '📕';
  if (m.includes('zip') || m.includes('rar') || m.includes('tar') || n.match(/\.(zip|rar|7z|tar|gz)$/))
    return '🗜️';
  if (m.includes('json') || n.endsWith('.json')) return '🧾';
  if (m.includes('javascript') || n.endsWith('.js')) return '📜';
  if (m.includes('html') || n.endsWith('.html')) return '🌐';
  if (m.includes('css') || n.endsWith('.css')) return '🎨';
  if (n.match(/\.(doc|docx)$/)) return '📘';
  if (n.match(/\.(xls|xlsx|csv)$/)) return '📗';
  if (n.match(/\.(ppt|pptx)$/)) return '📙';
  if (n.match(/\.(txt|md)$/)) return '📄';
  return '📦';
}

export function fileType(mime = '') {
  const m = (mime || '').toLowerCase();
  if (m.startsWith('image/')) return 'image';
  if (m.startsWith('video/')) return 'video';
  if (m.startsWith('audio/')) return 'audio';
  if (m.includes('pdf')) return 'pdf';
  return 'doc';
}
