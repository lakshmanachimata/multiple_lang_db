import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';

const LANGS = [
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'python', label: 'Python' },
  { value: 'node', label: 'Node.js' },
];
const DBS = [
  { value: 'sql', label: 'SQL' },
  { value: 'mongo', label: 'MongoDB' },
];

export default function Auth({ onSuccess }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lang, setLang] = useState('java');
  const [db, setDb] = useState('sql');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = { email, password, lang, db };
      if (mode === 'register') await api.register(body);
      else await api.login(body);
      onSuccess();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Tasks</h1>
        <p style={styles.subtitle}>Choose backend and database, then sign in or register.</p>
        <form onSubmit={submit} style={styles.form}>
          <div style={styles.row}>
            <label style={styles.label}>Language</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)} style={styles.select}>
              {LANGS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Database</label>
            <select value={db} onChange={(e) => setDb(e.target.value)} style={styles.select}>
              {DBS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.actions}>
            <button type="submit" disabled={loading} style={styles.button}>
              {mode === 'login' ? 'Log in' : 'Sign up'}
            </button>
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={styles.link}
            >
              {mode === 'login' ? 'Create account' : 'Back to login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    background: '#18181b',
    borderRadius: 12,
    padding: 32,
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  },
  title: { margin: '0 0 8px', fontSize: 24, fontWeight: 600 },
  subtitle: { margin: '0 0 24px', color: '#a1a1aa', fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, color: '#a1a1aa', fontWeight: 500 },
  select: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #3f3f46',
    background: '#27272a',
    color: '#e4e4e7',
    fontSize: 14,
  },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #3f3f46',
    background: '#27272a',
    color: '#e4e4e7',
    fontSize: 14,
  },
  error: { margin: 0, color: '#f87171', fontSize: 13 },
  actions: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 },
  button: {
    padding: '12px 16px',
    borderRadius: 8,
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#a1a1aa',
    cursor: 'pointer',
    fontSize: 13,
    padding: 8,
  },
};
