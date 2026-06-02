import { useUI } from '../lib/ui'
import { Icon } from '../lib/Icon'

const NUMS = ['01', '02', '03', '04']

export function HowItWorks() {
  const { t } = useUI()
  return (
    <section className="section alt" id="how">
      <div className="wrap">
        <div className="sec-head center reveal">
          <div className="eyebrow">
            <span className="dot" /> {t.how.eyebrow}
          </div>
          <h2>{t.how.title}</h2>
          <p>{t.how.sub}</p>
        </div>
        <div className="steps">
          {t.how.steps.map((s, i) => (
            <div className="step reveal" key={i} style={{ '--i': i }}>
              <div className="step-num">{NUMS[i]}</div>
              <div className="step-ico">
                <Icon name={s.ic} />
              </div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
