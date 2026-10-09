import { useEffect, useState } from 'react';
import { api } from '../../api/index.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function BotStatus() {
  const { user } = useAuth();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    api.botInfo().then(setInfo).catch(() => {});
  }, []);

  const ready = info?.ready && user?.chat_id;
  const tone = ready
    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
    : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400';

  return (
    <div className={`card-static p-5 border ${tone}`}>
      <div className="flex items-start gap-3">
        <div className="text-3xl">{ready ? '🟢' : '🟡'}</div>
        <div className="flex-1">
          <div className="text-sm font-semibold">
            {ready ? 'Bot connected' : 'Setup required'}
          </div>
          <div className="text-xs mt-1 opacity-90">
            {!info?.ready
              ? 'Admin must configure the bot token.'
              : !user?.chat_id
              ? 'Go to Profile → Detect Chat ID to finish setup.'
              : `Linked to @${info.bot_username} · chat ${user.chat_id}`}
          </div>
        </div>
      </div>
    </div>
  );
}
