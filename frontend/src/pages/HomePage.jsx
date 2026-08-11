import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { API_BASE_URL } from '../api'
import MovieCard from '../components/MovieCard'
import SkeletonCard from '../components/SkeletonCard'
import { usePageTitle } from '../hooks/usePageTitle'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [recentSearches, setRecentSearches] = useState([])

  usePageTitle(hasSearched && query ? `Search: ${query}` : null)

  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q && q.trim()) {
      runSearch(q, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runSearch(searchTerm, updateUrl = true) {
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

    if (updateUrl) {
      setSearchParams({ q: trimmed }, { replace: true })
    }

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
      setResults(movies)
      addRecentSearch(trimmed)
      setRecentSearches(getRecentSearches())
    } catch (err) {
      console.error('Search request failed:', err)
      const hint =
        window.location.origin.includes('127.0.0.1')
          ? ' Try opening http://localhost:5173 instead of 127.0.0.1.'
          : ''
      setError(
        `Could not connect to API.${hint} Open DevTools → Console for details. (${err.message || 'network error'})`
      )
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(event) {
    event.preventDefault()
    runSearch(query)
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setError('')
    setHasSearched(false)
    setSearchParams({}, { replace: true })
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
    <div className={`page${hasSearched ? ' page-searched' : ' page-landing'}`}>
      <section className={`hero theatre-hero${hasSearched ? ' theatre-hero-compact' : ''}`}>
        <div className="theatre-hero-screen" aria-hidden="true">
          <div className="theatre-hero-screen-inner">
            <span className="theatre-marquee-light" />
            <span className="theatre-marquee-light" />
            <span className="theatre-marquee-light" />
            <span className="theatre-marquee-light" />
            <span className="theatre-marquee-light" />
            <span className="theatre-marquee-light" />
          </div>
        </div>

        <p className="hero-brand">Movie Recommender</p>
        <h1 className="hero-title">
          {hasSearched ? 'What are we watching?' : 'Step into the theatre'}
        </h1>
        <p className="hero-subtitle">
          {hasSearched
            ? 'Refine your search or pick a title from the results below.'
            : 'Search live TMDB titles, rate what you love, and get recommendations that feel personal.'}
        </p>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrap">
            <input
              className="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try Inception, Parasite, Barbie..."
              aria-label="Search movies"
            />
            {query && (
              <button
                type="button"
                className="search-clear"
                onClick={handleClear}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="chip-groups">
          <div className="chip-group">
            <span className="chip-label">Now trending</span>
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

      {!hasSearched && !loading && (
        <section className="lobby-strip" aria-label="How it works">
          <p className="lobby-strip-title">Inside the lobby</p>
          <div className="lobby-marquee">
            <div className="lobby-marquee-track">
              <span>Live TMDB search</span>
              <span>Star ratings</span>
              <span>Collaborative filtering</span>
              <span>Personal watchlist</span>
              <span>AWS Lambda API</span>
              <span>Live TMDB search</span>
              <span>Star ratings</span>
              <span>Collaborative filtering</span>
              <span>Personal watchlist</span>
              <span>AWS Lambda API</span>
            </div>
          </div>
        </section>
      )}

      {loading && (
        <ul className="results-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </ul>
      )}

      {hasSearched && !loading && results.length > 0 && (
        <div className="results-toolbar">
          <span className="results-count">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
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
          <div className="empty-state-icon">No match</div>
          <p>No movies found for &ldquo;{query}&rdquo;.</p>
          <p className="empty-state-hint">Try a shorter title or check spelling.</p>
        </div>
      )}

      {!loading && sortedResults.length > 0 && (
        <ul className="results-grid">
          {sortedResults.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default HomePage
