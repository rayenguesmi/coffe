import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UsersIcon, 
  ChartBarIcon, 
  CommandLineIcon, 
  ShieldCheckIcon,
  TrashIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalTests: 0, completedTests: 0, failedTests: 0, activeUsersCount: 0 });
  const [logs, setLogs] = useState([
    { id: 1, message: 'Agent FastAPI connecté au cluster MongoDB', level: 'info', time: '11:45:00' },
    { id: 2, message: 'TIMEOUT: WebDriver execution a expiré sur /login', level: 'error', time: '11:42:15' },
    { id: 3, message: 'Génération de script Selenium POM terminée pour UserID: 0042', level: 'info', time: '11:40:02' },
    { id: 4, message: 'HealthCheck: Moteur Python stable (98% CPU idle)', level: 'info', time: '11:35:10' },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users/all', { withCredentials: true }),
        axios.get('http://localhost:5000/api/tests/stats', { withCredentials: true })
      ]);
      if (userRes.data.success) setUsers(userRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch admin data');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch('http://localhost:5000/api/users/role', { userId, role: newRole }, { withCredentials: true });
      fetchData();
    } catch (err) {
      console.error('Failed to update role');
    }
  };

  return (
    <div className="ml-64 p-8 bg-slate-50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          Console Administrateur
          <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded uppercase font-black tracking-widest">Master Control</span>
        </h1>
        <p className="text-slate-500 mt-1">Supervision globale des performances et gestion des membres.</p>
      </div>

      {/* Global Supervision Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 text-slate-900">
        {[
          { label: 'Tests Totaux', value: stats.totalTests, icon: ChartBarIcon, color: 'blue' },
          { label: 'Utilisateurs', value: stats.activeUsersCount, icon: UsersIcon, color: 'indigo' },
          { label: 'Tests Réussis', value: stats.completedTests, icon: ShieldCheckIcon, color: 'emerald' },
          { label: 'Erreurs Engine', value: stats.failedTests, icon: CommandLineIcon, color: 'red' },
        ].map((item) => (
          <div key={item.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-indigo-200 transition-all">
            <div className={`p-2 rounded-lg w-fit mb-4 transition-colors ${
              item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              item.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
              item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              'bg-red-50 text-red-600'
            }`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black">{item.value}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* User Management */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <UsersIcon className="w-6 h-6 text-indigo-600" />
              Gestion des Utilisateurs
            </h2>
            <div className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded font-bold">{users.length} Inscrits</div>
          </div>
          <div className="space-y-4">
            {users.map(u => (
              <div key={u._id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-all hover:translate-x-1">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-200">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{u.name}</div>
                    <div className="text-xs text-slate-400 font-medium">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <select 
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="bg-white border border-slate-200 text-[11px] font-black uppercase tracking-tighter px-4 py-2 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="user">User Role</option>
                    <option value="admin">Admin Privilege</option>
                  </select>
                  <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Logs (FastAPI Engine Engine) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-3xl shadow-2xl p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
          <div className="flex items-center justify-between mb-8 relative">
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              <CommandLineIcon className="w-6 h-6 text-emerald-400" />
              Machine Logs <span className="text-[10px] text-emerald-500/50 font-mono tracking-widest animate-pulse">LIVE</span>
            </h2>
          </div>
          <div className="font-mono text-[11px] space-y-4 max-h-[460px] overflow-y-auto custom-scrollbar relative pr-2">
            {logs.map(log => (
              <div key={log.id} className="flex gap-4 border-l border-white/5 pl-4 py-1">
                <span className="text-slate-600 min-w-fit">{log.time}</span>
                <span className={log.level === 'error' ? 'text-red-400' : 'text-emerald-400/90'}>
                  <span className="opacity-50 mr-2">[{log.level.toUpperCase()}]</span>
                  {log.message}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-6">
               <div className="w-2 h-4 bg-emerald-500 animate-[pulse_1s_infinite]"></div>
               <span className="text-slate-700 italic">Listening for engine callbacks...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
