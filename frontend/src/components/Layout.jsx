import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getWatchlist } from '../utils/storage'
import './Layout.css'

function Layout({ children }) {
  const location = useLocation()
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
      <header className="app-header">
        <Link to="/" className="app-logo">
          <span className="app-logo-icon" aria-hidden="true">
            🎬
          </span>
          <span className="app-logo-text">Movie Recommender</span>
        </Link>

        <nav className="app-nav">
          <Link to="/" className={navLinkClass('/')}>
            Search
          </Link>
          <Link to="/watchlist" className={navLinkClass('/watchlist')}>
            Watchlist
            {watchlistCount > 0 && (
              <span className="nav-badge">{watchlistCount}</span>
            )}
          </Link>
        </nav>
      </header>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        <p>Powered by TMDB · Built with React & Django</p>
      </footer>
    </div>
  )
}

export default Layout
