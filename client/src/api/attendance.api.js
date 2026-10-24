import api from './axios';
export const checkInApi       = ()       => api.post('/attendance/checkin');
export const checkOutApi      = ()       => api.put('/attendance/checkout');
export const markAttendanceApi= (data)   => api.post('/attendance/mark', data);
export const getAttendanceApi = (params) => api.get('/attendance', { params });
export const getTodaySummaryApi = ()     => api.get('/attendance/today');
