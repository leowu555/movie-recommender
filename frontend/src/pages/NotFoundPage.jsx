import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import './moviePages.css'

function NotFoundPage() {
  usePageTitle('Page not found')

  return (
    <div className="page">
      <div className="empty-state not-found-state">
        <div className="empty-state-icon">🎞️</div>
        <h1 className="page-title">Page not found</h1>
        <p className="page-intro-text" style={{ margin: '0 auto' }}>
          That URL doesn&apos;t exist. Head back to search or check your watchlist.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Go to search
          </Link>
          <Link to="/watchlist" className="btn btn-secondary">
            My watchlist
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
