import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../api'

function HomePage() {
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
    <main style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Movie Search</h1>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie..."
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {results.map((movie) => (
          <li
            key={movie.id}
            style={{
              marginTop: 12,
              padding: 12,
              border: '1px solid #ddd',
              borderRadius: 8,
            }}
          >
            {movie.poster_url && (
              <img
                src={movie.poster_url}
                alt={movie.title}
                style={{ width: 80, float: 'left', marginRight: 12, borderRadius: 4 }}
              />
            )}
            <strong>{movie.title}</strong>
            {movie.release_date ? ` (${movie.release_date.slice(0, 4)})` : ''}
            <div style={{ marginTop: 4, fontSize: 14 }}>{movie.overview}</div>
            <Link
              to={`/movie/${movie.id}`}
              style={{
                display: 'inline-block',
                marginTop: 8,
                padding: '6px 12px',
              }}
            >
              View full details
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default HomePage
