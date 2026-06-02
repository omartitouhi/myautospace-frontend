import { useUI } from '../lib/ui'
import { Icon } from '../lib/Icon'

// Bento layout: size class + per-row reveal stagger, by item index.
const SIZES = ['lg', 'md', 'sm', 'sm', 'sm']
const STAGGER = [0, 1, 0, 1, 2]

export function Features() {
  const { t } = useUI()
  return (
    <section className="section" id="features">
      <div className="wrap">
        <div className="sec-head reveal">
          <div className="eyebrow">
            <span className="dot" /> {t.features.eyebrow}
          </div>
          <h2>{t.features.title}</h2>
          <p>{t.features.sub}</p>
        </div>

        <div className="bento">
          {t.features.items.map((f, i) => (
            <div className={`feat ${SIZES[i]} reveal`} key={i} style={{ '--i': STAGGER[i] }}>
              <div className="feat-ico">
                <Icon name={f.ic} />
              </div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
