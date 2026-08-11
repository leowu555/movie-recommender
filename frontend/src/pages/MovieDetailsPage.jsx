import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_BASE_URL, authHeaders } from '../api'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatRuntime } from '../utils/format'
import { isInWatchlist, toggleWatchlist } from '../utils/storage'
import { showToast } from '../utils/toast'
import './moviePages.css'

function MovieDetailsPage() {
  const { movieId } = useParams()
  const { token, isAuthenticated } = useAuth()
  const [movieDetails, setMovieDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inWatchlist, setInWatchlist] = useState(false)
  const [myScore, setMyScore] = useState(0)
  const [ratingSaving, setRatingSaving] = useState(false)

  usePageTitle(movieDetails?.title)

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true)
      setError('')
      setMovieDetails(null)

      try {
        const url = `${API_BASE_URL}/api/movies/${movieId}`
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

        setMovieDetails(data)
        setInWatchlist(isInWatchlist(data.id))
      } catch (err) {
        console.error('Details request failed:', err)
        setError('Could not load movie details.')
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [movieId])

  useEffect(() => {
    async function loadMyRating() {
      if (!token || !movieId) {
        setMyScore(0)
        return
      }
      const res = await fetch(`${API_BASE_URL}/api/ratings/${movieId}/`, {
        headers: authHeaders(token),
      })
      if (!res.ok) return
      const data = await res.json()
      setMyScore(data.rated ? data.score : 0)
    }
    loadMyRating()
  }, [token, movieId])

  function handleWatchlistToggle() {
    if (!movieDetails) return
    const wasInList = inWatchlist
    toggleWatchlist(movieDetails)
    setInWatchlist(isInWatchlist(movieDetails.id))
    showToast(
      wasInList
        ? `Removed "${movieDetails.title}" from watchlist`
        : `Added "${movieDetails.title}" to watchlist`
    )
  }

  async function handleRate(score) {
    if (!isAuthenticated) {
      showToast('Log in to rate movies', 'error')
      return
    }
    if (!movieDetails) return
    setRatingSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/ratings/`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          movie_id: movieDetails.id,
          title: movieDetails.title,
          poster_url: movieDetails.poster_url,
          score,
        }),
      })
      if (!res.ok) throw new Error('Failed to save rating')
      setMyScore(score)
      showToast(`Rated "${movieDetails.title}" ${score}/5`)
    } catch {
      showToast('Could not save rating', 'error')
    } finally {
      setRatingSaving(false)
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast('Link copied to clipboard')
    } catch {
      showToast('Could not copy link', 'error')
    }
  }

  const runtimeLabel = movieDetails ? formatRuntime(movieDetails.runtime) : null
  const backdropStyle = movieDetails?.poster_url
    ? { backgroundImage: `url(${movieDetails.poster_url})` }
    : undefined

  return (
    <div className="page page-details">
      <div className="details-back">
        <Link to="/" className="btn btn-secondary">
          ← Back to search
        </Link>
      </div>

      {loading && (
        <div className="details-panel details-loading">
          <div className="spinner" aria-hidden="true" />
          <p>Loading movie details...</p>
        </div>
      )}

      {error && !loading && (
        <div className="details-panel details-loading">
          <p className="error-text" style={{ margin: 0 }}>
            {error}
          </p>
          <Link to="/" className="btn btn-ghost">
            Try another search
          </Link>
        </div>
      )}

      {movieDetails && !loading && (
        <>
          <div className="details-backdrop" style={backdropStyle} aria-hidden="true" />

          <article className="details-panel details-panel-animated">
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
                {movieDetails.tagline && (
                  <p className="details-tagline">&ldquo;{movieDetails.tagline}&rdquo;</p>
                )}

                <h1 className="details-title">{movieDetails.title}</h1>

                <div className="details-meta">
                  {movieDetails.vote_average > 0 && (
                    <span className="meta-chip meta-chip-accent">
                      <strong>Rating</strong> ★ {Number(movieDetails.vote_average).toFixed(1)}
                    </span>
                  )}
                  {movieDetails.release_date && (
                    <span className="meta-chip">
                      <strong>Released</strong> {movieDetails.release_date}
                    </span>
                  )}
                  {runtimeLabel && (
                    <span className="meta-chip">
                      <strong>Runtime</strong> {runtimeLabel}
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

                <div className="rating-box">
                  <p className="details-overview-label">Your rating</p>
                  {isAuthenticated ? (
                    <div className="star-row">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          className={`star-btn ${myScore >= score ? 'star-btn-active' : ''}`}
                          onClick={() => handleRate(score)}
                          disabled={ratingSaving}
                          aria-label={`Rate ${score} stars`}
                        >
                          ★
                        </button>
                      ))}
                      {myScore > 0 && <span className="my-score-label">{myScore}/5</span>}
                    </div>
                  ) : (
                    <p className="page-intro-text">
                      <Link to="/login">Log in</Link> to rate this movie and unlock
                      recommendations.
                    </p>
                  )}
                </div>

                <div className="details-actions">
                  <button
                    type="button"
                    className={`btn ${inWatchlist ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={handleWatchlistToggle}
                  >
                    {inWatchlist ? '✓ In watchlist' : '+ Add to watchlist'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCopyLink}>
                    Share link
                  </button>
                  <a
                    className="btn btn-ghost"
                    href={`https://www.themoviedb.org/movie/${movieDetails.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on TMDB ↗
                  </a>
                </div>

                <p className="details-overview-label">Synopsis</p>
                <p className="details-overview">
                  {movieDetails.overview || 'No overview available.'}
                </p>
              </div>
            </div>
          </article>
        </>
      )}
    </div>
  )
}

export default MovieDetailsPage
