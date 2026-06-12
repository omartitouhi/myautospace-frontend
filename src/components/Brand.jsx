/* Brand wordmark + logo glyph. */

import { Link } from 'react-router-dom'

export function Brand({ size }) {
  return (
    <Link to="/" className="brand" style={size ? { fontSize: size } : null} aria-label="MyAutoSpace home">
      <span className="mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 19L10.5 5M19 19L13.5 5" />
          <path d="M8.4 13h7.2" />
          <circle cx="12" cy="20" r="1.1" fill="var(--ink)" stroke="none" />
        </svg>
      </span>
      <b>My<span>Auto</span>Space</b>
    </Link>
  )
}
