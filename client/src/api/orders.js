import api from './axios';

export const createOrder = (data) => api.post('/orders', data);
export const getOrders = (status) =>
  api.get('/orders', { params: status ? { status } : {} });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const getPublicOrder = (orderId) => api.get(`/orders/public/${orderId}`);
export const getOrdersByTable = (tableId) => api.get(`/orders/table/${tableId}`);
