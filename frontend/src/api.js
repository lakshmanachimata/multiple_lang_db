const BASE = '';

const credentials = 'include';

export const api = {
  async register(body) {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Register failed');
    }
    return res.json();
  },

  async login(body) {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async logout() {
    await fetch(`${BASE}/api/auth/logout`, { method: 'POST', credentials });
  },

  async me() {
    const res = await fetch(`${BASE}/api/me`, { credentials });
    if (!res.ok) throw new Error('not authenticated');
    return res.json();
  },

  async getTasks() {
    const res = await fetch(`${BASE}/api/tasks`, { credentials });
    if (!res.ok) throw new Error('Failed to load tasks');
    return res.json();
  },

  async createTask(task) {
    const res = await fetch(`${BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials,
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  async updateTask(id, task) {
    const res = await fetch(`${BASE}/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials,
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async deleteTask(id) {
    const res = await fetch(`${BASE}/api/tasks/${id}`, { method: 'DELETE', credentials });
    if (!res.ok) throw new Error('Failed to delete task');
  },
};
