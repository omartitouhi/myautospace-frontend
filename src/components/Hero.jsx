import { Link } from 'react-router-dom'
import { useUI } from '../lib/ui'
import { Icon } from '../lib/Icon'

const LINE_DELAYS = ['300ms', '400ms', '500ms']

/* Full-bleed cinematic hero: the photo fills the viewport, graded into the
   page background by the scrim; everything else floats over it, centered. */
export function Hero() {
  const { t } = useUI()
  const h = t.hero

  return (
    <header className="hero">
      <div className="hero-bg" aria-hidden="true">
        <img src="/cars/hero.jpg" alt="" fetchPriority="high" />
        <div className="hero-scrim" />
      </div>

      <div className="wrap hero-center">
        <span className="hero-pill load-seq" style={{ '--d': '200ms' }}>
          <span className="dot" /> {h.eyebrow}
        </span>

        <h1>
          {h.h1.map((line, i) => (
            <span className="line" key={i}>
              <span style={{ '--d': LINE_DELAYS[i] }}>
                {line.em ? (
                  <>
                    {line.pre}
                    <em>{line.em}</em>
                  </>
                ) : (
                  line.text
                )}
              </span>
            </span>
          ))}
        </h1>

        <p className="hero-sub load-seq" style={{ '--d': '640ms' }}>
          {h.sub.map((seg, i) => (seg.s ? <strong key={i}>{seg.s}</strong> : <span key={i}>{seg.t}</span>))}
        </p>

        <div className="hero-ctas load-seq" style={{ '--d': '760ms' }}>
          <Link to="/app" className="btn btn-primary btn-lg">
            {t.cta.primary} <Icon name="arrow" className="arrow" />
          </Link>
          <Link to="/register" className="btn btn-ghost btn-lg">
            {t.cta.secondary}
          </Link>
        </div>
      </div>

      <div className="hero-chips load-seq" style={{ '--d': '900ms' }}>
        {h.chips.map((chip, i) => (
          <span key={i}>
            <Icon name={chip.ic} /> {chip.t}
          </span>
        ))}
      </div>
    </header>
  )
}
