import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { Icon } from '../../lib/Icon'
import { Brand } from '../Brand'

export function AppNav() {
  const { t, theme, toggleTheme, toggleLang } = useUI()
  const { profile, session, isSeller, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const a = t.app

  // Close the account menu on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : (session?.email?.[0] ?? '?').toUpperCase()

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="appnav-wrap">
      <nav className="appnav glass">
        <Brand />
        <div className="appnav-links">
          <NavLink to="/app" end>
            {a.nav.browse}
          </NavLink>
          {isSeller ? <NavLink to="/app/garage">{a.nav.garage}</NavLink> : null}
          <NavLink to="/app/notifications">{a.nav.notifications}</NavLink>
        </div>
        <div className="appnav-tools">
          {isSeller ? (
            <NavLink to="/app/sell" className="btn btn-primary btn-sm appnav-sell">
              <Icon name="plus" /> {a.nav.sell}
            </NavLink>
          ) : null}
          <button className="tool-btn" onClick={toggleTheme} aria-label={t.nav.switchTheme} title={t.nav.switchTheme}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <button className="tool-btn" onClick={toggleLang} aria-label={t.nav.switchLang} title={t.nav.switchLang}>
            {t.other}
          </button>
          <div className="account" ref={menuRef}>
            <button
              className="avatar-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={a.nav.profile}
            >
              {profile?.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt="" />
              ) : (
                <span>{initials}</span>
              )}
            </button>
            {menuOpen ? (
              <div className="menu glass" role="menu">
                <div className="menu-id">
                  <b>
                    {profile ? `${profile.firstName} ${profile.lastName}` : session?.email}
                  </b>
                  {profile ? <span>{session?.email}</span> : null}
                </div>
                <NavLink to="/app/profile" role="menuitem" onClick={() => setMenuOpen(false)}>
                  <Icon name="user" /> {a.nav.profile}
                </NavLink>
                <button role="menuitem" onClick={handleLogout}>
                  <Icon name="logout" /> {a.nav.signout}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  )
}
