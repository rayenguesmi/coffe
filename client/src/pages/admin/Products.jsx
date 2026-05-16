import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Modal from '../../components/ui/Modal';
import { getProducts, createProduct, updateProduct, deleteProduct, toggleAvailability } from '../../api/products';
import { getCategories } from '../../api/categories';
import { formatPrice } from '../../utils/formatPrice';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

const EMPTY = { name: '', description: '', price: '', image: '', categoryId: '', available: true };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | product
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => { setProducts(p.data.data); setCategories(c.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (p) => { setForm({ name: p.name, description: p.description || '', price: p.price, image: p.image || '', categoryId: p.categoryId, available: p.available }); setModal(p); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        const res = await createProduct(form);
        setProducts((prev) => [...prev, res.data.data]);
        toast.success('Produit créé');
      } else {
        const res = await updateProduct(modal.id, form);
        setProducts((prev) => prev.map((p) => (p.id === modal.id ? res.data.data : p)));
        toast.success('Produit mis à jour');
      }
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Produit supprimé');
    } catch { toast.error('Erreur'); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleAvailability(id);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, available: res.data.data.available } : p)));
    } catch { toast.error('Erreur'); }
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-darkbrown">Produits</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-espresso text-white px-4 py-2 rounded-xl hover:bg-darkbrown transition text-sm font-medium">
          <PlusIcon className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
              {p.image && <img src={p.image} alt={p.name} className="w-full h-32 object-cover" loading="lazy" />}
              <div className="p-3 flex flex-col flex-1">
                <p className="font-semibold text-sm text-darkbrown">{p.name}</p>
                <p className="text-caramel font-bold text-sm mt-1">{formatPrice(p.price)}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t">
                  <button
                    onClick={() => handleToggle(p.id)}
                    className={`text-xs px-2 py-1 rounded-lg font-medium transition ${p.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                  >
                    {p.available ? 'Dispo' : 'Indispo'}
                  </button>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-surface text-gray-500"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'Nouveau produit' : 'Modifier le produit'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            {[
              { label: 'Nom', key: 'name', type: 'text', required: true },
              { label: 'Prix (€)', key: 'price', type: 'number', step: '0.01', required: true },
              { label: 'URL image', key: 'image', type: 'url' },
            ].map(({ label, key, ...rest }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-caramel outline-none text-sm"
                  {...rest}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-caramel outline-none text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Catégorie</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-caramel outline-none text-sm"
              >
                <option value="">Sélectionner</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.available} onChange={(e) => setForm((p) => ({ ...p, available: e.target.checked }))} className="rounded" />
              <span className="text-sm text-gray-700">Disponible</span>
            </label>
            <button type="submit" disabled={saving} className="w-full bg-espresso text-white font-bold py-3 rounded-xl hover:bg-darkbrown transition disabled:opacity-50">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}
