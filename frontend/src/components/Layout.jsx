import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

function Layout({ children }) {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="app-logo">
          <span className="app-logo-icon" aria-hidden="true">
            🎬
          </span>
          <span className="app-logo-text">Movie Recommender</span>
        </Link>
        {!isHome && (
          <Link to="/" className="app-header-link">
            Search
          </Link>
        )}
      </header>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        <p>Powered by TMDB · Built with React & Django</p>
      </footer>
    </div>
  )
}

export default Layout
