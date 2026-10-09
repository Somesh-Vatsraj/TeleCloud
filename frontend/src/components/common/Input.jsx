export default function Input({ label, error, className = '', textarea = false, ...rest }) {
  const Comp = textarea ? 'textarea' : 'input';
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <Comp className="input" {...rest} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
