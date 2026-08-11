import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getWatchlist } from '../utils/storage'
import TheatreAtmosphere from './TheatreAtmosphere'
import Toast from './Toast'
import './Layout.css'

function Layout({ children }) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const [watchlistCount, setWatchlistCount] = useState(() => getWatchlist().length)

  useEffect(() => {
    const updateCount = () => setWatchlistCount(getWatchlist().length)
    window.addEventListener('watchlist-updated', updateCount)
    return () => window.removeEventListener('watchlist-updated', updateCount)
  }, [])

  useEffect(() => {
    setWatchlistCount(getWatchlist().length)
  }, [location.pathname])

  const navLinkClass = (path) =>
    `app-nav-link${location.pathname === path ? ' app-nav-link-active' : ''}`

  return (
    <div className="app-shell">
      <TheatreAtmosphere />

      <header className="app-header">
        <Link to="/" className="app-logo">
          <span className="app-logo-mark" aria-hidden="true">
            <span className="app-logo-reel" />
          </span>
          <span className="app-logo-text">
            <span className="app-logo-brand">Movie Recommender</span>
            <span className="app-logo-tag">Now showing</span>
          </span>
        </Link>

        <nav className="app-nav" aria-label="Primary">
          <Link to="/" className={navLinkClass('/')}>
            Search
          </Link>
          <Link to="/watchlist" className={navLinkClass('/watchlist')}>
            Watchlist
            {watchlistCount > 0 && (
              <span className="nav-badge">{watchlistCount}</span>
            )}
          </Link>
          {isAuthenticated && (
            <Link to="/recommendations" className={navLinkClass('/recommendations')}>
              For You
            </Link>
          )}
          {isAuthenticated ? (
            <Link to="/profile" className={navLinkClass('/profile')}>
              {user?.username || 'Profile'}
            </Link>
          ) : (
            <Link to="/login" className={navLinkClass('/login')}>
              Log in
            </Link>
          )}
        </nav>
      </header>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        <div className="app-footer-inner">
          <p className="app-footer-tagline">Discover · Rate · Recommend</p>
          <p>Django · React · PostgreSQL · scikit-learn · TMDB · AWS Lambda</p>
          <div className="app-footer-links">
            <Link to="/">Search</Link>
            <Link to="/watchlist">Watchlist</Link>
            <Link to="/recommendations">For You</Link>
            <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
              TMDB ↗
            </a>
          </div>
        </div>
      </footer>

      <Toast />
    </div>
  )
}

export default Layout
