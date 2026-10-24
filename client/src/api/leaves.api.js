import api from './axios';
export const getLeavesApi        = (params) => api.get('/leaves', { params });
export const getLeaveApi         = (id)     => api.get(`/leaves/${id}`);
export const applyLeaveApi       = (data)   => api.post('/leaves', data);
export const updateLeaveStatusApi= (id, d)  => api.put(`/leaves/${id}`, d);
export const cancelLeaveApi      = (id)     => api.delete(`/leaves/${id}`);
