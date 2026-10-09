import { useEffect, useState } from 'react';
import { api } from '../api/index.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import StorageChart from '../components/dashboard/StorageChart.jsx';
import QuickActions from '../components/dashboard/QuickActions.jsx';
import BotStatus from '../components/dashboard/BotStatus.jsx';
import Loader from '../components/common/Loader.jsx';
import { formatBytes } from '../utils/format.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api
      .stats()
      .then(setStats)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <Loader full label="Loading dashboard…" />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Hello, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Here's what's happening in your cloud today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📁" label="Total files" value={stats.totalFiles} accent="blue" />
        <StatCard icon="💾" label="Storage used" value={formatBytes(stats.totalSize)} accent="purple" />
        <StatCard icon="🔗" label="Active shares" value={stats.totalShares} accent="emerald" />
        <StatCard icon="⭐" label="Starred" value={stats.starred} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <StorageChart byType={stats.byType || []} />
          <BotStatus />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      <div className="card-static p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-sm">Recent uploads</div>
          <a href="/files" className="text-xs link">View all →</a>
        </div>
        {!stats.recent?.length ? (
          <div className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
            No uploads yet — start by adding a file!
          </div>
        ) : (
          <div className="space-y-2">
            {stats.recent.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5">
                <div className="min-w-0 flex-1 text-sm font-medium truncate">{f.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 ml-3">{formatBytes(f.size)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
