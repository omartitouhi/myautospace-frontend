import { useUI } from '../lib/ui'

export function Marquee() {
  const { t } = useUI()
  const text = t.marquee.join('  ')
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  )
}
