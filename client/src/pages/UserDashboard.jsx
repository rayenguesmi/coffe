import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BeakerIcon, ListBulletIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const UserDashboard = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [url, setUrl] = useState('');
  const [type, setType] = useState('Génération de script');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/tests/my-tests', { withCredentials: true });
      if (data.success) setTests(data.data);
    } catch (err) {
      console.error('Failed to fetch tests');
    }
  };

  const handleLaunchTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/tests/start', {
        targetUrl: url,
        analysisType: type
      }, { withCredentials: true });
      setUrl('');
      fetchTests();
    } catch (err) {
      console.error('Failed to start test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-64 p-8 bg-slate-50 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bonjour, {user?.name}! 👋</h1>
        <p className="text-slate-500 mt-1">Bienvenue sur votre espace de travail AUTOTEST.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section 1: Lancement de Test */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <BeakerIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Lancement de Test</h2>
          </div>
          <form onSubmit={handleLaunchTest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL Cible</label>
              <input 
                type="url" 
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type d'Analyse</label>
              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option>Génération de script</option>
                <option>Exécution</option>
              </select>
            </div>
            <button 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Démarrage...' : (
                <>
                  <span>Lancer le test</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Section 2: Projets & Tests */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                <ListBulletIcon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Projets & Tests</h2>
            </div>
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{tests.length} tests</span>
          </div>
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-4 font-semibold px-4">URL</th>
                  <th className="pb-4 font-semibold px-4">Type</th>
                  <th className="pb-4 font-semibold px-4">Statut</th>
                  <th className="pb-4 font-semibold px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tests.map((test) => (
                  <tr key={test._id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 truncate max-w-[180px] text-slate-600 font-medium">{test.targetUrl}</td>
                    <td className="py-4 px-4 text-slate-500 text-sm">{test.analysisType}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        test.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        test.status === 'failed' ? 'bg-red-100 text-red-700' :
                        test.status === 'running' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {test.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-sm text-right">{new Date(test.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {tests.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400 italic">Aucun test lancé pour le moment.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Historique Personnel & Rapports */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
              <ClockIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Historique des Rapports</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {tests.filter(t => t.report || t.screenshots?.length > 0).map(test => (
               <div key={test._id} className="group border border-slate-100 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 group-hover:bg-indigo-50 rounded-bl-full transition-colors -mr-8 -mt-8"></div>
                 <div className="text-sm font-bold text-slate-700 truncate mb-1 pr-4">{test.targetUrl}</div>
                 <div className="text-[10px] text-slate-400 font-medium mb-4">{new Date(test.createdAt).toLocaleString()}</div>
                 <div className="flex gap-2">
                   {test.report && (
                     <span className="bg-indigo-50 text-[9px] px-2 py-0.5 rounded-md font-extrabold text-indigo-600 border border-indigo-100">JSON</span>
                   )}
                   {test.screenshots?.length > 0 && (
                     <span className="bg-emerald-50 text-[9px] px-2 py-0.5 rounded-md font-extrabold text-emerald-600 border border-emerald-100">SCREENSHOTS</span>
                   )}
                 </div>
               </div>
             ))}
             {tests.filter(t => t.report || t.screenshots?.length > 0).length === 0 && (
               <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                 <ClockIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-400 italic">Vos rapports et captures d'écran apparaîtront ici une fois les tests terminés.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
