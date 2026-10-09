import { formatBytes } from '../../utils/format.js';

export default function StorageChart({ byType = [] }) {
  const groups = { images: 0, videos: 0, audio: 0, docs: 0 };
  for (const row of byType) {
    const m = (row.mime || '').toLowerCase();
    if (m.startsWith('image/')) groups.images += row.size || 0;
    else if (m.startsWith('video/')) groups.videos += row.size || 0;
    else if (m.startsWith('audio/')) groups.audio += row.size || 0;
    else groups.docs += row.size || 0;
  }
  const total = Object.values(groups).reduce((a, b) => a + b, 0) || 1;
  const items = [
    { key: 'images', label: 'Images', color: 'bg-blue-500', emoji: '🖼️' },
    { key: 'videos', label: 'Videos', color: 'bg-purple-500', emoji: '🎬' },
    { key: 'audio', label: 'Audio', color: 'bg-emerald-500', emoji: '🎵' },
    { key: 'docs', label: 'Docs', color: 'bg-amber-500', emoji: '📄' },
  ];

  return (
    <div className="card-static p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold">Storage breakdown</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total {formatBytes(total === 1 ? 0 : total)}
          </div>
        </div>
        <div className="text-2xl">📊</div>
      </div>

      <div className="flex h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 mb-4">
        {items.map((it) => {
          const pct = (groups[it.key] / total) * 100;
          return (
            <div
              key={it.key}
              className={`${it.color} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${it.label}: ${formatBytes(groups[it.key])}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.key} className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${it.color}`} />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {it.emoji} {it.label}
              </span>
              <div className="font-medium text-slate-900 dark:text-white">
                {formatBytes(groups[it.key])}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
