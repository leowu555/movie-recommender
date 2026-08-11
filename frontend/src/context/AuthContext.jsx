import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { API_BASE_URL, authHeaders } from '../api'

const AuthContext = createContext(null)
const TOKEN_KEY = 'movie-recommender-token'
const USER_KEY = 'movie-recommender-user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    async function loadMe() {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me/`, {
          headers: authHeaders(token),
        })
        if (!res.ok) throw new Error('session expired')
        const data = await res.json()
        setUser(data)
        localStorage.setItem(USER_KEY, JSON.stringify(data))
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    loadMe()
  }, [token])

  async function register(username, email, password) {
    const res = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ username, email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      const message =
        data.username?.[0] || data.password?.[0] || data.error || 'Registration failed'
      throw new Error(message)
    }
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function login(username, password) {
    const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function logout() {
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout/`, {
          method: 'POST',
          headers: authHeaders(token),
        })
      } catch {
        // ignore network logout errors
      }
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ token, user, loading, register, login, logout, isAuthenticated: Boolean(token) }),
    [token, user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
