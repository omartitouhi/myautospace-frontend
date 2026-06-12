/* Auth context: current session (tokens + identity) and profile state.
   Kept component-free for react-refresh/only-export-components; the matching
   <AuthProvider> lives in components/AuthProvider.jsx. */

import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
