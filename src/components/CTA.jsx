import { Link } from 'react-router-dom'
import { useUI } from '../lib/ui'
import { Icon } from '../lib/Icon'

export function CTA() {
  const { t } = useUI()
  return (
    <section className="section cta-band">
      <div className="wrap">
        <div className="cta-box reveal">
          <div className="aurora glow1" aria-hidden="true" />
          <h2>{t.cta.title}</h2>
          <p>{t.cta.sub}</p>
          <div className="cta-actions">
            <Link to="/app" className="btn btn-primary btn-lg">
              {t.cta.primary} <Icon name="arrow" className="arrow" />
            </Link>
            <Link to="/register" className="btn btn-ghost btn-lg">
              {t.cta.secondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
