import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getSummary } from '../../api/analytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatPrice } from '../../utils/formatPrice';

const PIE_COLORS = ['#F59E0B', '#3B82F6', '#22C55E', '#6B7280', '#EF4444'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSummary().then((res) => setData(res.data.data)).finally(() => setLoading(false));
  }, []);

  const metrics = data ? [
    { label: 'Commandes aujourd\'hui', value: data.ordersToday },
    { label: 'Revenu aujourd\'hui', value: formatPrice(data.revenueToday) },
    { label: 'Tables actives', value: data.activeTables },
    { label: 'Top produit', value: data.topProducts?.[0]?.name || '—' },
  ] : [];

  const pieData = data ? Object.entries(data.ordersByStatus || {}).map(([name, value]) => ({ name, value })) : [];

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-darkbrown mb-6">Analytiques</h1>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array(4).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map((m) => (
              <div key={m.label} className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-xs text-gray-400 font-medium mb-1">{m.label}</p>
                <p className="text-2xl font-bold text-darkbrown">{m.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 products */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-semibold text-darkbrown mb-4 text-sm">Top 5 produits</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.topProducts} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="totalQty" fill="#D4A853" radius={[6, 6, 0, 0]} name="Qté" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Orders by status */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-semibold text-darkbrown mb-4 text-sm">Commandes par statut</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
