export default function StatCard({ icon, label, value, accent = 'blue', hint }) {
  const accents = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-fuchsia-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`h-10 w-10 rounded-xl bg-gradient-to-br ${accents[accent]} grid place-items-center text-white text-lg`}
        >
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
      {hint && <div className="text-[10px] text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}
