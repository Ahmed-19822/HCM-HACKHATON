import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import {
  HiViewGrid, HiUsers, HiOfficeBuilding, HiCalendar,
  HiClipboardList, HiCurrencyDollar, HiUser, HiLogout,
  HiChevronLeft, HiChevronRight, HiSparkles,
} from "react-icons/hi";

const navItems = [
  { label: "Dashboard",   icon: HiViewGrid,       path: "/dashboard",   roles: ["admin","hr"] },
  { label: "Employees",   icon: HiUsers,           path: "/employees",   roles: ["admin","hr","employee"] },
  { label: "Departments", icon: HiOfficeBuilding,  path: "/departments", roles: ["admin","hr"] },
  { label: "Attendance",  icon: HiCalendar,        path: "/attendance",  roles: ["admin","hr","employee"] },
  { label: "Leaves",      icon: HiClipboardList,   path: "/leaves",      roles: ["admin","hr","employee"] },
  { label: "Payroll",     icon: HiCurrencyDollar,  path: "/payroll",     roles: ["admin","hr","employee"] },
  { label: "Profile",     icon: HiUser,            path: "/profile",     roles: ["admin","hr","employee"] },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen = false, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <motion.aside
      animate={{ width: collapsed && !mobileOpen ? 72 : 240 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={`fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col z-40 overflow-hidden border-r border-slate-800
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} transition-transform duration-300`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800 min-h-[68px]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
          <HiSparkles className="w-5 h-5 text-white"/>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="font-bold text-white text-sm leading-tight whitespace-nowrap">
                {import.meta.env.VITE_APP_NAME || "HCM Lite"}
              </span>
              <span className="text-xs text-slate-400 whitespace-nowrap">HR Management</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavLink key={item.path} to={item.path} onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
              ${isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : ""}`}/>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-slate-800 p-3 space-y-1">
        <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
          <Avatar name={user?.name || "User"} size="sm"/>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} className="overflow-hidden"
              >
                <p className="text-sm font-medium text-white whitespace-nowrap leading-tight">{user?.name}</p>
                <p className="text-xs text-slate-400 whitespace-nowrap capitalize">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
        >
          <HiLogout className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform"/>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} className="text-sm font-medium whitespace-nowrap"
              >Logout</motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-lg"
      >
        {collapsed ? <HiChevronRight className="w-4 h-4"/> : <HiChevronLeft className="w-4 h-4"/>}
      </motion.button>
    </motion.aside>
  );
}
