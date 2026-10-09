import { useEffect, useState } from 'react';
import { api } from '../api/index.js';
import { useToast } from '../hooks/useToast.js';
import Loader from '../components/common/Loader.jsx';
import { ACTION_ICONS } from '../utils/constants.js';
import { relativeTime } from '../utils/format.js';

export default function Activity() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api
      .listActivities()
      .then((d) => setItems(d.activities || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <Loader full />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Activity</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your last 30 actions in TeleCloud.
        </p>
      </div>

      {!items.length ? (
        <div className="card-static p-10 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-slate-500 dark:text-slate-400">No activity yet.</p>
        </div>
      ) : (
        <div className="card-static divide-y divide-slate-200 dark:divide-slate-800">
          {items.map((a) => (
            <div key={a.id} className="flex items-start gap-3 p-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 grid place-items-center text-lg flex-shrink-0">
                {ACTION_ICONS[a.action] || '•'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">
                  {a.detail || a.action}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {relativeTime(a.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
