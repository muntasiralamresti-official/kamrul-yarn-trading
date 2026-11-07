const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();
const KEYS = [
  'kamrul-yarn-trading.commerce.v1',
  'kamrul-yarn-trading.accounts.v1',
  'kamrul-yarn-trading.hr.v1',
  'kamrul-yarn-trading.admin.v1',
  'kamrul-yarn-trading.personal.v1',
];

const cache = {};
const queues = {};

const request = async (key, options) => {
  const response = await fetch(`${API_URL}/state/${encodeURIComponent(key)}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('API server unreachable or returned non-JSON response. Please verify Vercel configuration.');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Server responded with ${response.status}.`);
  }
  return response.json();
};

const reportError = (error) => {
  window.dispatchEvent(new CustomEvent('remote-save-error', { detail: error.message }));
};

export const writeRemote = (key, data) => {
  cache[key] = JSON.stringify(data);
  // Serialize writes per key so the newest state always wins.
  queues[key] = (queues[key] || Promise.resolve())
    .then(() => request(key, { method: 'PUT', body: JSON.stringify({ data }) }))
    .then(() => window.dispatchEvent(new CustomEvent('remote-save-ok')))
    .catch(reportError);
};

export const readHydrated = (key) => cache[key] ?? null;

// Loads every module from MongoDB. Legacy browser data is migrated once if the database is empty.
export const hydrateAll = async () => {
  await Promise.all(KEYS.map(async (key) => {
    const { data } = await request(key, { method: 'GET' });
    if (data) {
      cache[key] = JSON.stringify(data);
      return;
    }
    const legacy = window.localStorage.getItem(key);
    if (legacy) {
      cache[key] = legacy;
      await request(key, { method: 'PUT', body: JSON.stringify({ data: JSON.parse(legacy) }) });
    }
  }));
};
