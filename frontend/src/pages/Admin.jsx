import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api/index.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import { formatBytes, formatDate } from '../utils/format.js';

export default function Admin() {
  const { user } = useAuth();
  const toast = useToast();
  const [botToken, setBotToken] = useState('');
  const [botInfo, setBotInfo] = useState(null);
  const [users, setUsers] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) return;
    Promise.all([api.botInfo(), api.adminUsers()])
      .then(([b, a]) => {
        setBotInfo(b);
        setUsers(a.users || []);
        setTotals(a.totals);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [user, toast]);

  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;
  if (loading) return <Loader full />;

  const saveToken = async () => {
    if (!botToken.trim()) return toast.error('Enter a token');
    setSaving(true);
    try {
      const data = await api.setBotToken(botToken.trim());
      toast.success(`Bot linked: @${data.bot_username}`);
      setBotToken('');
      const b = await api.botInfo();
      setBotInfo(b);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Admin panel</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure the shared bot and inspect users.
        </p>
      </div>

      <div className="card-static p-6">
        <div className="font-semibold mb-3">Telegram Bot</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Current: {botInfo?.ready ? `@${botInfo.bot_username}` : 'not configured'}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Input
            className="flex-1 min-w-[240px]"
            placeholder="123456:ABC-DEF…"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
          />
          <Button loading={saving} onClick={saveToken}>Save token</Button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          Get a token from <a className="link" href="https://t.me/BotFather" target="_blank" rel="noreferrer">@BotFather</a>.
        </p>
      </div>

      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card-static p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Users</div>
            <div className="text-xl font-bold">{totals.users}</div>
          </div>
          <div className="card-static p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Files</div>
            <div className="text-xl font-bold">{totals.files}</div>
          </div>
          <div className="card-static p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Storage</div>
            <div className="text-xl font-bold">{formatBytes(totals.size)}</div>
          </div>
          <div className="card-static p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Shares</div>
            <div className="text-xl font-bold">{totals.shares}</div>
          </div>
        </div>
      )}

      <div className="card-static overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-semibold">
          All users ({users.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100/60 dark:bg-slate-900/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Telegram</th>
                <th className="px-4 py-3 font-medium">Files</th>
                <th className="px-4 py-3 font-medium">Storage</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.id}</td>
                  <td className="px-4 py-3">
                    {u.name} {u.is_admin ? <span className="badge bg-amber-500/20 text-amber-500 ml-1">admin</span> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {u.tg_username ? `@${u.tg_username}` : '—'}
                    {u.chat_id ? ' ✓' : ''}
                  </td>
                  <td className="px-4 py-3">{u.file_count}</td>
                  <td className="px-4 py-3">{formatBytes(u.total_size)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
