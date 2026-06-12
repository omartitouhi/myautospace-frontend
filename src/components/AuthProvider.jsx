import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi, userApi, getSession, setSession, setSessionExpiredHandler, ApiError } from '../lib/api'
import { AuthContext } from '../lib/auth'

/* Session = AuthResponse from AuthService: { accessToken, refreshToken,
   expiresAt, userId, email, roles }. Profile = UserService profile, which is
   created separately after registration (404 until onboarding completes). */
export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => getSession())
  const [profile, setProfile] = useState(null)
  // 'unknown' until the first profile fetch resolves; then 'missing' | 'ready'.
  const [profileStatus, setProfileStatus] = useState('unknown')

  const applySession = useCallback((next) => {
    setSession(next)
    setSessionState(next)
    if (!next) {
      setProfile(null)
      setProfileStatus('unknown')
    }
  }, [])

  useEffect(() => {
    setSessionExpiredHandler(() => applySession(null))
    return () => setSessionExpiredHandler(null)
  }, [applySession])

  const refreshProfile = useCallback(async () => {
    try {
      const data = await userApi.getProfile()
      setProfile(data)
      setProfileStatus('ready')
      return data
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setProfile(null)
        setProfileStatus('missing')
        return null
      }
      throw err
    }
  }, [])

  // Load the profile once per signed-in session.
  useEffect(() => {
    if (!session) return
    let cancelled = false
    userApi
      .getProfile()
      .then((data) => {
        if (cancelled) return
        setProfile(data)
        setProfileStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setProfile(null)
          setProfileStatus('missing')
        } else {
          setProfileStatus('unknown')
        }
      })
    return () => {
      cancelled = true
    }
  }, [session])

  const value = useMemo(
    () => ({
      session,
      profile,
      profileStatus,
      isAuthenticated: !!session,
      roles: session?.roles ?? [],
      isSeller: (session?.roles ?? []).includes('Seller'),
      isAdmin: (session?.roles ?? []).includes('Admin'),

      login: async (email, password) => {
        const data = await authApi.login({ email, password })
        applySession(data)
        return data
      },
      register: async (body) => {
        const data = await authApi.register(body)
        applySession(data)
        return data
      },
      logout: async () => {
        const refreshToken = getSession()?.refreshToken
        applySession(null)
        if (refreshToken) {
          // Best effort — the local session is already gone.
          try {
            await authApi.logout(refreshToken)
          } catch {
            /* ignore */
          }
        }
      },
      refreshProfile,
      setProfile: (next) => {
        setProfile(next)
        setProfileStatus(next ? 'ready' : 'missing')
      },
    }),
    [session, profile, profileStatus, applySession, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
