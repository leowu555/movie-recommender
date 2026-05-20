import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../api'

function MovieDetailsPage() {
  const { movieId } = useParams()
  const [movieDetails, setMovieDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true)
      setError('')
      setMovieDetails(null)

      try {
        const url = `${API_BASE_URL}/api/movies/${movieId}`
        console.log('Fetching details:', url)
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
        })

        let data
        try {
          data = await response.json()
        } catch {
          setError(`Invalid response (status ${response.status}).`)
          return
        }

        if (!response.ok) {
          setError(data.error || `Could not load details (status ${response.status}).`)
          return
        }

        console.log('Movie details:', data)
        setMovieDetails(data)
      } catch (err) {
        console.error('Details request failed:', err)
        setError('Could not load movie details.')
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [movieId])

  return (
    <main style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: 16 }}>
        ← Back to search
      </Link>

      <h1>Movie Details</h1>

      {loading && <p>Loading details...</p>}

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {movieDetails && (
        <div>
          {movieDetails.poster_url && (
            <img
              src={movieDetails.poster_url}
              alt={movieDetails.title}
              style={{ maxWidth: 240, display: 'block', marginBottom: 16, borderRadius: 8 }}
            />
          )}
          <h2>{movieDetails.title}</h2>
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
    </main>
  )
}

export default MovieDetailsPage
