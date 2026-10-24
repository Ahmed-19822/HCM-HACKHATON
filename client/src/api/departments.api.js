import api from './axios';
export const getDepartmentsApi   = ()       => api.get('/departments');
export const getDepartmentApi    = (id)     => api.get(`/departments/${id}`);
export const createDepartmentApi = (data)   => api.post('/departments', data);
export const updateDepartmentApi = (id, d)  => api.put(`/departments/${id}`, d);
export const deleteDepartmentApi = (id)     => api.delete(`/departments/${id}`);
