import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import { clearWatchlist, getWatchlist, removeFromWatchlist } from '../utils/storage'
import { showToast } from '../utils/toast'
import './moviePages.css'

function WatchlistPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])

  usePageTitle('Watchlist')

  useEffect(() => {
    setItems(getWatchlist())
  }, [])

  function handleRemove(id, title) {
    setItems(removeFromWatchlist(id))
    showToast(`Removed "${title}" from watchlist`)
  }

  function handleClearAll() {
    if (!window.confirm('Clear your entire watchlist?')) return
    setItems(clearWatchlist())
    showToast('Watchlist cleared')
  }

  return (
    <div className="page">
      <section className="page-intro page-intro-row">
        <div>
          <h1 className="page-title">My Watchlist</h1>
          <p className="page-intro-text">
            Movies you saved to watch later. Stored on this device until accounts and
            PostgreSQL are added.
          </p>
        </div>
        {items.length > 0 && (
          <button type="button" className="btn btn-secondary" onClick={handleClearAll}>
            Clear all
          </button>
        )}
      </section>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">Empty seats</div>
          <p>Your watchlist is empty.</p>
          <p className="empty-state-hint">
            Open any movie and tap &ldquo;Add to watchlist&rdquo;.
          </p>
          <Link to="/" className="btn btn-primary empty-state-btn">
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
                  <img
                    src={movie.poster_url}
                    alt=""
                    className="watchlist-poster"
                    loading="lazy"
                  />
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
                onClick={() => handleRemove(movie.id, movie.title)}
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
