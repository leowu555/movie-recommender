import { useEffect, useState } from 'react'
import './Toast.css'

function Toast() {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    function handleToast(event) {
      const { message, type } = event.detail
      setToast({ message, type, id: Date.now() })
    }

    window.addEventListener('app-toast', handleToast)
    return () => window.removeEventListener('app-toast', handleToast)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(timer)
  }, [toast])

  if (!toast) return null

  return (
    <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
      <span className="toast-icon" aria-hidden="true">
        {toast.type === 'success' ? '✓' : '!'}
      </span>
      {toast.message}
    </div>
  )
}

export default Toast
