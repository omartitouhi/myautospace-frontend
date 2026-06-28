/* Preview wrapper for Claude Design cards: gives components the same context the
   real app provides — react-router (for <Link>/useNavigate), the UI provider
   (useUI: translations + theme tokens) and the auth provider (useAuth). Pointed
   at by cfg.provider.component. No live session/API, so data-backed widgets
   render their empty/loading state rather than crashing. */
import { MemoryRouter } from 'react-router-dom'
import { UIProvider } from '../src/components/UIProvider'
import { AuthProvider } from '../src/components/AuthProvider'

export function DesignPreviewProvider({ children }) {
  return (
    <MemoryRouter>
      <UIProvider>
        <AuthProvider>{children}</AuthProvider>
      </UIProvider>
    </MemoryRouter>
  )
}
