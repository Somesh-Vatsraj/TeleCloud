import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../context/ThemeContext.js';
import Button from '../common/Button.jsx';

export function useThemeSafe() {
  return useTheme();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const [menu, setMenu] = useState(false);

  const onLogout = async () => {
    await logout();
    nav('/');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 md:px-8 h-16">
        <div className="md:hidden flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white text-sm">
            ☁️
          </div>
          <span className="font-bold">TeleCloud</span>
        </div>

        <div className="hidden md:block">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back, <span className="font-medium text-slate-900 dark:text-white">{user?.name}</span> 👋
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 grid place-items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <div className="relative">
            <button
              onClick={() => setMenu((m) => !m)}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white font-semibold"
              aria-label="User menu"
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <div className="absolute right-0 mt-2 w-52 card-static p-2 z-20 animate-pop">
                  <Link
                    to="/profile"
                    onClick={() => setMenu(false)}
                    className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    👤 Profile
                  </Link>
                  <Link
                    to="/activity"
                    onClick={() => setMenu(false)}
                    className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    📊 Activity
                  </Link>
                  <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10"
                  >
                    🚪 Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
