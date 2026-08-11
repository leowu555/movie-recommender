import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { API_BASE_URL, authHeaders } from '../api'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import './moviePages.css'

function ProfilePage() {
  const { user, token, logout, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [ratings, setRatings] = useState([])

  usePageTitle('Profile')

  useEffect(() => {
    async function loadRatings() {
      if (!token) return
      const res = await fetch(`${API_BASE_URL}/api/ratings/`, {
        headers: authHeaders(token),
      })
      if (res.ok) {
        const data = await res.json()
        setRatings(data.results || [])
      }
    }
    loadRatings()
  }, [token])

  if (authLoading) return <div className="page"><p>Loading...</p></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="page">
      <section className="page-intro page-intro-row">
        <div>
          <h1 className="page-title">Hi, {user.username}</h1>
          <p className="page-intro-text">
            {user.email || 'No email set'} · Joined{' '}
            {new Date(user.date_joined).toLocaleDateString()} · {user.ratings_count} ratings
          </p>
        </div>
        <div className="profile-actions">
          <Link to="/recommendations" className="btn btn-primary">
            Recommendations
          </Link>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={async () => {
              await logout()
              navigate('/')
            }}
          >
            Log out
          </button>
        </div>
      </section>

      <h2 className="section-heading">Your ratings</h2>
      {ratings.length === 0 ? (
        <div className="empty-state">
          <p>No ratings yet. Open a movie and rate it 1–5 stars.</p>
          <Link to="/" className="btn btn-primary empty-state-btn">
            Search movies
          </Link>
        </div>
      ) : (
        <ul className="watchlist-grid">
          {ratings.map((rating) => (
            <li key={rating.id} className="watchlist-item">
              <button
                type="button"
                className="watchlist-item-main"
                onClick={() => navigate(`/movie/${rating.movie_id}`)}
              >
                {rating.poster_url ? (
                  <img src={rating.poster_url} alt="" className="watchlist-poster" />
                ) : (
                  <div className="watchlist-poster watchlist-poster-empty">?</div>
                )}
                <div className="watchlist-info">
                  <strong>{rating.title || `Movie #${rating.movie_id}`}</strong>
                  <span className="watchlist-year">{'★'.repeat(rating.score)}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ProfilePage
