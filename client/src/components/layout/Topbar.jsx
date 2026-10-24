import { motion } from "framer-motion";
import { HiBell, HiSearch, HiMenu } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import { useLocation } from "react-router-dom";

const titles = {
  "/dashboard": "Dashboard",
  "/employees": "Employees",
  "/departments": "Departments",
  "/attendance": "Attendance",
  "/leaves": "Leave Management",
  "/payroll": "Payroll",
  "/profile": "My Profile",
};

export default function Topbar({ onMenu }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const title = Object.entries(titles).find(([k]) => pathname.startsWith(k))?.[1] || "HCM Lite";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-[68px] bg-white/80 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenu}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
          aria-label="Open menu"
        >
          <HiMenu className="w-5 h-5"/>
        </button>
        <div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-400">
          {new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
          <input
            placeholder="Quick search..."
            className="pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 outline-none w-52 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
          />
        </div>
        <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
          <HiBell className="w-5 h-5"/>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"/>
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <Avatar name={user?.name || ""} size="sm"/>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
