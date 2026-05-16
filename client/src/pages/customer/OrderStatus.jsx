import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getPublicOrder } from '../../api/orders';
import { formatPrice } from '../../utils/formatPrice';

const STEPS = [
  { key: 'pending',   label: 'Commande reçue' },
  { key: 'preparing', label: 'En préparation' },
  { key: 'ready',     label: 'Prête' },
  { key: 'delivered', label: 'Livrée' },
];

const stepIndex = (status) => STEPS.findIndex((s) => s.key === status);

export default function OrderStatus() {
  const { tableNumber, orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    getPublicOrder(orderId)
      .then((res) => {
        const o = res.data.data;
        setOrder(o);
        // Connect socket and join table room
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
        socketRef.current = socket;
        socket.emit('join_table', { tableId: o.tableId });
        socket.on('order_updated', ({ orderId: id, status }) => {
          if (id === orderId) setOrder((prev) => prev ? { ...prev, status } : prev);
        });
      })
      .finally(() => setLoading(false));

    return () => socketRef.current?.disconnect();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-caramel border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-espresso font-semibold">Commande introuvable.</p>
      </div>
    );
  }

  const currentStep = stepIndex(order.status);

  return (
    <div className="min-h-screen bg-cream px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">☕</span>
          <h1 className="text-xl font-bold text-darkbrown mt-2">Suivi de commande</h1>
          <p className="text-gray-500 text-sm">Table N°{tableNumber}</p>
        </div>

        {/* Stepper */}
        <div className="relative flex flex-col gap-0 mb-8">
          {STEPS.map((step, idx) => {
            const done = idx <= currentStep;
            const active = idx === currentStep;
            return (
              <div key={step.key} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                    done ? 'bg-espresso border-espresso text-white' : 'bg-white border-gray-200 text-gray-300'
                  } ${active ? 'ring-4 ring-caramel/30' : ''}`}>
                    {done ? '✓' : idx + 1}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-0.5 h-10 mt-1 transition-all duration-500 ${done && idx < currentStep ? 'bg-espresso' : 'bg-gray-200'}`} />
                  )}
                </div>
                <div className="pt-1.5">
                  <p className={`text-sm font-semibold ${done ? 'text-darkbrown' : 'text-gray-400'}`}>{step.label}</p>
                  {active && order.status !== 'delivered' && (
                    <p className="text-xs text-caramel animate-pulse mt-0.5">En cours...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2 mb-6">
          <h3 className="font-semibold text-darkbrown text-sm mb-3">Récapitulatif</h3>
          {order.OrderItems?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.Product?.name} ×{item.quantity}</span>
              <span className="text-gray-500">{formatPrice(parseFloat(item.unitPrice) * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold text-darkbrown">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <Link
          to={`/table/${tableNumber}`}
          className="block w-full text-center py-3 rounded-2xl border-2 border-espresso text-espresso font-semibold hover:bg-espresso hover:text-white transition"
        >
          Nouvelle commande
        </Link>
      </div>
    </div>
  );
}
