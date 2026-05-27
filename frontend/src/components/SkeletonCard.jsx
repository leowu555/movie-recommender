function SkeletonCard() {
  return (
    <li className="movie-card movie-card-skeleton" aria-hidden="true">
      <div className="skeleton skeleton-poster" />
      <div className="movie-card-body">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-btn" />
      </div>
    </li>
  )
}

export default SkeletonCard
