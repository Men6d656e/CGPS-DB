import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ─── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      try {
        const res = await api.get('/auth/me')
        setUser(res.data)
      } catch {
        // Auto-login as Muhammad Nawaz if no session exists
        try {
          await api.post('/auth/login', { username: 'muhammadnawaz', password: '12345' })
          const res = await api.get('/auth/me')
          setUser(res.data)
        } catch {
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  // ─── Refresh user (re-fetch from /auth/me) ────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data)
    } catch {
      setUser(null)
    }
  }, [])

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    await api.post('/auth/login', { username, password })
    await refreshUser()
    return user
  }, [refreshUser, user])

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore errors on logout
    } finally {
      setUser(null)
      window.location.href = '/login'
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
