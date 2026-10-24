import api from './axios';
export const getEmployeesApi   = (params) => api.get('/employees', { params });
export const getEmployeeApi    = (id)     => api.get(`/employees/${id}`);
export const createEmployeeApi = (data)   => api.post('/employees', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateEmployeeApi = (id, data) => api.put(`/employees/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deactivateEmployeeApi = (id, data) => api.delete(`/employees/${id}`, { data });
