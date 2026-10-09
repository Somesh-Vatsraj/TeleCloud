import { fileEmoji } from '../../utils/fileIcons.js';
import { formatBytes, relativeTime, truncate } from '../../utils/format.js';
import { api } from '../../api/index.js';

export default function FileItem({ file, onStar, onDelete, onShare, onPreview }) {
  const downloadUrl = api.downloadUrl(file.id);
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 grid place-items-center text-2xl flex-shrink-0">
          {fileEmoji(file.mime, file.name)}
        </div>
        <div className="min-w-0 flex-1">
          <button
            onClick={() => onPreview?.(file)}
            className="text-left text-sm font-medium truncate w-full hover:text-blue-500"
            title={file.name}
          >
            {truncate(file.name, 32)}
          </button>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {formatBytes(file.size)} · {relativeTime(file.created_at)}
          </div>
        </div>
        <button
          onClick={() => onStar?.(file)}
          className={`text-xl transition-transform hover:scale-110 ${file.starred ? '' : 'opacity-40'}`}
          title={file.starred ? 'Unstar' : 'Star'}
        >
          ⭐
        </button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <a
          href={downloadUrl}
          className="btn-ghost text-xs px-2.5 py-1.5"
          download={file.name}
        >
          ⬇️ Download
        </a>
        <button onClick={() => onPreview?.(file)} className="btn-ghost text-xs px-2.5 py-1.5">
          👁️ Preview
        </button>
        <button onClick={() => onShare?.(file)} className="btn-ghost text-xs px-2.5 py-1.5">
          🔗 Share
        </button>
        <button
          onClick={() => onDelete?.(file)}
          className="text-xs px-2.5 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
