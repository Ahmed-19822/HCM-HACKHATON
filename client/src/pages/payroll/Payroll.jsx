import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getPayrollsApi, generatePayrollApi, markPaidApi } from "../../api/payroll.api";
import { getEmployeesApi } from "../../api/employees.api";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { SkeletonTable } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { formatCurrency } from "../../utils";
import { HiPlus, HiCurrencyDollar, HiCheckCircle } from "react-icons/hi";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Payroll() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isHR = ["admin","hr"].includes(user?.role);
  const [modal, setModal] = useState(false);
  const [year, setYear]   = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [form, setForm]   = useState({ employeeId:"", month:"", year:"", workingDays:26, bonuses:0, deductions:0 });

  const { data: payrolls=[], isLoading } = useQuery({
    queryKey:["payrolls", month, year],
    queryFn: ()=> getPayrollsApi({ month, year }).then(r=>r.data.data),
  });

  const { data: employees=[] } = useQuery({
    queryKey:["employees"],
    queryFn: ()=> getEmployeesApi({ status:"active" }).then(r=>r.data.data),
    enabled: isHR,
  });

  const generateMutation = useMutation({
    mutationFn: generatePayrollApi,
    onSuccess: ()=>{ toast.success("Payroll generated"); qc.invalidateQueries({ queryKey: ["payrolls"] }); setModal(false); },
    onError: (e)=> toast.error(e.response?.data?.message || "Failed"),
  });

  const paidMutation = useMutation({
    mutationFn: markPaidApi,
    onSuccess: ()=>{ toast.success("Marked as paid"); qc.invalidateQueries({ queryKey: ["payrolls"] }); },
    onError: ()=> toast.error("Failed"),
  });

  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Payroll</h2>
          <p className="text-sm text-slate-500">{payrolls.length} records</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <select value={month} onChange={e=>setMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-400">
            {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e=>setYear(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-400">
            {[2024,2025,2026,2027].map(y=><option key={y}>{y}</option>)}
          </select>
          {isHR && (
            <Button icon={<HiPlus className="w-4 h-4"/>} onClick={()=>setModal(true)}>Generate</Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Employee","Period","Basic","Present","Net Salary","Status","Actions"].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? <SkeletonTable rows={5} cols={7}/> :
               payrolls.length===0 ? (
                <tr><td colSpan={7}>
                  <EmptyState icon={<HiCurrencyDollar/>} title="No payroll records" description="Generate payroll for the selected month"/>
                </td></tr>
               ) : payrolls.map((p,i)=>(
                <motion.tr key={p._id}
                  initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-slate-700">{p.employee?.firstName} {p.employee?.lastName}</p>
                    <p className="text-xs text-slate-400">{p.employee?.employeeId}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{MONTHS[p.month-1]} {p.year}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatCurrency(p.basicSalary)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.presentDays}/{p.workingDays}</td>
                  <td className="px-4 py-3 text-sm font-bold text-indigo-600">{formatCurrency(p.netSalary)}</td>
                  <td className="px-4 py-3"><Badge status={p.status}/></td>
                  <td className="px-4 py-3">
                    {isHR && p.status==="draft" && (
                      <button onClick={()=>paidMutation.mutate(p._id)}
                        className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                        <HiCheckCircle className="w-4 h-4"/> Mark Paid
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Generate Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title="Generate Payroll" size="sm">
        <form onSubmit={e=>{e.preventDefault();generateMutation.mutate(form)}} className="space-y-4">
          <Select label="Employee*" value={form.employeeId} onChange={set("employeeId")} required>
            <option value="">Select employee</option>
            {employees.map(e=>(
              <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Month*" value={form.month} onChange={set("month")} required>
              <option value="">Month</option>
              {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
            </Select>
            <Select label="Year*" value={form.year} onChange={set("year")} required>
              <option value="">Year</option>
              {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
          <Input label="Working Days" type="number" value={form.workingDays} onChange={set("workingDays")} min={1} max={31}/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Bonuses (PKR)" type="number" value={form.bonuses} onChange={set("bonuses")} min={0}/>
            <Input label="Deductions (PKR)" type="number" value={form.deductions} onChange={set("deductions")} min={0}/>
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={generateMutation.isPending}>Generate</Button>
            <Button variant="secondary" type="button" onClick={()=>setModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
