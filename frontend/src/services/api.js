const API_BASE = '/api/v1';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  };

  // Only add Content-Type: application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If not on login page, clear token
    if (!window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}`;
    try {
      const text = await response.text();
      try {
        const errJson = JSON.parse(text);
        errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
      } catch {
        errorDetail = text || errorDetail;
      }
    } catch {
      // fallback to status
    }
    throw new Error(errorDetail || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body) => request(url, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  put: (url, body) => request(url, {
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  delete: (url) => request(url, { method: 'DELETE' }),
};
