// For interview/local demo: auth, ratings, recommendations need local Django + Postgres.
// Movie search/details also work against this local backend.
// To use Lambda again later, set VITE_API_BASE_URL in frontend/.env
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export function authHeaders(token) {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Token ${token}`
  return headers
}
