import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { validEmail } from '../utils/validators.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!validEmail(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      nav(loc.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#eef2f9] dark:bg-[#060912]">
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-purple-600 p-10 text-white relative overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl animate-float">☁️</div>
        <div className="absolute bottom-16 right-10 text-6xl animate-float" style={{ animationDelay: '1.5s' }}>🤖</div>
        <h1 className="text-4xl font-bold text-center relative z-10">Welcome back to TeleCloud</h1>
        <p className="mt-4 opacity-90 text-center max-w-sm relative z-10">
          Pick up where you left off — your files are waiting on Telegram.
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white">☁️</div>
            <span className="font-bold text-lg">TeleCloud</span>
          </Link>
          <h2 className="text-2xl font-bold">Sign in</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Enter your credentials to continue.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />
            <Button type="submit" loading={loading} className="w-full py-3">
              Sign in
            </Button>
          </form>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 text-center">
            No account? <Link className="link" to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
