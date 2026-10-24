import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getLeavesApi, applyLeaveApi, updateLeaveStatusApi, cancelLeaveApi } from "../../api/leaves.api";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { SkeletonTable } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate, capitalize } from "../../utils";
import { HiPlus, HiCheck, HiX, HiClipboardList } from "react-icons/hi";

export default function Leaves() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isHR = ["admin","hr"].includes(user?.role);
  const [applyModal, setApplyModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [cancelId, setCancelId] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [form, setForm] = useState({ leaveType: "casual", startDate: "", endDate: "", reason: "" });
  const [approverComment, setApproverComment] = useState("");

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ["leaves", statusFilter],
    queryFn: () => getLeavesApi({ status: statusFilter }).then(r => r.data.data),
  });

  const applyMutation = useMutation({
    mutationFn: applyLeaveApi,
    onSuccess: () => { toast.success("Leave applied!"); qc.invalidateQueries(["leaves"]); setApplyModal(false); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, approverComment }) => updateLeaveStatusApi(id, { status, approverComment }),
    onSuccess: () => { toast.success("Leave updated"); qc.invalidateQueries(["leaves"]); setRejectId(null); },
    onError: () => toast.error("Failed to update"),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelLeaveApi,
    onSuccess: () => { toast.success("Leave cancelled"); qc.invalidateQueries(["leaves"]); setCancelId(null); },
    onError: () => toast.error("Failed to cancel"),
  });

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Leave Management</h2>
          <p className="text-sm text-slate-500">{leaves.length} records</p>
        </div>
        <div className="flex gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          {!isHR && (
            <Button icon={<HiPlus className="w-4 h-4"/>} onClick={() => setApplyModal(true)}>Apply Leave</Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Employee","Type","Start","End","Days","Status","Reason",isHR?"Actions":""].filter(Boolean).map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? <SkeletonTable rows={5}/> :
               leaves.length === 0 ? (
                <tr><td colSpan={8}>
                  <EmptyState icon={<HiClipboardList/>} title="No leave records" description="No leaves found for the selected filter"/>
                </td></tr>
               ) : leaves.map((lv, i) => (
                <motion.tr key={lv._id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">
                    {lv.employee?.firstName} {lv.employee?.lastName}
                    <span className="block text-xs text-slate-400">{lv.employee?.employeeId}</span>
                  </td>
                  <td className="px-4 py-3"><Badge status={lv.leaveType} label={capitalize(lv.leaveType)}/></td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatDate(lv.startDate)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatDate(lv.endDate)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-700">{lv.totalDays}</td>
                  <td className="px-4 py-3"><Badge status={lv.status}/></td>
                  <td className="px-4 py-3 text-sm text-slate-500 max-w-[180px] truncate">{lv.reason}</td>
                  {isHR && (
                    <td className="px-4 py-3">
                      {lv.status === "pending" && (
                        <div className="flex gap-1">
                          <button onClick={() => statusMutation.mutate({ id: lv._id, status: "approved" })}
                            className="p-1.5 rounded-lg hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 transition-all">
                            <HiCheck className="w-4 h-4"/>
                          </button>
                          <button onClick={() => setRejectId(lv._id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all">
                            <HiX className="w-4 h-4"/>
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                  {!isHR && lv.status === "pending" && (
                    <td className="px-4 py-3">
                      <button onClick={() => setCancelId(lv._id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Cancel</button>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Apply Leave Modal */}
      <Modal open={applyModal} onClose={() => setApplyModal(false)} title="Apply for Leave" size="sm">
        <form onSubmit={e => { e.preventDefault(); applyMutation.mutate(form); }} className="space-y-4">
          <Select label="Leave Type" value={form.leaveType} onChange={set("leaveType")}>
            <option value="casual">Casual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="annual">Annual Leave</option>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.startDate} onChange={set("startDate")} required/>
            <Input label="End Date" type="date" value={form.endDate} onChange={set("endDate")} required/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Reason*</label>
            <textarea rows={3} required placeholder="Reason for leave..."
              value={form.reason} onChange={e => setForm(p => ({...p, reason: e.target.value}))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"/>
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={applyMutation.isPending}>Apply</Button>
            <Button variant="secondary" type="button" onClick={() => setApplyModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!rejectId} onClose={() => setRejectId(null)} title="Reject Leave" size="sm">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Reason for rejection</label>
            <textarea rows={3} placeholder="Optional comment..."
              value={approverComment} onChange={e => setApproverComment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-red-400 resize-none transition-all"/>
          </div>
          <div className="flex gap-3">
            <Button variant="danger" onClick={() => statusMutation.mutate({ id: rejectId, status: "rejected", approverComment })} loading={statusMutation.isPending}>Reject</Button>
            <Button variant="secondary" onClick={() => setRejectId(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!cancelId} onClose={() => setCancelId(null)}
        onConfirm={() => cancelMutation.mutate(cancelId)} loading={cancelMutation.isPending}
        title="Cancel Leave" message="Cancel this leave request?"/>
    </div>
  );
}
