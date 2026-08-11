import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { API_BASE_URL, authHeaders } from '../api'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import './moviePages.css'

function RecommendationsPage() {
  const { token, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [method, setMethod] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  usePageTitle('Recommendations')

  useEffect(() => {
    async function load() {
      if (!token) return
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/api/recommendations/`, {
          headers: authHeaders(token),
        })
        const data = await res.json()
        setResults(data.results || [])
        setMethod(data.method || '')
        setMessage(data.message || '')
      } catch {
        setMessage('Could not load recommendations.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (authLoading) return <div className="page"><p>Loading...</p></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="page">
      <section className="page-intro">
        <h1 className="page-title">Recommended for you</h1>
        <p className="page-intro-text">
          Powered by user-based collaborative filtering (scikit-learn cosine similarity)
          over ratings stored in PostgreSQL.
        </p>
        {method && (
          <p className="method-badge">Method: {method.replaceAll('_', ' ')}</p>
        )}
      </section>

      {loading && <p>Loading recommendations...</p>}
      {!loading && message && <p className="page-intro-text">{message}</p>}

      {!loading && results.length > 0 && (
        <ul className="results-grid">
          {results.map((movie) => (
            <li key={movie.movie_id} className="movie-card">
              <div className="movie-card-poster-wrap">
                {movie.poster_url ? (
                  <img className="movie-card-poster" src={movie.poster_url} alt={movie.title} />
                ) : (
                  <div className="movie-card-poster-placeholder">No poster</div>
                )}
              </div>
              <div className="movie-card-body">
                <h2 className="movie-card-title">{movie.title}</h2>
                <p className="movie-card-overview">{movie.reason}</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate(`/movie/${movie.movie_id}`)}
                >
                  View details
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && results.length === 0 && !message && (
        <div className="empty-state">
          <p>Rate a few movies first, then come back.</p>
          <Link to="/" className="btn btn-primary empty-state-btn">
            Search movies
          </Link>
        </div>
      )}
    </div>
  )
}

export default RecommendationsPage
