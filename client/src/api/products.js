import api from './axios';

export const getProducts = (categoryId) =>
  api.get('/products', { params: categoryId ? { categoryId } : {} });
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const toggleAvailability = (id) => api.patch(`/products/${id}/availability`);
