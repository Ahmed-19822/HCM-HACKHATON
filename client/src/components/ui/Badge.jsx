import { capitalize } from "../../utils";

export default function Badge({ status, label }) {
  const map = {
    active:"bg-emerald-100 text-emerald-700 ring-emerald-500/20",
    resigned:"bg-amber-100 text-amber-700 ring-amber-500/20",
    terminated:"bg-red-100 text-red-700 ring-red-500/20",
    present:"bg-emerald-100 text-emerald-700 ring-emerald-500/20",
    absent:"bg-red-100 text-red-700 ring-red-500/20",
    late:"bg-amber-100 text-amber-700 ring-amber-500/20",
    "half-day":"bg-blue-100 text-blue-700 ring-blue-500/20",
    pending:"bg-amber-100 text-amber-700 ring-amber-500/20",
    approved:"bg-emerald-100 text-emerald-700 ring-emerald-500/20",
    rejected:"bg-red-100 text-red-700 ring-red-500/20",
    paid:"bg-emerald-100 text-emerald-700 ring-emerald-500/20",
    draft:"bg-slate-100 text-slate-600 ring-slate-500/20",
  };
  const cls = map[status] || "bg-slate-100 text-slate-600 ring-slate-500/20";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${cls}`}>
      {label || capitalize(status)}
    </span>
  );
}
