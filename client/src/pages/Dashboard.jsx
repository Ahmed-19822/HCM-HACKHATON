import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getDashboardStatsApi } from "../api/dashboard.api";
import StatsCard from "../components/charts/StatsCard";
import Card from "../components/ui/Card";
import { SkeletonCard } from "../components/ui/Skeleton";
import { formatDate } from "../utils";
import Badge from "../components/ui/Badge";
import {
  HiUsers, HiCalendar, HiClipboardList, HiOfficeBuilding,
  HiUserGroup, HiTrendingUp,
} from "react-icons/hi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];

const container = { hidden:{}, visible:{ transition:{ staggerChildren:0.08 } } };
const item = { hidden:{ opacity:0, y:20 }, visible:{ opacity:1, y:0 } };

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboardStatsApi().then(r => r.data.data),
    refetchInterval: 30000,
  });

  const stats = data || {};

  const pieData = (stats.departmentBreakdown || []).map((d, i) => ({
    name: d.name, value: d.count, color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <motion.div
        variants={container} initial="hidden" animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <motion.div key={i} variants={item}><SkeletonCard/></motion.div>
          ))
        ) : (
          <>
            <motion.div variants={item}>
              <StatsCard title="Total Employees" value={stats.totalEmployees || 0} icon={HiUsers} color="indigo"/>
            </motion.div>
            <motion.div variants={item}>
              <StatsCard title="Present Today" value={stats.presentToday || 0} icon={HiCalendar} color="emerald"/>
            </motion.div>
            <motion.div variants={item}>
              <StatsCard title="Pending Leaves" value={stats.pendingLeaves || 0} icon={HiClipboardList} color="amber"/>
            </motion.div>
            <motion.div variants={item}>
              <StatsCard title="Departments" value={stats.totalDepartments || 0} icon={HiOfficeBuilding} color="violet"/>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Absent + Active Row */}
      <motion.div variants={container} initial="hidden" animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <motion.div variants={item}>
          <StatsCard title="Absent Today" value={stats.absentToday || 0} icon={HiUserGroup} color="rose"/>
        </motion.div>
        <motion.div variants={item}>
          <StatsCard title="Active Employees" value={stats.activeEmployees || 0} icon={HiTrendingUp} color="blue"/>
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-700 mb-5 flex items-center gap-2">
            <HiOfficeBuilding className="text-indigo-500"/> Department Headcount
          </h3>
          {isLoading ? (
            <div className="h-52 bg-slate-100 rounded-xl animate-pulse"/>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.departmentBreakdown || []} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }}/>
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} allowDecimals={false}/>
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}/>
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Pie Chart */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-700 mb-5 flex items-center gap-2">
            <HiUsers className="text-indigo-500"/> Department Distribution
          </h3>
          {isLoading ? (
            <div className="h-52 bg-slate-100 rounded-xl animate-pulse"/>
          ) : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={3} dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color}/>
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}/>
                <Legend iconType="circle" iconSize={8}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </Card>
      </div>

      {/* Recent Hires */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <HiUsers className="text-indigo-500"/> Recent Hires
        </h3>
        {isLoading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse"/>
            ))}
          </div>
        ) : (stats.recentHires || []).length === 0 ? (
          <p className="text-slate-400 text-sm">No employees yet</p>
        ) : (
          <div className="space-y-2">
            {(stats.recentHires || []).map((emp, i) => (
              <motion.div key={emp._id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-xs text-slate-400">{emp.designation} — {emp.department?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{formatDate(emp.createdAt)}</p>
                  <Badge status="active"/>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
