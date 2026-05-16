import api from './axios';

export const getTables = () => api.get('/tables');
export const createTable = () => api.post('/tables');
export const updateTable = (id, data) => api.put(`/tables/${id}`, data);
export const deleteTable = (id) => api.delete(`/tables/${id}`);
export const getPublicTable = (tableNumber) => api.get(`/tables/public/${tableNumber}`);
