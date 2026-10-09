import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { APP_NAME } from '../../utils/constants.js';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/files', label: 'Files', icon: '📁' },
  { to: '/folders', label: 'Folders', icon: '🗂️' },
  { to: '/shares', label: 'Shares', icon: '🔗' },
  { to: '/chat', label: 'AI Chat', icon: '🤖' },
  { to: '/activity', label: 'Activity', icon: '📊' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-[260px] flex-col border-r border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl z-30">
      <Link to="/dashboard" className="flex items-center gap-3 px-6 py-5 border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white text-lg">
          ☁️
        </div>
        <div>
          <div className="font-bold text-slate-900 dark:text-white">{APP_NAME}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Cloud on Telegram</div>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {user?.is_admin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`
            }
          >
            <span className="text-lg">🛡️</span>
            Admin
          </NavLink>
        )}
      </nav>

      <div className="p-3 border-t border-slate-200/70 dark:border-slate-800/70">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/50">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate text-slate-900 dark:text-white">
              {user?.name}
            </div>
            <div className="text-xs truncate text-slate-500 dark:text-slate-400">
              {user?.email}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
