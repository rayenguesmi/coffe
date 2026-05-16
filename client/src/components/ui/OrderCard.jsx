import StatusBadge from './StatusBadge';
import { formatPrice } from '../../utils/formatPrice';
import { formatTime } from '../../utils/formatDate';

const NEXT_STATUS = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
};

export default function OrderCard({ order, onStatusChange }) {
  const next = NEXT_STATUS[order.status];

  return (
    <div className={`bg-white rounded-xl border p-4 flex flex-col gap-3 ${order.status === 'pending' ? 'ring-2 ring-yellow-300 animate-pulse' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="font-bold text-espresso">Table {order.Table?.tableNumber}</span>
        <StatusBadge status={order.status} />
      </div>
      <div className="text-xs text-gray-400">{formatTime(order.createdAt)}</div>
      <ul className="text-sm text-gray-700 space-y-0.5">
        {order.OrderItems?.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>{item.Product?.name}</span>
            <span className="text-gray-400">×{item.quantity}</span>
          </li>
        ))}
      </ul>
      {order.customerNote && (
        <p className="text-xs italic text-gray-500 border-t pt-2">{order.customerNote}</p>
      )}
      <div className="flex items-center justify-between border-t pt-2">
        <span className="font-semibold text-darkbrown">{formatPrice(order.total)}</span>
        {next && (
          <button
            onClick={() => onStatusChange(order.id, next)}
            className="text-xs px-3 py-1.5 rounded-lg bg-espresso text-white hover:bg-darkbrown transition"
          >
            {next === 'preparing' && 'Démarrer'}
            {next === 'ready' && 'Prête'}
            {next === 'delivered' && 'Livrer'}
          </button>
        )}
      </div>
    </div>
  );
}
