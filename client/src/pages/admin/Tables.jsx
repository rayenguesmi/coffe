import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getTables, createTable, deleteTable } from '../../api/tables';
import { QRCodeCanvas } from 'qrcode.react';
import { TrashIcon, ArrowDownTrayIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRefs = useRef({});

  useEffect(() => {
    getTables().then((res) => setTables(res.data.data)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    try {
      const res = await createTable();
      setTables((prev) => [...prev, res.data.data]);
      toast.success(`Table ${res.data.data.tableNumber} créée`);
    } catch { toast.error('Erreur lors de la création'); }
  };

  const handleDelete = async (id, num) => {
    if (!confirm(`Supprimer la table ${num} ?`)) return;
    try {
      await deleteTable(id);
      setTables((prev) => prev.filter((t) => t.id !== id));
      toast.success('Table supprimée');
    } catch { toast.error('Erreur'); }
  };

  const downloadQR = (tableNumber) => {
    const canvas = canvasRefs.current[tableNumber];
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-table-${tableNumber}.png`;
    a.click();
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-darkbrown">Tables & QR Codes</h1>
        <button onClick={handleCreate} className="flex items-center gap-2 bg-espresso text-white px-4 py-2 rounded-xl hover:bg-darkbrown transition text-sm font-medium">
          <PlusIcon className="w-4 h-4" /> Ajouter une table
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl h-52 animate-pulse" />)}
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Aucune table. Ajoutez-en une.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => {
            const qrUrl = `${APP_URL}/table/${table.tableNumber}`;
            return (
              <div key={table.id} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-3">
                <p className="font-bold text-espresso">Table N°{table.tableNumber}</p>
                <QRCodeCanvas
                  value={qrUrl}
                  size={128}
                  fgColor="#6B4F2A"
                  ref={(el) => { canvasRefs.current[table.tableNumber] = el; }}
                />
                <p className="text-xs text-gray-400 text-center break-all">{qrUrl}</p>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => downloadQR(table.tableNumber)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-surface text-espresso text-xs font-semibold hover:bg-caramel hover:text-white transition"
                  >
                    <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Télécharger
                  </button>
                  <button
                    onClick={() => handleDelete(table.id, table.tableNumber)}
                    className="p-2 rounded-xl hover:bg-red-50 text-red-400"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
