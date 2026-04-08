import { useState } from 'react'

function App() {
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
      const response = await fetch(
        `http://127.0.0.1:8000/api/movies/search/?query=${encodeURIComponent(trimmed)}`
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Search failed.')
        setResults([])
        return
      }

      setResults(data.results || [])
    } catch (err) {
      setError('Could not connect to backend. Is Django running?')
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

      <ul>
        {results.map((movie) => (
          <li key={movie.id} style={{ marginTop: 12 }}>
            <strong>{movie.title}</strong>
            {movie.release_date ? ` (${movie.release_date.slice(0, 4)})` : ''}
            <div>{movie.overview}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App