import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon, ShoppingBagIcon, CubeIcon, QrCodeIcon,
  ChartBarIcon, UsersIcon, Bars3Icon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../i18n/useTranslation';

const navItems = [
  { to: '/admin/dashboard', icon: HomeIcon,       key: 'nav.dashboard' },
  { to: '/admin/orders',    icon: ShoppingBagIcon, key: 'nav.orders'    },
  { to: '/admin/products',  icon: CubeIcon,        key: 'nav.products', adminOnly: false },
  { to: '/admin/tables',    icon: QrCodeIcon,      key: 'nav.tables',   adminOnly: false },
  { to: '/admin/analytics', icon: ChartBarIcon,    key: 'nav.analytics' },
  { to: '/admin/users',     icon: UsersIcon,       key: 'nav.users',    adminOnly: true  },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang, changeLang } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <span className="text-xl font-bold text-caramel">QuickCafe</span>
        <p className="text-xs text-white/50 mt-0.5 capitalize">{user?.role}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems
          .filter((item) => !item.adminOnly || user?.role === 'admin')
          .map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-caramel text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {t(key)}
            </NavLink>
          ))}
      </nav>
      <div className="p-3 border-t border-white/10 space-y-2">
        <div className="flex gap-1 justify-center">
          {['en', 'fr', 'ar'].map((l) => (
            <button
              key={l}
              onClick={() => changeLang(l)}
              className={`px-2 py-1 rounded text-xs font-medium transition ${
                lang === l ? 'bg-caramel text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
        >
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col bg-darkbrown shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-56 bg-darkbrown flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
          <span className="font-bold text-espresso">QuickCafe</span>
          <button onClick={() => setOpen(true)}>
            <Bars3Icon className="w-6 h-6 text-darkbrown" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
