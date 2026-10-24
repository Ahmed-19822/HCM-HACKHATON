import api from './axios';
export const getPayrollsApi    = (params) => api.get('/payroll', { params });
export const getPayslipApi     = (id)     => api.get(`/payroll/${id}`);
export const generatePayrollApi= (data)   => api.post('/payroll', data);
export const markPaidApi       = (id)     => api.put(`/payroll/${id}/mark-paid`);
