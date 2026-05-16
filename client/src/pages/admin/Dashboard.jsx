import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import OrderCard from '../../components/ui/OrderCard';
import { getOrders, updateOrderStatus } from '../../api/orders';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

const playBeep = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.start();
    setTimeout(() => osc.stop(), 200);
  } catch {}
};

const STATUSES = ['pending', 'preparing', 'ready'];

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchOrders();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { withCredentials: true });
    socketRef.current = socket;
    socket.emit('join_dashboard');

    socket.on('new_order', ({ order }) => {
      playBeep();
      setOrders((prev) => [order, ...prev]);
      toast.success(`Nouvelle commande — Table ${order.Table?.tableNumber}`);
    });

    socket.on('order_updated', ({ orderId, status }) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    });

    return () => socket.disconnect();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data.data.filter((o) => STATUSES.includes(o.status)));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      if (status === 'delivered' || status === 'cancelled') {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      } else {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      }
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const pending = orders.filter((o) => o.status === 'pending').length;

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-darkbrown">
          Dashboard
          {pending > 0 && (
            <span className="ml-2 bg-yellow-400 text-white text-sm px-2 py-0.5 rounded-full">{pending}</span>
          )}
        </h1>
        <div className="flex gap-2">
          {['all', 'pending', 'preparing', 'ready'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === s ? 'bg-espresso text-white' : 'bg-white text-gray-600 border hover:border-espresso'
              }`}
            >
              {s === 'all' ? 'Toutes' : s === 'pending' ? 'Attente' : s === 'preparing' ? 'Préparation' : 'Prêtes'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-44 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">✅</p>
          <p>Aucune commande active</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
