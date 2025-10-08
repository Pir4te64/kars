import { useState, useEffect } from 'react'

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export function useAuth() {
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to load tokens from localStorage
    const storedTokens = localStorage.getItem('auth_tokens')
    if (storedTokens) {
      setTokens(JSON.parse(storedTokens))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) throw new Error('Login failed')

      const data = await response.json()
      const authTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }

      setTokens(authTokens)
      localStorage.setItem('auth_tokens', JSON.stringify(authTokens))

      return authTokens
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const refreshAccessToken = async () => {
    if (!tokens?.refreshToken) throw new Error('No refresh token')

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          refreshToken: tokens.refreshToken,
        },
      })

      if (!response.ok) throw new Error('Refresh failed')

      const data = await response.json()
      const newTokens = {
        accessToken: data.accessToken,
        refreshToken: tokens.refreshToken,
      }

      setTokens(newTokens)
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens))

      return newTokens
    } catch (error) {
      console.error('Refresh error:', error)
      // Clear tokens on refresh failure
      setTokens(null)
      localStorage.removeItem('auth_tokens')
      throw error
    }
  }

  const logout = () => {
    setTokens(null)
    localStorage.removeItem('auth_tokens')
  }

  return {
    tokens,
    loading,
    login,
    refreshAccessToken,
    logout,
  }
}
