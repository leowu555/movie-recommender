import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import MovieDetailsPage from './pages/MovieDetailsPage'
import WatchlistPage from './pages/WatchlistPage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
