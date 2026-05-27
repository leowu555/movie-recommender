import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api'
import './moviePages.css'

function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  async function handleSearch(event) {
    event.preventDefault()

    const trimmed = query.trim()
    if (!trimmed) {
      setError('Please enter a movie title.')
      setResults([])
      return
    }

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
    } catch (err) {
      console.error('Search request failed:', err)
      setError('Could not connect to API. Check the Lambda URL and CORS settings.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <section className="hero">
        <p className="hero-eyebrow">Discover films</p>
        <h1 className="hero-title">Find your next favorite movie</h1>
        <p className="hero-subtitle">
          Search thousands of titles with real-time data from TMDB. Click any result
          for the full story.
        </p>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            className="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try Inception, Parasite, Barbie..."
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
      </section>

      {hasSearched && !loading && results.length > 0 && (
        <div className="results-header">
          <span className="results-count">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {hasSearched && !loading && results.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>No movies found. Try a different search term.</p>
        </div>
      )}

      <ul className="results-grid">
        {results.map((movie) => (
          <li key={movie.id} className="movie-card">
            <div className="movie-card-poster-wrap">
              {movie.poster_url ? (
                <img
                  className="movie-card-poster"
                  src={movie.poster_url}
                  alt={movie.title}
                />
              ) : (
                <div className="movie-card-poster-placeholder">No poster</div>
              )}
              {movie.vote_average > 0 && (
                <span className="movie-card-rating">
                  ★ {movie.vote_average.toFixed(1)}
                </span>
              )}
            </div>
            <div className="movie-card-body">
              <h2 className="movie-card-title">
                {movie.title}
                {movie.release_date && (
                  <span className="movie-card-year">
                    {' '}
                    ({movie.release_date.slice(0, 4)})
                  </span>
                )}
              </h2>
              <p className="movie-card-overview">{movie.overview}</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                View full details
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HomePage
