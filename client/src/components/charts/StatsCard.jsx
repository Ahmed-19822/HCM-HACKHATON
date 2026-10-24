import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function StatsCard({ title, value, icon: Icon, color, change, suffix = "" }) {
  const count = useCountUp(Number(value) || 0);
  const colors = {
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-200",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-200",
    amber: "from-amber-500 to-amber-600 shadow-amber-200",
    rose: "from-rose-500 to-rose-600 shadow-rose-200",
    violet: "from-violet-500 to-violet-600 shadow-violet-200",
    blue: "from-blue-500 to-blue-600 shadow-blue-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: "0 20px 40px -8px rgba(0,0,0,0.15)" }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{count}{suffix}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color] || colors.indigo} shadow-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white"/>
        </div>
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          <span>{change >= 0 ? "?" : "?"} {Math.abs(change)}%</span>
          <span className="text-slate-400 font-normal">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
