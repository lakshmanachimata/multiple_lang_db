import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [showAdd, setShowAdd] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .getTasks()
      .then(setTasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleLogout = async () => {
    await api.logout();
    onLogout();
    navigate('/login', { replace: true });
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      await api.createTask({ title: form.title.trim(), description: form.description.trim() || '' });
      setForm({ title: '', description: '' });
      setShowAdd(false);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editing || !form.title.trim()) return;
    try {
      await api.updateTask(editing.id, { title: form.title.trim(), description: form.description.trim() || '' });
      setEditing(null);
      setForm({ title: '', description: '' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.deleteTask(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const startEdit = (task) => {
    setEditing(task);
    setForm({ title: task.title, description: task.description || '' });
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Tasks</h1>
        <button onClick={handleLogout} style={styles.logout}>Log out</button>
      </header>
      <main style={styles.main}>
        {error && (
          <p style={styles.error} onClick={() => setError('')}>
            {error} (dismiss)
          </p>
        )}
        <div style={styles.toolbar}>
          <button onClick={() => setShowAdd(true)} style={styles.primaryBtn}>
            Add task
          </button>
        </div>
        {showAdd && (
          <form onSubmit={submitAdd} style={styles.form}>
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              style={styles.input}
              autoFocus
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              style={styles.textarea}
              rows={2}
            />
            <div style={styles.formActions}>
              <button type="submit" style={styles.primaryBtn}>Save</button>
              <button type="button" onClick={() => { setShowAdd(false); setForm({ title: '', description: '' }); }} style={styles.secondaryBtn}>
                Cancel
              </button>
            </div>
          </form>
        )}
        {editing && (
          <form onSubmit={submitEdit} style={styles.form}>
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              style={styles.input}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              style={styles.textarea}
              rows={2}
            />
            <div style={styles.formActions}>
              <button type="submit" style={styles.primaryBtn}>Update</button>
              <button type="button" onClick={() => { setEditing(null); setForm({ title: '', description: '' }); }} style={styles.secondaryBtn}>
                Cancel
              </button>
            </div>
          </form>
        )}
        {loading ? (
          <p style={styles.muted}>Loading tasks…</p>
        ) : (
          <ul style={styles.list}>
            {tasks.map((t) => (
              <li key={t.id} style={styles.item}>
                <div>
                  <strong>{t.title}</strong>
                  {t.description && <p style={styles.desc}>{t.description}</p>}
                </div>
                <div style={styles.itemActions}>
                  <button onClick={() => startEdit(t)} style={styles.smallBtn}>Edit</button>
                  <button onClick={() => deleteTask(t.id)} style={styles.smallBtnDanger}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && tasks.length === 0 && !showAdd && !editing && (
          <p style={styles.muted}>No tasks yet. Add one above.</p>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', padding: '24px 32px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { margin: 0, fontSize: 24, fontWeight: 600 },
  logout: { padding: '8px 16px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: 8, color: '#e4e4e7', cursor: 'pointer', fontSize: 14 },
  main: { maxWidth: 640 },
  error: { padding: 12, background: 'rgba(248,113,113,0.15)', borderRadius: 8, color: '#f87171', marginBottom: 16, cursor: 'pointer' },
  toolbar: { marginBottom: 16 },
  primaryBtn: { padding: '10px 16px', background: '#3b82f6', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  secondaryBtn: { padding: '10px 16px', background: 'transparent', border: '1px solid #3f3f46', borderRadius: 8, color: '#e4e4e7', cursor: 'pointer', fontSize: 14, marginLeft: 8 },
  form: { marginBottom: 24, padding: 16, background: '#18181b', borderRadius: 12 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #3f3f46', background: '#27272a', color: '#e4e4e7', fontSize: 14, marginBottom: 8 },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #3f3f46', background: '#27272a', color: '#e4e4e7', fontSize: 14, marginBottom: 12, resize: 'vertical' },
  formActions: { display: 'flex', alignItems: 'center' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, background: '#18181b', borderRadius: 12, marginBottom: 8 },
  desc: { margin: '4px 0 0', color: '#a1a1aa', fontSize: 13 },
  itemActions: { display: 'flex', gap: 8 },
  smallBtn: { padding: '6px 12px', background: '#27272a', border: '1px solid #3f3f46', borderRadius: 6, color: '#e4e4e7', cursor: 'pointer', fontSize: 13 },
  smallBtnDanger: { padding: '6px 12px', background: 'transparent', border: '1px solid #dc2626', borderRadius: 6, color: '#f87171', cursor: 'pointer', fontSize: 13 },
  muted: { color: '#71717a', fontSize: 14 },
};
