import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getEmployeesApi, deactivateEmployeeApi } from "../../api/employees.api";
import { getDepartmentsApi } from "../../api/departments.api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import { SkeletonTable } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { formatDate } from "../../utils";
import toast from "react-hot-toast";
import { HiPlus, HiSearch, HiPencil, HiTrash, HiUsers, HiFilter } from "react-icons/hi";

export default function Employees() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [confirm, setConfirm] = useState(null);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees", search, dept, status],
    queryFn: () => getEmployeesApi({ search, department: dept, status }).then(r => r.data.data),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartmentsApi().then(r => r.data.data),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => deactivateEmployeeApi(id, { status: "terminated" }),
    onSuccess: () => {
      toast.success("Employee deactivated");
      qc.invalidateQueries(["employees"]);
      setConfirm(null);
    },
    onError: () => toast.error("Failed to deactivate"),
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">All Employees</h2>
          <p className="text-sm text-slate-500">{employees.length} records found</p>
        </div>
        <Button icon={<HiPlus className="w-4 h-4"/>} onClick={() => navigate("/employees/new")}>
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
            <input
              placeholder="Search by name or ID..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            />
          </div>
          <select value={dept} onChange={e => setDept(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-white min-w-[160px]"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-white min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="resigned">Resigned</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Employee","Department","Designation","Joined","Status","Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? <SkeletonTable rows={6}/> :
               employees.length === 0 ? (
                <tr><td colSpan={6}>
                  <EmptyState icon={<HiUsers/>} title="No employees found" description="Try adjusting your filters or add a new employee"/>
                </td></tr>
               ) : employees.map((emp, i) => (
                <motion.tr key={emp._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${emp.firstName} ${emp.lastName}`} src={emp.avatar} size="sm"/>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-xs text-slate-400">{emp.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{emp.department?.name || "�"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{emp.designation}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{formatDate(emp.dateOfJoining)}</td>
                  <td className="px-4 py-3"><Badge status={emp.status}/></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/employees/${emp._id}/edit`)}
                        className="p-1.5 rounded-lg hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-all">
                        <HiPencil className="w-4 h-4"/>
                      </button>
                      <button onClick={() => setConfirm(emp._id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all">
                        <HiTrash className="w-4 h-4"/>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={() => deactivateMutation.mutate(confirm)}
        loading={deactivateMutation.isPending}
        title="Deactivate Employee"
        message="This will terminate the employee account. This action cannot be undone."
      />
    </div>
  );
}
