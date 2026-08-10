import { useNavigate } from 'react-router-dom'
import { formatYear } from '../utils/format'

function MovieCard({ movie, index = 0 }) {
  const navigate = useNavigate()
  const year = formatYear(movie.release_date)

  return (
    <li
      className="movie-card movie-card-enter"
      style={{ animationDelay: `${Math.min(index, 8) * 0.06}s` }}
    >
      <div className="movie-card-poster-wrap">
        {movie.poster_url ? (
          <img className="movie-card-poster" src={movie.poster_url} alt={movie.title} loading="lazy" />
        ) : (
          <div className="movie-card-poster-placeholder">No poster</div>
        )}
        {movie.vote_average > 0 && (
          <span className="movie-card-rating">★ {Number(movie.vote_average).toFixed(1)}</span>
        )}
      </div>
      <div className="movie-card-body">
        <h2 className="movie-card-title">
          {movie.title}
          {year && <span className="movie-card-year"> ({year})</span>}
        </h2>
        <p className="movie-card-overview">{movie.overview}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate(`/movie/${movie.id}`)}
        >
          View full details
        </button>
      </div>
    </li>
  )
}

export default MovieCard
