import { useToast } from '../../hooks/useToast.js';

const styles = {
  success: 'bg-emerald-500/95 text-white',
  error: 'bg-red-500/95 text-white',
  info: 'bg-slate-800/95 text-white dark:bg-slate-700/95',
  warn: 'bg-amber-500/95 text-white',
};

const icons = {
  success: '✅',
  error: '⚠️',
  info: 'ℹ️',
  warn: '⚡',
};

export default function ToastHost() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 px-4 w-full max-w-md pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto w-full rounded-xl px-4 py-3 shadow-lg backdrop-blur flex items-center gap-3 cursor-pointer animate-slide-up ${
            styles[t.type] || styles.info
          }`}
        >
          <span>{icons[t.type] || icons.info}</span>
          <span className="text-sm flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
