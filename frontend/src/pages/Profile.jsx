import { useState } from 'react';
import { api } from '../api/index.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (password) payload.password = password;
      const data = await api.updateProfile(payload);
      updateUser(data.user);
      setPassword('');
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const detect = async () => {
    setDetecting(true);
    try {
      const data = await api.detectChatId();
      updateUser({ chat_id: data.chat_id });
      toast.success(`Chat ID ${data.chat_id} detected!`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDetecting(false);
    }
  };

  const changeTheme = (t) => {
    setTheme(t);
    api.updateProfile({ theme: t }).then((d) => updateUser(d.user)).catch(() => {});
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account, bot link and theme.
        </p>
      </div>

      <div className="card-static p-6 space-y-5">
        <div className="flex items-center gap-4">
          {form.avatar ? (
            <img src={form.avatar} alt="avatar" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-2xl text-white font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <div className="font-semibold">{user?.name}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</div>
          </div>
        </div>

        <Input label="Name" value={form.name} onChange={update('name')} />
        <Input label="Avatar URL" value={form.avatar} onChange={update('avatar')} placeholder="https://…" />
        <Input label="Bio" textarea rows={3} value={form.bio} onChange={update('bio')} />
        <Input
          label="New password (leave blank to keep current)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <div className="flex justify-end">
          <Button loading={saving} onClick={save}>Save changes</Button>
        </div>
      </div>

      <div className="card-static p-6">
        <div className="font-semibold mb-3">Telegram Bot</div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Your username: <span className="font-mono text-slate-700 dark:text-slate-300">
            {user?.tg_username ? `@${user.tg_username}` : 'not set'}
          </span>
          <br />
          Chat ID: <span className="font-mono text-slate-700 dark:text-slate-300">{user?.chat_id || 'not linked'}</span>
        </div>
        <Button variant="ghost" onClick={detect} loading={detecting}>
          📡 Detect Chat ID
        </Button>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          Send <span className="font-mono">/start</span> to the bot on Telegram first, then click Detect.
        </p>
      </div>

      <div className="card-static p-6">
        <div className="font-semibold mb-3">Appearance</div>
        <div className="flex gap-3">
          <button
            onClick={() => changeTheme('dark')}
            className={`flex-1 rounded-xl border p-4 text-center transition ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="text-2xl mb-1">🌙</div>
            <div className="text-sm font-medium">Dark</div>
          </button>
          <button
            onClick={() => changeTheme('light')}
            className={`flex-1 rounded-xl border p-4 text-center transition ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="text-2xl mb-1">☀️</div>
            <div className="text-sm font-medium">Light</div>
          </button>
        </div>
      </div>
    </div>
  );
}
