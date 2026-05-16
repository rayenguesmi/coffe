import api from './axios';

export const getAllUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateRole = (id, role) => api.patch(`/users/${id}/role`, { role });
export const toggleActive = (id) => api.patch(`/users/${id}/toggle`);
export const deleteUser = (id) => api.delete(`/users/${id}`);
