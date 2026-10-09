import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/index.js';
import { formatBytes, formatDateTime } from '../utils/format.js';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Loader from '../components/common/Loader.jsx';

export default function PublicShare() {
  const { token } = useParams();
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    let cancel = false;
    api
      .publicShare(token)
      .then((data) => {
        if (cancel) return;
        setMeta(data);
        setNeedsPassword(Boolean(data.requires_password));
      })
      .catch((e) => {
        if (!cancel) setError(e.message || 'Share not found');
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [token]);

  const download = async () => {
    if (needsPassword && !password) return;
    setDownloading(true);
    try {
      const res = await fetch(api.publicShareDownloadUrl(token), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(password ? { password } : {}),
        credentials: 'include',
      });

      if (!res.ok) {
        let msg = `Download failed (${res.status})`;
        try {
          const err = await res.json();
          if (err.error) msg = err.error;
        } catch {}
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = meta?.file_name || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#eef2f9] dark:bg-[#060912]">
        <Loader label="Loading share…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#eef2f9] dark:bg-[#060912] p-6">
        <div className="card-static max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-bold mb-2">Share unavailable</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
          <Link to="/" className="btn-primary inline-flex mt-6 px-5 py-2.5">
            ← Back to TeleCloud
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[#eef2f9] dark:bg-[#060912] p-6">
      <div className="card-static max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white text-3xl mx-auto mb-4">
            📦
          </div>
          <h1 className="text-xl font-bold break-all">{meta?.file_name}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Shared via TeleCloud
          </p>
        </div>

        <div className="space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Size</span>
            <span className="font-medium">{formatBytes(meta?.file_size || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Downloads</span>
            <span className="font-medium">{meta?.downloads || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Expires</span>
            <span className="font-medium">
              {meta?.expires_at ? formatDateTime(meta.expires_at) : 'Never'}
            </span>
          </div>
        </div>

        {needsPassword && !downloaded && (
          <div className="mb-4">
            <Input
              label="🔒 Password protected"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && download()}
            />
          </div>
        )}

        {downloaded ? (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center text-sm text-emerald-600 dark:text-emerald-400">
            ✅ Download started!
          </div>
        ) : (
          <Button
            onClick={download}
            loading={downloading}
            disabled={needsPassword && !password}
            className="w-full py-3"
          >
            ⬇️ Download file
          </Button>
        )}

        <p className="mt-6 text-xs text-slate-500 dark:text-slate-400 text-center">
          Powered by{' '}
          <Link to="/" className="link font-medium">
            TeleCloud
          </Link>{' '}
          ☁️
        </p>
      </div>
    </div>
  );
}
