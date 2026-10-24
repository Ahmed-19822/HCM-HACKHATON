import { useState } from "react";
import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const sideW = collapsed ? 72 : 240;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed}/>
      <motion.div
        animate={{ marginLeft: sideW }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="flex-1 flex flex-col min-h-screen"
      >
        <Topbar/>
        <main className="flex-1 p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet/>
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}
