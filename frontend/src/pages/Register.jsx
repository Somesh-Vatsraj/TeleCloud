import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { validEmail, validUsername, validName, strongEnough } from '../utils/validators.js';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', tg_username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!validName(form.name)) errs.name = 'At least 2 characters';
    if (!validEmail(form.email)) errs.email = 'Invalid email';
    if (!validUsername(form.tg_username)) errs.tg_username = '4-32 chars (letters, digits, _)';
    if (!strongEnough(form.password)) errs.password = 'Min 6 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        tg_username: form.tg_username.trim().replace(/^@/, ''),
        password: form.password,
      });
      toast.success('Account created!');
      nav('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#eef2f9] dark:bg-[#060912]">
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-purple-600 to-blue-500 p-10 text-white relative overflow-hidden">
        <div className="absolute top-10 right-10 text-6xl animate-float">📁</div>
        <div className="absolute bottom-16 left-10 text-6xl animate-float" style={{ animationDelay: '1.5s' }}>🔗</div>
        <h1 className="text-4xl font-bold text-center relative z-10">Join TeleCloud</h1>
        <p className="mt-4 opacity-90 text-center max-w-sm relative z-10">
          Free cloud storage on top of Telegram. Sign up in seconds.
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white">☁️</div>
            <span className="font-bold text-lg">TeleCloud</span>
          </Link>
          <h2 className="text-2xl font-bold">Create account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            It only takes a minute.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <Input label="Name" placeholder="Jane Doe" value={form.name} onChange={update('name')} error={errors.name} />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} error={errors.email} />
            <Input
              label="Telegram username"
              placeholder="@yourhandle"
              value={form.tg_username}
              onChange={update('tg_username')}
              error={errors.tg_username}
              hint="Used to detect your chat ID after you message the bot."
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={update('password')}
              error={errors.password}
            />
            <Button type="submit" loading={loading} className="w-full py-3">
              Create account
            </Button>
          </form>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 text-center">
            Already a member? <Link className="link" to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
