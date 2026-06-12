import { Link } from 'react-router-dom'
import { useScrolled } from '../lib/hooks'
import { useUI } from '../lib/ui'
import { useAuth } from '../lib/auth'
import { Icon } from '../lib/Icon'
import { Brand } from './Brand'

export function Nav() {
  const scrolled = useScrolled()
  const { t, theme, toggleTheme, toggleLang } = useUI()
  const { isAuthenticated } = useAuth()
  const links = [
    [t.nav.buy, '#listings'],
    [t.nav.services, '#services'],
    [t.nav.how, '#how'],
  ]

  return (
    <nav className={'nav' + (scrolled ? ' scrolled' : '')}>
      <div className="wrap nav-shell">
        <div className="nav-inner glass">
          <div className="load-seq" style={{ '--d': '60ms' }}>
            <Brand />
          </div>
          <div className="nav-links load-seq" style={{ '--d': '120ms' }}>
            {links.map(([label, href]) => (
              <a key={label} href={href}>
                {label}
              </a>
            ))}
          </div>
          <div className="nav-cta load-seq" style={{ '--d': '180ms' }}>
            <div className="nav-tools">
              <button className="tool-btn" onClick={toggleTheme} aria-label={t.nav.switchTheme} title={t.nav.switchTheme}>
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
              </button>
              <button className="tool-btn" onClick={toggleLang} aria-label={t.nav.switchLang} title={t.nav.switchLang}>
                {t.other}
              </button>
            </div>
            {isAuthenticated ? (
              <Link to="/app" className="btn btn-primary">
                {t.app.nav.openApp} <Icon name="arrow" className="arrow" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="signin">
                  {t.nav.signin}
                </Link>
                <Link to="/register" className="btn btn-primary">
                  {t.nav.getStarted} <Icon name="arrow" className="arrow" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
