const RECENT_KEY = 'movie-recommender-recent'
const WATCHLIST_KEY = 'movie-recommender-watchlist'
const MAX_RECENT = 6

export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addRecentSearch(term) {
  const trimmed = term.trim()
  if (!trimmed) return

  const existing = getRecentSearches().filter(
    (s) => s.toLowerCase() !== trimmed.toLowerCase()
  )
  const updated = [trimmed, ...existing].slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
}

export function getWatchlist() {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function isInWatchlist(movieId) {
  return getWatchlist().some((m) => m.id === movieId)
}

export function toggleWatchlist(movie) {
  const list = getWatchlist()
  const index = list.findIndex((m) => m.id === movie.id)

  if (index >= 0) {
    list.splice(index, 1)
  } else {
    list.unshift({
      id: movie.id,
      title: movie.title,
      poster_url: movie.poster_url || null,
      release_date: movie.release_date || null,
    })
  }

  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event('watchlist-updated'))
  return list
}

export function removeFromWatchlist(movieId) {
  const updated = getWatchlist().filter((m) => m.id !== movieId)
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event('watchlist-updated'))
  return updated
}
