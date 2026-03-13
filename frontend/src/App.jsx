import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import { api } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const onLogin = () => setUser({});
  const onLogout = () => setUser(null);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Dashboard onLogout={onLogout} /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Auth onSuccess={onLogin} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
