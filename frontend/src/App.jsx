import { useState } from 'react'

const API_BASE_URL =
  'https://4stl3ctbxyz2fuuatqbyeiwpaa0mgyco.lambda-url.ca-central-1.on.aws'

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