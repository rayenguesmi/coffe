import { PlusIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '../../utils/formatPrice';

export default function ProductCard({ product, onAdd }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col animate-[fadeIn_0.3s_ease]">
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-36 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-darkbrown text-sm">{product.name}</h3>
        {product.description && (
          <p className="text-gray-500 text-xs mt-0.5 flex-1 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-espresso">{formatPrice(product.price)}</span>
          <button
            onClick={() => onAdd(product)}
            disabled={!product.available}
            className="w-8 h-8 rounded-full bg-espresso text-white flex items-center justify-center hover:bg-darkbrown transition disabled:opacity-40"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
