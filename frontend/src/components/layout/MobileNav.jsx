import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function MobileNav() {
  const { user } = useAuth();
  const items = [
    { to: '/dashboard', label: 'Home', icon: '🏠' },
    { to: '/files', label: 'Files', icon: '📁' },
    { to: '/chat', label: 'AI', icon: '🤖' },
    { to: '/shares', label: 'Shares', icon: '🔗' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];
  if (user?.is_admin) {
    items[4] = { to: '/admin', label: 'Admin', icon: '🛡️' };
  }
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/70 dark:border-slate-800/70 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2.5 text-[11px] transition-colors ${
                isActive
                  ? 'text-blue-500'
                  : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
