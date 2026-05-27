import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getWatchlist, removeFromWatchlist } from '../utils/storage'
import './moviePages.css'

function WatchlistPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(getWatchlist())
  }, [])

  function handleRemove(id) {
    setItems(removeFromWatchlist(id))
  }

  return (
    <div className="page">
      <section className="page-intro">
        <h1 className="page-title">My Watchlist</h1>
        <p className="page-intro-text">
          Movies you saved to watch later. Stored on this device until you add accounts
          and a database.
        </p>
      </section>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍿</div>
          <p>Your watchlist is empty.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Search movies
          </Link>
        </div>
      ) : (
        <ul className="watchlist-grid">
          {items.map((movie) => (
            <li key={movie.id} className="watchlist-item">
              <button
                type="button"
                className="watchlist-item-main"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                {movie.poster_url ? (
                  <img src={movie.poster_url} alt="" className="watchlist-poster" />
                ) : (
                  <div className="watchlist-poster watchlist-poster-empty">?</div>
                )}
                <div className="watchlist-info">
                  <strong>{movie.title}</strong>
                  {movie.release_date && (
                    <span className="watchlist-year">
                      {movie.release_date.slice(0, 4)}
                    </span>
                  )}
                </div>
              </button>
              <button
                type="button"
                className="watchlist-remove"
                onClick={() => handleRemove(movie.id)}
                aria-label={`Remove ${movie.title} from watchlist`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default WatchlistPage
