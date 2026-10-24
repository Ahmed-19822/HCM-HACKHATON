export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <input
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800
          bg-white placeholder:text-slate-400 outline-none transition-all duration-200
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          ${error ? "border-red-400 focus:ring-red-400" : "border-slate-200"}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
