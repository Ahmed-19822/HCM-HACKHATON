import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getEmployeeApi, createEmployeeApi, updateEmployeeApi } from "../../api/employees.api";
import { getDepartmentsApi } from "../../api/departments.api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Avatar from "../../components/ui/Avatar";
import { HiArrowLeft, HiPhotograph } from "react-icons/hi";

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;

  const [form, setForm] = useState({
    employeeId: "", firstName: "", lastName: "", email: "", phone: "",
    address: "", designation: "", department: "", dateOfJoining: "",
    salary: "", userPassword: "HCM@1234", userRole: "employee", status: "active",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartmentsApi().then(r => r.data.data),
  });

  const { data: emp } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployeeApi(id).then(r => r.data.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (emp) {
      setForm({
        employeeId: emp.employeeId || "",
        firstName: emp.firstName || "",
        lastName: emp.lastName || "",
        email: emp.email || "",
        phone: emp.phone || "",
        address: emp.address || "",
        designation: emp.designation || "",
        department: emp.department?._id || emp.department || "",
        dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.split("T")[0] : "",
        salary: emp.salary || "",
        userPassword: "", userRole: emp.user?.role || "employee", status: emp.status || "active",
      });
    }
  }, [emp]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateEmployeeApi(id, data) : createEmployeeApi(data),
    onSuccess: () => {
      toast.success(`Employee ${isEdit ? "updated" : "created"} successfully`);
      qc.invalidateQueries(["employees"]);
      navigate("/employees");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Something went wrong"),
  });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
    if (avatarFile) fd.append("avatar", avatarFile);
    mutation.mutate(fd);
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const fields = [
    [
      { label: "Employee ID*", key: "employeeId", type: "text", placeholder: "EMP-001", disabled: isEdit },
      { label: "First Name*", key: "firstName", type: "text", placeholder: "Ahmed" },
    ],
    [
      { label: "Last Name*", key: "lastName", type: "text", placeholder: "Hayat" },
      { label: "Email*", key: "email", type: "email", placeholder: "ahmed@company.com" },
    ],
    [
      { label: "Phone", key: "phone", type: "tel", placeholder: "+92 300 1234567" },
      { label: "Designation*", key: "designation", type: "text", placeholder: "Software Engineer" },
    ],
    [
      { label: "Date of Joining*", key: "dateOfJoining", type: "date" },
      { label: "Salary (PKR)", key: "salary", type: "number", placeholder: "50000" },
    ],
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium">
        <HiArrowLeft className="w-4 h-4"/> Back
      </button>

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="relative">
            {avatarPreview
              ? <img src={avatarPreview} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-200"/>
              : <Avatar name={`${form.firstName} ${form.lastName}`} size="lg"/>
            }
            <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-600 transition-colors shadow">
              <HiPhotograph className="w-3.5 h-3.5 text-white"/>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile}/>
            </label>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{isEdit ? "Edit Employee" : "New Employee"}</h2>
            <p className="text-sm text-slate-500">{isEdit ? "Update employee information" : "Fill in the details below"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map((row, ri) => (
            <motion.div key={ri}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ri * 0.06 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {row.map(f => (
                <Input key={f.key} label={f.label} type={f.type}
                  placeholder={f.placeholder} value={form[f.key]}
                  onChange={set(f.key)} disabled={f.disabled}
                  required={f.label?.includes("*")}
                />
              ))}
            </motion.div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Department*" value={form.department} onChange={set("department")} required>
              <option value="">Select department</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </Select>
            <Select label="Status" value={form.status} onChange={set("status")}>
              <option value="active">Active</option>
              <option value="resigned">Resigned</option>
              <option value="terminated">Terminated</option>
            </Select>
          </div>

          <Input label="Address" placeholder="123 Main St, Karachi" value={form.address} onChange={set("address")}/>

          {!isEdit && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="sm:col-span-2">
                <p className="text-sm font-semibold text-indigo-700 mb-3">Login Account</p>
              </div>
              <Input label="Password" type="password" value={form.userPassword} onChange={set("userPassword")} placeholder="HCM@1234"/>
              <Select label="Role" value={form.userRole} onChange={set("userRole")}>
                <option value="employee">Employee</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </Select>
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending}>
              {isEdit ? "Update Employee" : "Create Employee"}
            </Button>
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
