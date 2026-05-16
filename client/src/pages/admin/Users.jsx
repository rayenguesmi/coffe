import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Modal from '../../components/ui/Modal';
import { getAllUsers, createUser, updateRole, toggleActive, deleteUser } from '../../api/users';
import { formatDate } from '../../utils/formatDate';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

const EMPTY = { name: '', email: '', password: '', role: 'cashier' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllUsers().then((res) => setUsers(res.data.data)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await createUser(form);
      setUsers((prev) => [res.data.data, ...prev]);
      setModal(false);
      setForm(EMPTY);
      toast.success('Employé créé');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleRole = async (id, role) => {
    try {
      await updateRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch { toast.error('Erreur'); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleActive(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isVerified: res.data.data.isVerified } : u)));
    } catch { toast.error('Erreur'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet employé ?')) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('Employé supprimé');
    } catch { toast.error('Erreur'); }
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-darkbrown">Équipe</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-espresso text-white px-4 py-2 rounded-xl hover:bg-darkbrown transition text-sm font-medium">
          <PlusIcon className="w-4 h-4" /> Ajouter un employé
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-gray-500 text-xs uppercase">
            <tr>
              {['Nom', 'Email', 'Rôle', 'Statut', 'Depuis', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-surface/50 transition">
                <td className="px-4 py-3 font-medium text-darkbrown">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRole(u.id, e.target.value)}
                    className="text-xs border rounded-lg px-2 py-1 focus:ring-1 focus:ring-caramel outline-none capitalize"
                  >
                    {['admin', 'cashier', 'waiter'].map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(u.id)}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${u.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                  >
                    {u.isVerified ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Nouvel employé" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {[
              { label: 'Nom', key: 'name', type: 'text', required: true },
              { label: 'Email', key: 'email', type: 'email', required: true },
              { label: 'Mot de passe', key: 'password', type: 'password', required: true },
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
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rôle</label>
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-caramel outline-none text-sm"
              >
                <option value="cashier">Cashier</option>
                <option value="waiter">Waiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" disabled={saving} className="w-full bg-espresso text-white font-bold py-3 rounded-xl hover:bg-darkbrown transition disabled:opacity-50">
              {saving ? 'Création...' : 'Créer'}
            </button>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}
