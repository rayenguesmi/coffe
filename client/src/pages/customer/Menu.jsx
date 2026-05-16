import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { ShoppingCartIcon, MinusIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getPublicTable } from '../../api/tables';
import { getCategories } from '../../api/categories';
import { getProducts } from '../../api/products';
import { createOrder } from '../../api/orders';
import ProductCard from '../../components/ui/ProductCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { CartProvider, useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../utils/formatPrice';

function CartDrawer({ tableId, tableNumber, onClose }) {
  const { items, removeItem, updateQty, clear, total } = useCart();
  const navigate = useNavigate();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await createOrder({
        tableId,
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        customerNote: note || undefined,
      });
      clear();
      navigate(`/table/${tableNumber}/status/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-[slideUp_0.3s_ease]">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-darkbrown text-lg">Mon panier</h2>
          <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 && (
            <p className="text-center text-gray-400 py-8">Votre panier est vide</p>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-darkbrown">{item.name}</p>
                <p className="text-xs text-caramel">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center"
                >
                  <MinusIcon className="w-3 h-3" />
                </button>
                <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-full bg-espresso text-white flex items-center justify-center"
                >
                  <PlusIcon className="w-3 h-3" />
                </button>
                <button onClick={() => removeItem(item.id)} className="text-red-400 ml-1">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note pour la cuisine (optionnel)"
            rows={2}
            className="w-full text-sm rounded-xl border border-gray-200 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-caramel"
          />
          <div className="flex items-center justify-between">
            <span className="font-bold text-darkbrown">Total: {formatPrice(total)}</span>
          </div>
          <button
            onClick={handleOrder}
            disabled={items.length === 0 || loading}
            className="w-full py-3 rounded-2xl bg-caramel text-white font-bold text-base hover:bg-yellow-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : 'Commander'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuContent() {
  const { tableNumber } = useParams();
  const [tableData, setTableData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { addItem, count, total } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const [tableRes, catRes, prodRes] = await Promise.all([
          getPublicTable(tableNumber),
          getCategories(),
          getProducts(),
        ]);
        setTableData(tableRes.data.data);
        setCategories(catRes.data.data);
        setProducts(prodRes.data.data);
        setActiveCategory(catRes.data.data[0]?.id || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Table introuvable');
      } finally {
        setLoading(false);
      }
    })();
  }, [tableNumber]);

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">☕</p>
          <p className="text-espresso font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const filtered = activeCategory ? products.filter((p) => p.categoryId === activeCategory) : products;

  return (
    <div className="min-h-screen bg-cream pb-28">
      <Toaster position="top-center" />
      {/* Header */}
      <header className="bg-white sticky top-0 z-30 shadow-sm px-4 py-3 flex items-center gap-3">
        <span className="text-xl font-bold text-caramel">☕ QuickCafe</span>
        {tableData && (
          <span className="ml-auto text-sm font-medium text-espresso bg-surface px-3 py-1 rounded-full">
            Table N°{tableData.tableNumber}
          </span>
        )}
      </header>

      {/* Category tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse shrink-0" />
            ))
          : categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium shrink-0 transition ${
                  activeCategory === cat.id
                    ? 'bg-espresso text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
      </div>

      {/* Product grid */}
      <div className="px-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {loading
          ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : filtered.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addItem} />
            ))}
      </div>

      {/* Floating cart button */}
      {count > 0 && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-caramel text-white px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-3 font-semibold text-sm transition hover:bg-yellow-600"
        >
          <ShoppingCartIcon className="w-5 h-5" />
          <span>Mon panier ({count} articles)</span>
          <span className="bg-white/20 rounded-lg px-2 py-0.5">{formatPrice(total)}</span>
        </button>
      )}

      {drawerOpen && tableData && (
        <CartDrawer
          tableId={tableData.id}
          tableNumber={tableData.tableNumber}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}

export default function Menu() {
  return (
    <CartProvider>
      <MenuContent />
    </CartProvider>
  );
}
