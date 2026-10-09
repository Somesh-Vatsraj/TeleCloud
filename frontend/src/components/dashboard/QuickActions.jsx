import { Link } from 'react-router-dom';

const actions = [
  { to: '/files', label: 'Upload file', icon: '📤' },
  { to: '/chat', label: 'Ask AI', icon: '🤖' },
  { to: '/folders', label: 'New folder', icon: '📁' },
  { to: '/shares', label: 'Share link', icon: '🔗' },
];

export default function QuickActions() {
  return (
    <div className="card-static p-5">
      <div className="text-sm font-semibold mb-4">Quick actions</div>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center hover:border-blue-500/50 hover:-translate-y-0.5 transition-all"
          >
            <div className="text-2xl mb-1">{a.icon}</div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{a.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
