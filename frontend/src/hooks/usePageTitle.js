import { useEffect } from 'react'

export function usePageTitle(title) {
  useEffect(() => {
    const base = 'Movie Recommender'
    document.title = title ? `${title} · ${base}` : base
    return () => {
      document.title = base
    }
  }, [title])
}
