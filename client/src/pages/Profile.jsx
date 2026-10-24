import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { changePasswordApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import { formatDate, formatCurrency } from "../utils";
import { HiUser, HiLockClosed, HiMail, HiPhone, HiOfficeBuilding, HiCalendar } from "react-icons/hi";

export default function Profile() {
  const { user } = useAuth();
  const emp = user?.employee;
  const [pwForm, setPwForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [showPw, setShowPw] = useState(false);

  const changePwMutation = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: ()=>{ toast.success("Password changed successfully!"); setPwForm({currentPassword:"",newPassword:"",confirmPassword:""}); },
    onError: e=> toast.error(e.response?.data?.message || "Failed"),
  });

  const handlePwSubmit = e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("Passwords don't match");
    if (pwForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    changePwMutation.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
  };

  const setPw = k => e => setPwForm(p=>({...p,[k]:e.target.value}));

  const infoItems = [
    { icon: HiMail, label:"Email", value: user?.email },
    { icon: HiUser, label:"Role", value: <Badge status={user?.role} label={user?.role?.toUpperCase()}/> },
    ...(emp ? [
      { icon: HiUser, label:"Employee ID", value: emp.employeeId },
      { icon: HiOfficeBuilding, label:"Department", value: emp.department?.name },
      { icon: HiUser, label:"Designation", value: emp.designation },
      { icon: HiPhone, label:"Phone", value: emp.phone || "�" },
      { icon: HiCalendar, label:"Joined", value: formatDate(emp.dateOfJoining) },
      { icon: HiUser, label:"Status", value: <Badge status={emp.status}/> },
    ] : []),
  ];

  const leaveBalance = emp?.leaveBalance;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Avatar name={user?.name || ""} size="xl"/>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
            <p className="text-slate-500 text-sm mb-3">{emp?.designation || user?.role}</p>
            <Badge status={user?.role} label={user?.role?.toUpperCase()}/>
          </div>
        </div>
      </Card>

      {/* Info Grid */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-700 mb-5 flex items-center gap-2">
          <HiUser className="text-indigo-500"/> Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {infoItems.map((item,i)=>(
            <motion.div key={i}
              initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-indigo-600"/>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                <p className="text-sm font-semibold text-slate-700">{item.value || "�"}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Leave Balance */}
      {leaveBalance && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-700 mb-5 flex items-center gap-2">
            <HiCalendar className="text-indigo-500"/> Leave Balance
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label:"Casual", value: leaveBalance.casual, color:"bg-indigo-500" },
              { label:"Sick", value: leaveBalance.sick, color:"bg-amber-500" },
              { label:"Annual", value: leaveBalance.annual, color:"bg-emerald-500" },
            ].map(b=>(
              <div key={b.label} className="text-center p-4 bg-slate-50 rounded-2xl">
                <div className={`w-12 h-12 ${b.color} rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                  <span className="text-white font-bold text-lg">{b.value}</span>
                </div>
                <p className="text-sm font-medium text-slate-600">{b.label}</p>
                <p className="text-xs text-slate-400">days left</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Change Password */}
      <Card className="p-6">
        <button onClick={()=>setShowPw(!showPw)}
          className="w-full flex items-center justify-between font-semibold text-slate-700">
          <span className="flex items-center gap-2"><HiLockClosed className="text-indigo-500"/> Change Password</span>
          <span className="text-slate-400 text-sm">{showPw?"?":"?"}</span>
        </button>
        {showPw && (
          <motion.form
            initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
            onSubmit={handlePwSubmit} className="mt-5 space-y-4"
          >
            <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={setPw("currentPassword")} required/>
            <Input label="New Password" type="password" value={pwForm.newPassword} onChange={setPw("newPassword")} required/>
            <Input label="Confirm New Password" type="password" value={pwForm.confirmPassword} onChange={setPw("confirmPassword")} required/>
            <Button type="submit" loading={changePwMutation.isPending}>Update Password</Button>
          </motion.form>
        )}
      </Card>
    </div>
  );
}
