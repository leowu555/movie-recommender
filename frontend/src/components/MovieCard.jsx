import { useNavigate } from 'react-router-dom'
import { formatYear } from '../utils/format'

function MovieCard({ movie, index = 0 }) {
  const navigate = useNavigate()
  const year = formatYear(movie.release_date)

  return (
    <li
      className="poster-card movie-card-enter"
      style={{ animationDelay: `${Math.min(index, 8) * 0.06}s` }}
    >
      <button
        type="button"
        className="poster-card-hit"
        onClick={() => navigate(`/movie/${movie.id}`)}
        aria-label={`View ${movie.title}`}
      >
        <div className="poster-card-media">
          {movie.poster_url ? (
            <img src={movie.poster_url} alt="" loading="lazy" />
          ) : (
            <div className="poster-card-empty">No poster</div>
          )}
          {movie.vote_average > 0 && (
            <span className="poster-card-score">★ {Number(movie.vote_average).toFixed(1)}</span>
          )}
          <div className="poster-card-shade">
            <h2 className="poster-card-title">{movie.title}</h2>
            {year && <p className="poster-card-meta">{year}</p>}
          </div>
        </div>
      </button>
    </li>
  )
}

export default MovieCard
