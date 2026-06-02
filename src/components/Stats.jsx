import { useUI } from '../lib/ui'
import { useCountUp } from '../lib/hooks'

function Stat({ to, decimals, prefix, suffix, label, idx }) {
  const [ref, val] = useCountUp(to, { decimals: decimals || 0 })
  return (
    <div className="stat reveal" style={{ '--i': idx }}>
      <div className="stat-num" ref={ref}>
        {prefix}
        {val}
        <span className="unit">{suffix}</span>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export function Stats() {
  const { t } = useUI()
  const labels = t.stats.labels
  return (
    <section className="section" id="stats">
      <div className="wrap">
        <div className="sec-head center reveal">
          <div className="eyebrow">
            <span className="dot" /> {t.stats.eyebrow}
          </div>
          <h2>{t.stats.title}</h2>
        </div>
        <div className="stats">
          <Stat to={48000} suffix="+" label={labels[0]} idx={0} />
          <Stat to={12500} suffix="+" label={labels[1]} idx={1} />
          <Stat to={850} suffix=" M DT+" label={labels[2]} idx={2} />
          <Stat to={9.2} decimals={1} suffix="/10" label={labels[3]} idx={3} />
        </div>
      </div>
    </section>
  )
}
