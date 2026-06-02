import { useScrolled } from '../lib/hooks'
import { useUI } from '../lib/ui'
import { Icon } from '../lib/Icon'
import { Brand } from './Brand'

export function Nav() {
  const scrolled = useScrolled()
  const { t, theme, toggleTheme, toggleLang } = useUI()
  const links = [t.nav.buy, t.nav.sell, t.nav.services, t.nav.how]

  return (
    <nav className={'nav' + (scrolled ? ' scrolled' : '')}>
      <div className="wrap nav-inner">
        <div className="load-seq" style={{ '--d': '60ms' }}>
          <Brand />
        </div>
        <div className="nav-links load-seq" style={{ '--d': '120ms' }}>
          {links.map((l) => (
            <a key={l} href="#">
              {l}
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
          <a href="#" className="signin">
            {t.nav.signin}
          </a>
          <a href="#" className="btn btn-primary">
            {t.nav.getStarted} <Icon name="arrow" className="arrow" />
          </a>
        </div>
      </div>
    </nav>
  )
}
