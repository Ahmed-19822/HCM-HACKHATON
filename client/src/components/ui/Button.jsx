import { motion } from "framer-motion";

const variants = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700",
  danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30",
  ghost: "hover:bg-slate-100 text-slate-600",
  success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30",
  outline: "border border-indigo-500 text-indigo-600 hover:bg-indigo-50",
};
const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children, variant = "primary", size = "md",
  className = "", loading = false, icon, ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      className={`inline-flex items-center gap-2 font-medium rounded-xl transition-all
        duration-200 disabled:opacity-60 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      ) : icon}
      {children}
    </motion.button>
  );
}
