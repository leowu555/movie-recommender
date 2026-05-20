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
      <h1 className="page-title">Movie Search</h1>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie..."
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {results.map((movie) => (
          <li key={movie.id} className="movie-card">
            {movie.poster_url ? (
              <img
                className="movie-card-poster"
                src={movie.poster_url}
                alt={movie.title}
              />
            ) : (
              <div
                className="movie-card-poster"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--text)',
                }}
              >
                No poster
              </div>
            )}
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
