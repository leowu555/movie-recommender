import { useEffect, useRef } from 'react'
import './TheatreAtmosphere.css'

const DUST_COUNT = 28

function TheatreAtmosphere() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    let frame = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const onMove = (event) => {
      const { innerWidth, innerHeight } = window
      targetX = (event.clientX / innerWidth - 0.5) * 2
      targetY = (event.clientY / innerHeight - 0.5) * 2
    }

    const tick = () => {
      currentX += (targetX - currentX) * 0.06
      currentY += (targetY - currentY) * 0.06
      root.style.setProperty('--parallax-x', currentX.toFixed(4))
      root.style.setProperty('--parallax-y', currentY.toFixed(4))
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    frame = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="theatre-atmosphere" ref={rootRef} aria-hidden="true">
      <div className="theatre-screen-glow" />
      <div className="theatre-projector-beam theatre-projector-beam-main" />
      <div className="theatre-projector-beam theatre-projector-beam-soft" />
      <div className="theatre-curtains">
        <div className="theatre-curtain theatre-curtain-left" />
        <div className="theatre-curtain theatre-curtain-right" />
      </div>
      <div className="theatre-seats" />
      <div className="theatre-film-strip theatre-film-strip-left">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={`l-${i}`} className="theatre-film-frame" />
        ))}
      </div>
      <div className="theatre-film-strip theatre-film-strip-right">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={`r-${i}`} className="theatre-film-frame" />
        ))}
      </div>
      <div className="theatre-dust">
        {Array.from({ length: DUST_COUNT }).map((_, i) => (
          <span
            key={i}
            className="theatre-dust-mote"
            style={{
              '--dust-x': `${(i * 37) % 100}%`,
              '--dust-delay': `${(i % 12) * 0.7}s`,
              '--dust-duration': `${10 + (i % 8)}s`,
              '--dust-size': `${1 + (i % 3)}px`,
            }}
          />
        ))}
      </div>
      <div className="theatre-grain" />
      <div className="theatre-vignette" />
    </div>
  )
}

export default TheatreAtmosphere
