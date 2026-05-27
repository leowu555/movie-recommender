import { useEffect, useMemo, useState } from 'react'
import { API_BASE_URL } from '../api'
import MovieCard from '../components/MovieCard'
import SkeletonCard from '../components/SkeletonCard'
import { addRecentSearch, getRecentSearches } from '../utils/storage'
import './moviePages.css'

const POPULAR_SEARCHES = ['Inception', 'Parasite', 'The Dark Knight', 'Barbie', 'Interstellar']

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'newest', label: 'Newest first' },
  { value: 'title', label: 'Title A–Z' },
]

function HomePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [recentSearches, setRecentSearches] = useState([])

  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  async function runSearch(searchTerm) {
    const trimmed = searchTerm.trim()
    if (!trimmed) {
      setError('Please enter a movie title.')
      setResults([])
      return
    }

    setQuery(trimmed)
    setLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const url = `${API_BASE_URL}/api/movies/search?query=${encodeURIComponent(trimmed)}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Search failed.')
        setResults([])
        return
      }

      const movies = data.results || []
      console.log('Search results:', movies)
      setResults(movies)
      addRecentSearch(trimmed)
      setRecentSearches(getRecentSearches())
    } catch (err) {
      console.error('Search request failed:', err)
      setError('Could not connect to API. Check the Lambda URL and CORS settings.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(event) {
    event.preventDefault()
    runSearch(query)
  }

  const sortedResults = useMemo(() => {
    const list = [...results]
    switch (sortBy) {
      case 'rating':
        return list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      case 'newest':
        return list.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''))
      case 'title':
        return list.sort((a, b) => a.title.localeCompare(b.title))
      default:
        return list
    }
  }, [results, sortBy])

  return (
    <div className="page">
      <section className="hero">
        <p className="hero-eyebrow">Discover films</p>
        <h1 className="hero-title">Find your next favorite movie</h1>
        <p className="hero-subtitle">
          Search thousands of titles with real-time data from TMDB. Save films to your
          watchlist and explore full details in one click.
        </p>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            className="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try Inception, Parasite, Barbie..."
            aria-label="Search movies"
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="chip-groups">
          <div className="chip-group">
            <span className="chip-label">Popular</span>
            <div className="chips">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="chip"
                  onClick={() => runSearch(term)}
                  disabled={loading}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {recentSearches.length > 0 && (
            <div className="chip-group">
              <span className="chip-label">Recent</span>
              <div className="chips">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="chip chip-muted"
                    onClick={() => runSearch(term)}
                    disabled={loading}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}
      </section>

      {loading && (
        <ul className="results-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </ul>
      )}

      {hasSearched && !loading && results.length > 0 && (
        <div className="results-toolbar">
          <span className="results-count">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
          <label className="sort-control">
            <span className="sort-label">Sort by</span>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {hasSearched && !loading && results.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>No movies found. Try a different search term.</p>
        </div>
      )}

      {!loading && sortedResults.length > 0 && (
        <ul className="results-grid">
          {sortedResults.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default HomePage
