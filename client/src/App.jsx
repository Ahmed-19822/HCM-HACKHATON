import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LoginPage    from "./pages/Login";
import Dashboard    from "./pages/Dashboard";
import Employees    from "./pages/employees/Employees";
import EmployeeForm from "./pages/employees/EmployeeForm";
import Departments  from "./pages/Departments";
import Attendance   from "./pages/attendance/Attendance";
import Leaves       from "./pages/leaves/Leaves";
import Payroll      from "./pages/payroll/Payroll";
import Profile      from "./pages/Profile";

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration:3500, style:{ borderRadius:"12px", background:"#1e293b", color:"#f8fafc", fontSize:"14px" }, success:{ iconTheme:{ primary:"#22c55e", secondary:"#fff" } }, error:{ iconTheme:{ primary:"#ef4444", secondary:"#fff" } } }}/>
          <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
            <Route element={<ProtectedRoute><Layout/></ProtectedRoute>}>
              <Route path="/dashboard"          element={<ProtectedRoute roles={["admin","hr"]}><Dashboard/></ProtectedRoute>}/>
              <Route path="/employees"           element={<Employees/>}/>
              <Route path="/employees/new"       element={<ProtectedRoute roles={["admin","hr"]}><EmployeeForm/></ProtectedRoute>}/>
              <Route path="/employees/:id/edit"  element={<ProtectedRoute roles={["admin","hr"]}><EmployeeForm/></ProtectedRoute>}/>
              <Route path="/departments"         element={<ProtectedRoute roles={["admin","hr"]}><Departments/></ProtectedRoute>}/>
              <Route path="/attendance"          element={<Attendance/>}/>
              <Route path="/leaves"              element={<Leaves/>}/>
              <Route path="/payroll"             element={<Payroll/>}/>
              <Route path="/profile"             element={<Profile/>}/>
            </Route>
            <Route path="*" element={<Navigate to="/" replace/>}/>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}