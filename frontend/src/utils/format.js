export function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} hr`
  return `${h} hr ${m} min`
}

export function formatYear(releaseDate) {
  if (!releaseDate) return null
  return releaseDate.slice(0, 4)
}
