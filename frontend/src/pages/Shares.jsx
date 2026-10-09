import { useEffect, useState } from 'react';
import { api } from '../api/index.js';
import { useToast } from '../hooks/useToast.jsx';
import Loader from '../components/common/Loader.jsx';
import { formatBytes, formatDateTime } from '../utils/format.js';

export default function Shares() {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listShares();
      setShares(data.shares || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (s) => {
    if (!confirm('Delete this share link?')) return;
    try {
      await api.deleteShare(s.id);
      setShares((x) => x.filter((y) => y.id !== s.id));
      toast.success('Share deleted');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const copy = (token) => {
    const url = `${window.location.origin}/s/${token}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success('Link copied'),
      () => toast.error('Copy failed')
    );
  };

  if (loading) return <Loader full />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Shares</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Public download links with optional password and expiry.
        </p>
      </div>

      {!shares.length ? (
        <div className="card-static p-10 text-center">
          <div className="text-4xl mb-3">🔗</div>
          <p className="text-slate-500 dark:text-slate-400">
            No shares yet — create one from the Files page.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shares.map((s) => {
            const expired = s.expires_at && s.expires_at * 1000 < Date.now();
            return (
              <div key={s.id} className="card-static p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{s.file_name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatBytes(s.file_size)} · {s.downloads} download{s.downloads === 1 ? '' : 's'}
                    {s.password ? ' · 🔒 password' : ''}
                    {s.expires_at ? ` · expires ${formatDateTime(s.expires_at)}` : ' · never expires'}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {expired && <span className="badge bg-red-500/15 text-red-500">Expired</span>}
                  <button onClick={() => copy(s.token)} className="btn-ghost text-xs px-3 py-1.5">
                    📋 Copy
                  </button>
                  <a
                    href={`/s/${s.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-xs px-3 py-1.5"
                  >
                    ↗ Open
                  </a>
                  <button
                    onClick={() => remove(s)}
                    className="text-xs px-3 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
