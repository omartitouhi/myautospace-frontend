import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { useUI } from '../../lib/ui'
import { AppNav } from '../../components/app/AppNav'
import { Spinner } from '../../components/app/ui'

export function AppLayout() {
  const { isAuthenticated, profileStatus } = useAuth()
  const { t } = useUI()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const onWelcome = location.pathname === '/app/welcome'

  // The UserService profile is created after registration; until it exists,
  // funnel everything into onboarding.
  if (profileStatus === 'missing' && !onWelcome) {
    return <Navigate to="/app/welcome" replace />
  }
  if (profileStatus === 'ready' && onWelcome) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="app-shell">
      <AppNav />
      <main className="app-main wrap">
        {profileStatus === 'unknown' && !onWelcome ? (
          <Spinner label={t.app.common.loading} />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}
