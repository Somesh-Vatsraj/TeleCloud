export default function Loader({ label = 'Loading…', full = false, size = 'md' }) {
  const s = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  const content = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${s} rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin`}
      />
      {label && <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
  if (full) return <div className="min-h-[50vh] grid place-items-center">{content}</div>;
  return content;
}

export function Skeleton({ className = '' }) {
  return <div className={`rounded-xl shimmer ${className}`} />;
}
