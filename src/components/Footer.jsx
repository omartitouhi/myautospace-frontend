import { useUI } from '../lib/ui'
import { Icon } from '../lib/Icon'
import { Brand } from './Brand'

export function Footer() {
  const { t } = useUI()
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Brand />
            <p>{t.footer.tagline}</p>
            <form className="foot-news" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder={t.footer.news} aria-label="Email" />
              <button type="submit" aria-label="Subscribe">
                <Icon name="arrow" />
              </button>
            </form>
          </div>
          {t.footer.cols.map((col) => (
            <div className="foot-col" key={col.h}>
              <h4>{col.h}</h4>
              {col.links.map((l) => (
                <a key={l} href="#">
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="foot-bottom">
          <div>{t.footer.rights}</div>
          <div className="foot-social">
            <a href="#" aria-label="Twitter">
              <Icon name="tw" />
            </a>
            <a href="#" aria-label="Instagram">
              <Icon name="ig" />
            </a>
            <a href="#" aria-label="LinkedIn">
              <Icon name="li" />
            </a>
            <a href="#" aria-label="YouTube">
              <Icon name="yt" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
