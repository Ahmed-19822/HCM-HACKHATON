import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getDepartmentsApi, createDepartmentApi, updateDepartmentApi, deleteDepartmentApi } from "../api/departments.api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import { HiPlus, HiPencil, HiTrash, HiOfficeBuilding } from "react-icons/hi";

export default function Departments() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartmentsApi().then(r => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editItem ? updateDepartmentApi(editItem._id, data) : createDepartmentApi(data),
    onSuccess: () => {
      toast.success(editItem ? "Department updated" : "Department created");
      qc.invalidateQueries(["departments"]);
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartmentApi,
    onSuccess: () => { toast.success("Department deleted"); qc.invalidateQueries(["departments"]); setConfirm(null); },
    onError: () => toast.error("Failed to delete"),
  });

  const openModal = (item = null) => {
    setEditItem(item);
    setForm(item ? { name: item.name, description: item.description || "" } : { name: "", description: "" });
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditItem(null); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Departments</h2>
          <p className="text-sm text-slate-500">{departments.length} departments</p>
        </div>
        <Button icon={<HiPlus className="w-4 h-4"/>} onClick={() => openModal()}>Add Department</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse"/>
          ))}
        </div>
      ) : departments.length === 0 ? (
        <Card className="p-12">
          <EmptyState icon={<HiOfficeBuilding/>} title="No departments yet" description="Create your first department to get started"
            action={<Button icon={<HiPlus className="w-4 h-4"/>} onClick={() => openModal()}>Add Department</Button>}/>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept, i) => (
            <motion.div key={dept._id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, boxShadow: "0 16px 32px -8px rgba(99,102,241,0.18)" }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 group cursor-default"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <HiOfficeBuilding className="w-5 h-5 text-white"/>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(dept)} className="p-1.5 rounded-lg hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-all">
                    <HiPencil className="w-4 h-4"/>
                  </button>
                  <button onClick={() => setConfirm(dept._id)} className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all">
                    <HiTrash className="w-4 h-4"/>
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{dept.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{dept.description || "No description"}</p>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={closeModal} title={editItem ? "Edit Department" : "New Department"} size="sm">
        <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
          <Input label="Name*" placeholder="Engineering" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required/>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea rows={3} placeholder="What does this department do?"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={saveMutation.isPending}>{editItem ? "Update" : "Create"}</Button>
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={() => deleteMutation.mutate(confirm)}
        loading={deleteMutation.isPending}
        title="Delete Department" message="Are you sure you want to delete this department?"/>
    </div>
  );
}
