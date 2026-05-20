const API_BASE = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function setUser(user) {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  else localStorage.removeItem('user');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  getToken,
  setToken,
  getUser,
  setUser,
  clearAuth() {
    setToken(null);
    setUser(null);
  },

  getNeighborhoods() {
    return request('/meta/neighborhoods');
  },

  register(body) {
    return request('/auth/register', { method: 'POST', body: JSON.stringify(body) });
  },
  login(body) {
    return request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
  },
  forgotPassword(email) {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  resetPassword(token, password) {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  getActivityTypes() {
    return request('/activity-types');
  },
  createActivityType(name) {
    return request('/activity-types', { method: 'POST', body: JSON.stringify({ name }) });
  },

  getHabits(days = 14) {
    return request(`/habits?days=${days}`);
  },
  createHabit(body) {
    return request('/habits', { method: 'POST', body: JSON.stringify(body) });
  },
  updateHabit(id, body) {
    return request(`/habits/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },
  deleteHabit(id) {
    return request(`/habits/${id}`, { method: 'DELETE' });
  },
  logHabit(id, date, completed) {
    const body = { date };
    if (completed !== undefined) body.completed = completed;
    return request(`/habits/${id}/log`, { method: 'POST', body: JSON.stringify(body) });
  },

  getMatches() {
    return request('/matches');
  },

  getForum() {
    return request('/forum');
  },
  createForumPost(body) {
    return request('/forum', { method: 'POST', body: JSON.stringify(body) });
  },
  updateForumPost(id, body) {
    return request(`/forum/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },
  deleteForumPost(id) {
    return request(`/forum/${id}`, { method: 'DELETE' });
  },
  getForumComments(postId) {
    return request(`/forum/${postId}/comments`);
  },
  createForumComment(postId, body) {
    return request(`/forum/${postId}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
  },
  deleteForumComment(postId, commentId) {
    return request(`/forum/${postId}/comments/${commentId}`, { method: 'DELETE' });
  },

  getMessages(matchId) {
    return request(`/messages/${matchId}`);
  },
  sendMessage(matchId, body) {
    return request(`/messages/${matchId}`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  },

  getSleep(days = 14) {
    return request(`/sleep?days=${days}`);
  },
  saveSleep(body) {
    return request('/sleep', { method: 'POST', body: JSON.stringify(body) });
  },

  createReport(body) {
    return request('/reports', { method: 'POST', body: JSON.stringify(body) });
  },
  getReports(status = null) {
    const url = status ? `/reports?status=${status}` : '/reports';
    return request(url);
  },
  reviewReport(reportId, status) {
    return request(`/reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};
