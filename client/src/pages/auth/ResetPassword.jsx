import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../api/auth';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword(token, password);
      navigate('/admin/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Token invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">☕</span>
          <h1 className="text-2xl font-bold text-darkbrown mt-2">Nouveau mot de passe</h1>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Nouveau mot de passe"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-caramel outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-espresso text-white font-bold py-3.5 rounded-xl hover:bg-darkbrown transition disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Réinitialiser'}
            </button>
            <Link to="/admin/login" className="block text-center text-sm text-gray-400 hover:text-espresso">
              Retour à la connexion
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
