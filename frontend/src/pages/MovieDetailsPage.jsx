import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../api'
import './moviePages.css'

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
    <div className="page">
      <div className="details-back">
        <Link to="/" className="btn btn-secondary">
          ← Back to search
        </Link>
      </div>

      {loading && (
        <div className="details-panel details-loading">Loading movie details...</div>
      )}

      {error && (
        <div className="details-panel details-loading">
          <p className="error-text" style={{ margin: 0 }}>
            {error}
          </p>
        </div>
      )}

      {movieDetails && (
        <article className="details-panel">
          <div className="details-hero">
            <div className="details-poster-wrap">
              {movieDetails.poster_url ? (
                <img
                  className="details-poster"
                  src={movieDetails.poster_url}
                  alt={`${movieDetails.title} poster`}
                />
              ) : (
                <div className="details-poster-placeholder">No poster available</div>
              )}
            </div>

            <div className="details-content">
              <h1 className="details-title">{movieDetails.title}</h1>

              <div className="details-meta">
                {movieDetails.release_date && (
                  <span className="details-meta-item">
                    <strong>Release:</strong> {movieDetails.release_date}
                  </span>
                )}
                {movieDetails.runtime != null && (
                  <span className="details-meta-item">
                    <strong>Runtime:</strong> {movieDetails.runtime} min
                  </span>
                )}
              </div>

              {movieDetails.genres?.length > 0 && (
                <div className="genre-list">
                  {movieDetails.genres.map((genre) => (
                    <span key={genre} className="genre-pill">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <p className="details-overview">{movieDetails.overview}</p>
            </div>
          </div>
        </article>
      )}
    </div>
  )
}

export default MovieDetailsPage
