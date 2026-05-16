import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import StatusBadge from '../../components/ui/StatusBadge';
import { getOrders, updateOrderStatus } from '../../api/orders';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import toast, { Toaster } from 'react-hot-toast';

const STATUSES = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
const PER_PAGE = 20;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrders(filter || undefined);
      setOrders(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      toast.success('Statut mis à jour');
    } catch {
      toast.error('Erreur');
    }
  };

  const paginated = orders.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pages = Math.ceil(orders.length / PER_PAGE);

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-darkbrown">Commandes</h1>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-caramel outline-none"
        >
          <option value="">Tous les statuts</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-gray-500 text-xs uppercase">
              <tr>
                {['Table', 'Heure', 'Articles', 'Total', 'Statut', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucune commande</td></tr>
              ) : paginated.map((order) => (
                <tr key={order.id} className="hover:bg-surface/50 transition">
                  <td className="px-4 py-3 font-medium text-darkbrown">Table {order.Table?.tableNumber}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-500">{order.OrderItems?.length} article(s)</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatus(order.id, e.target.value)}
                      className="text-xs border rounded-lg px-2 py-1 focus:ring-1 focus:ring-caramel outline-none"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                  page === p ? 'bg-espresso text-white' : 'bg-surface text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
