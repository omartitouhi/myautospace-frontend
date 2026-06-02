import { useUI } from '../lib/ui'
import { Icon } from '../lib/Icon'

export function Services() {
  const { t } = useUI()
  return (
    <section className="section alt" id="services">
      <div className="wrap">
        <div className="sec-head reveal">
          <div className="eyebrow">
            <span className="dot" /> {t.services.eyebrow}
          </div>
          <h2>{t.services.title}</h2>
          <p>{t.services.sub}</p>
        </div>
        <div className="svc-grid">
          {t.services.items.map((s, i) => (
            <div className="svc reveal" key={i} style={{ '--i': i }}>
              <div className="svc-ico">
                <Icon name={s.ic} />
              </div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
              <a href="#" className="svc-cta">
                {t.services.book} <Icon name="arrow" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
