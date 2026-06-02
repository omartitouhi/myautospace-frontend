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
            <a href="#" className="btn btn-primary btn-lg">
              {t.cta.primary} <Icon name="arrow" className="arrow" />
            </a>
            <a href="#" className="btn btn-ghost btn-lg">
              {t.cta.secondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
