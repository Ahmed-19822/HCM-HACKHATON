import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { checkInApi, checkOutApi, getAttendanceApi, getTodaySummaryApi } from "../../api/attendance.api";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatsCard from "../../components/charts/StatsCard";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { formatDate, formatDateTime } from "../../utils";
import { HiCalendar, HiClock, HiUsers, HiUserGroup } from "react-icons/hi";

export default function Attendance() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isHR = ["admin","hr"].includes(user?.role);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);

  const { data: summary } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: () => getTodaySummaryApi().then(r => r.data.data),
    enabled: isHR,
    refetchInterval: 60000,
  });

  const { data: log = [], isLoading } = useQuery({
    queryKey: ["attendance-log", dateFilter],
    queryFn: () => getAttendanceApi({ startDate: dateFilter, endDate: dateFilter }).then(r => r.data.data),
  });

  const checkInMutation = useMutation({
    mutationFn: checkInApi,
    onSuccess: () => {
      toast.success("Checked in successfully!");
      qc.invalidateQueries({ queryKey: ["attendance-log"] });
      qc.invalidateQueries({ queryKey: ["attendance-today"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Check-in failed"),
  });

  const checkOutMutation = useMutation({
    mutationFn: checkOutApi,
    onSuccess: () => {
      toast.success("Checked out successfully!");
      qc.invalidateQueries({ queryKey: ["attendance-log"] });
      qc.invalidateQueries({ queryKey: ["attendance-today"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Check-out failed"),
  });

  return (
    <div className="space-y-6">
      {/* Quick Actions (Employee) */}
      {!isHR && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-700 mb-5">Today's Attendance</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <p className="text-xs text-emerald-600 font-medium mb-1">Current Time</p>
              <p className="text-2xl font-bold text-emerald-700">{new Date().toLocaleTimeString()}</p>
            </div>
            <div className="flex gap-3">
              <Button icon={<HiClock className="w-4 h-4"/>} onClick={() => checkInMutation.mutate()} loading={checkInMutation.isPending}>
                Check In
              </Button>
              <Button variant="outline" icon={<HiClock className="w-4 h-4"/>} onClick={() => checkOutMutation.mutate()} loading={checkOutMutation.isPending}>
                Check Out
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Cards (HR/Admin) */}
      {isHR && summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Active" value={summary.totalEmployees || 0} icon={HiUsers} color="indigo"/>
          <StatsCard title="Present" value={summary.present || 0} icon={HiCalendar} color="emerald"/>
          <StatsCard title="Absent" value={summary.absent || 0} icon={HiUserGroup} color="rose"/>
          <StatsCard title="Late" value={summary.late || 0} icon={HiClock} color="amber"/>
        </div>
      )}

      {/* Log Table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h3 className="font-semibold text-slate-700">Attendance Log</h3>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all"/>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Employee","Date","Check In","Check Out","Status","Notes"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? <SkeletonTable rows={5} cols={6}/> :
               log.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400 text-sm">No attendance records for this date</td></tr>
               ) : log.map((r, i) => (
                <motion.tr key={r._id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">
                    {r.employee?.firstName} {r.employee?.lastName}
                    <span className="block text-xs text-slate-400">{r.employee?.employeeId}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "—"}</td>
                  <td className="px-4 py-3"><Badge status={r.status}/></td>
                  <td className="px-4 py-3 text-sm text-slate-500">{r.notes || "—"}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
