export default function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800
          bg-white outline-none transition-all duration-200
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          ${error ? "border-red-400" : "border-slate-200"} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
