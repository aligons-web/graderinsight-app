const API_URL = '';

let authToken: string | null = localStorage.getItem('authToken');

export function setAuthToken(token: string) {
  authToken = token;
  localStorage.setItem('authToken', token);
}

export function clearAuthToken() {
  authToken = null;
  localStorage.removeItem('authToken');
}

export function getAuthToken() {
  return authToken;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    window.location.href = '/login';
  }

  return response;
}

export const api = {
  // Auth
  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  getProfile: async () => {
    const res = await fetchWithAuth('/api/auth/me');
    return res.json();
  },

  // Subscription
  getSubscription: async () => {
    const res = await fetchWithAuth('/api/subscription');
    return res.json();
  },

  upgradeSubscription: async (tier: string) => {
    const res = await fetchWithAuth('/api/subscription/upgrade', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    });
    return res.json();
  },
};