// Import React's useState hook — lets this component remember values between renders
import { useState } from 'react'

// Your AWS Lambda Function URL (no trailing slash at the end)
const API_BASE_URL =
  'https://4stl3ctbxyz2fuuatqbyeiwpaa0mgyco.lambda-url.ca-central-1.on.aws'

function App() {
  // --- Search state ---
  const [query, setQuery] = useState('') // text in the search input
  const [results, setResults] = useState([]) // list of movies from search API
  const [loading, setLoading] = useState(false) // true while search request is in flight
  const [error, setError] = useState('') // search error message (empty string = no error)

  // --- Movie details state (shown when user clicks a search result) ---
  const [selectedMovieId, setSelectedMovieId] = useState(null) // TMDB id of clicked movie
  const [movieDetails, setMovieDetails] = useState(null) // full details object from API
  const [detailsLoading, setDetailsLoading] = useState(false) // true while details request runs
  const [detailsError, setDetailsError] = useState('') // details error message

  // Runs when user submits the search form
  async function handleSearch(event) {
    event.preventDefault() // stop browser from reloading the page on form submit

    const trimmed = query.trim() // remove extra spaces
    if (!trimmed) {
      setError('Please enter a movie title.')
      setResults([])
      return
    }

    setLoading(true) // show "Searching..." on the button
    setError('') // clear old search errors
    setMovieDetails(null) // hide old details when starting a new search
    setSelectedMovieId(null)
    setDetailsError('')

    try {
      // Build search URL: /api/movies/search?query=inception
      const url = `${API_BASE_URL}/api/movies/search?query=${encodeURIComponent(trimmed)}`
      const response = await fetch(url) // browser sends GET request to Lambda

      const data = await response.json() // parse JSON body into a JavaScript object

      if (!response.ok) {
        setError(data.error || 'Search failed.')
        setResults([])
        return
      }

      const movies = data.results || [] // API returns { results: [...] }
      console.log('Search results:', movies)
      setResults(movies) // save list so React re-renders the <ul>
    } catch (err) {
      console.error('Search request failed:', err)
      setError('Could not connect to API. Check the Lambda URL and CORS settings.')
      setResults([])
    } finally {
      setLoading(false) // always turn off loading, success or failure
    }
  }

  // Runs when user clicks a movie in the search results list
  async function handleMovieClick(movieId) {
    setSelectedMovieId(movieId) // remember which movie was clicked
    setDetailsLoading(true) // show loading text in details panel
    setDetailsError('')
    setMovieDetails(null) // clear previous movie details while loading

    try {
      // Build details URL: /api/movies/27205/  (27205 = TMDB movie id)
      const url = `${API_BASE_URL}/api/movies/${movieId}/`
      const response = await fetch(url)

      const data = await response.json()

      if (!response.ok) {
        setDetailsError(data.error || 'Could not load movie details.')
        return
      }

      console.log('Movie details:', data)
      setMovieDetails(data) // save details object → details panel appears below
    } catch (err) {
      console.error('Details request failed:', err)
      setDetailsError('Could not load movie details.')
    } finally {
      setDetailsLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Movie Search</h1>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)} // keep input in sync with query state
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
              cursor: 'pointer',
              background:
                selectedMovieId === movie.id ? '#f0f4ff' : 'transparent',
            }}
            onClick={() => handleMovieClick(movie.id)} // click → fetch details for this id
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
            <div style={{ marginTop: 6, fontSize: 12, color: '#555' }}>
              Click for full details
            </div>
          </li>
        ))}
      </ul>

      {/* Details panel — only shows content when user clicked a movie */}
      {(detailsLoading || movieDetails || detailsError) && (
        <section
          style={{
            marginTop: 24,
            padding: 16,
            border: '2px solid #333',
            borderRadius: 8,
          }}
        >
          <h2>Movie Details</h2>

          {detailsLoading && <p>Loading details...</p>}

          {detailsError && <p style={{ color: 'crimson' }}>{detailsError}</p>}

          {movieDetails && (
            <div>
              {movieDetails.poster_url && (
                <img
                  src={movieDetails.poster_url}
                  alt={movieDetails.title}
                  style={{ maxWidth: 200, display: 'block', marginBottom: 12 }}
                />
              )}
              <h3>{movieDetails.title}</h3>
              {movieDetails.release_date && (
                <p>
                  <strong>Release:</strong> {movieDetails.release_date}
                </p>
              )}
              {movieDetails.runtime != null && (
                <p>
                  <strong>Runtime:</strong> {movieDetails.runtime} min
                </p>
              )}
              {movieDetails.genres?.length > 0 && (
                <p>
                  <strong>Genres:</strong> {movieDetails.genres.join(', ')}
                </p>
              )}
              <p>{movieDetails.overview}</p>
            </div>
          )}
        </section>
      )}
    </main>
  )
}

export default App
