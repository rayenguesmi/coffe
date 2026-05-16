import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Auth pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Customer pages (no login needed)
import Menu from './pages/customer/Menu';
import OrderStatus from './pages/customer/OrderStatus';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import Products from './pages/admin/Products';
import Tables from './pages/admin/Tables';
import Analytics from './pages/admin/Analytics';
import Users from './pages/admin/Users';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-2 border-caramel border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* ── Customer routes (no auth) ─────────────────────────── */}
          <Route path="/table/:tableNumber" element={<Menu />} />
          <Route path="/table/:tableNumber/status/:orderId" element={<OrderStatus />} />

          {/* ── Employee auth ─────────────────────────────────────── */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password/:token" element={<ResetPassword />} />

          {/* ── Protected admin routes ────────────────────────────── */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin', 'cashier', 'waiter']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute roles={['admin', 'cashier', 'waiter']}>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute roles={['admin']}>
              <Products />
            </ProtectedRoute>
          } />
          <Route path="/admin/tables" element={
            <ProtectedRoute roles={['admin']}>
              <Tables />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute roles={['admin', 'cashier']}>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <Users />
            </ProtectedRoute>
          } />

          {/* ── Fallback ─────────────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
