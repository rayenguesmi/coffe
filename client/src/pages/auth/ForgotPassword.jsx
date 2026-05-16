import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError('Une erreur s\'est produite. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">☕</span>
          <h1 className="text-2xl font-bold text-darkbrown mt-2">Mot de passe oublié</h1>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-green-600 font-medium">Si cet email est enregistré, un lien de réinitialisation a été envoyé.</p>
              <Link to="/admin/login" className="text-espresso font-semibold hover:underline text-sm">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-caramel outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-espresso text-white font-bold py-3.5 rounded-xl hover:bg-darkbrown transition disabled:opacity-50"
              >
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
              <Link to="/admin/login" className="block text-center text-sm text-gray-400 hover:text-espresso">
                Retour à la connexion
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
