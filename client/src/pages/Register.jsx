import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../api/auth';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, success: '', error: '' });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: '', error: '' });

    try {
      const { data } = await registerUser(form);
      setStatus({ loading: false, success: data.message, error: '' });
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setStatus({
        loading: false,
        success: '',
        error: err.response?.data?.message || 'Registration failed. Please try again.',
      });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create an Account</h2>

        {status.success && <p style={styles.success}>{status.success}</p>}
        {status.error && <p style={styles.error}>{status.error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Name</label>
          <input
            name="name"
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <input
            name="password"
            type="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button type="submit" disabled={status.loading} style={styles.button}>
            {status.loading ? 'Registering…' : 'Register'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f3f4f6' },
  card: { background: '#fff', borderRadius: 10, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  title: { marginBottom: 24, fontSize: 24, fontWeight: 700, color: '#111' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { fontSize: 14, fontWeight: 600, color: '#374151' },
  input: { padding: '10px 14px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' },
  button: { marginTop: 8, padding: '12px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  success: { background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: 6, marginBottom: 12, fontSize: 14 },
  error: { background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 6, marginBottom: 12, fontSize: 14 },
  footer: { marginTop: 20, textAlign: 'center', fontSize: 14, color: '#6b7280' },
};
