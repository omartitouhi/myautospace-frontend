import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUI } from '../lib/ui'
import { Icon } from '../lib/Icon'

// Language-neutral listing data (Tunisian market: cities, dealers, Dinar pricing).
// `fuel` is a key resolved through the active translation.
const LISTINGS = [
  { id: 'l1', img: '/cars/tesla.jpg', model: 'Tesla Model 3', price: '255 000 DT', year: '2023', km: '42 000 km', city: 'Tunis', fuel: 'electric', seller: 'Carthage Auto', score: '9.6' },
  { id: 'l2', img: '/cars/rav4.jpg', model: 'Toyota RAV4', price: '182 000 DT', year: '2022', km: '61 500 km', city: 'Sfax', fuel: 'hybrid', seller: 'Sfax Motors', score: '9.1' },
  { id: 'l3', img: '/cars/hyundai.jpg', model: 'Hyundai Accent', price: '72 500 DT', year: '2021', km: '78 200 km', city: 'Sousse', fuel: 'petrol', seller: 'Sahel Auto', score: '8.9' },
  { id: 'l4', img: '/cars/juke.jpg', model: 'Nissan Juke', price: '118 000 DT', year: '2022', km: '33 400 km', city: 'Ariana', fuel: 'petrol', seller: 'Ennasr Cars', score: '9.4' },
  { id: 'l5', img: '/cars/ford.jpg', model: 'Ford Explorer', price: '238 000 DT', year: '2021', km: '54 800 km', city: 'Nabeul', fuel: 'diesel', seller: 'Cap Bon Motors', score: '9.0' },
  { id: 'l6', img: '/cars/altima.jpg', model: 'Nissan Altima', price: '134 000 DT', year: '2020', km: '69 300 km', city: 'La Marsa', fuel: 'petrol', seller: 'Marsa Prestige', score: '9.2' },
]

function VCard({ d, idx, t }) {
  const [fav, setFav] = useState(false)
  return (
    <article className="vcard reveal" style={{ '--i': idx % 3 }}>
      <div className="vcard-media">
        <span className="vcard-badge">
          <Icon name="shieldCheck" /> {t.listings.verified}
        </span>
        <button
          className="vcard-fav"
          data-on={fav ? '1' : '0'}
          aria-label="Save"
          onClick={() => setFav((v) => !v)}
        >
          <Icon name="heart" />
        </button>
        <img src={d.img} alt={d.model} loading="lazy" />
        <div className="vcard-view">
          <Icon name="arrowUR" />
        </div>
      </div>
      <div className="vcard-body">
        <div className="vcard-top">
          <div className="vcard-title">{d.model}</div>
          <div className="vcard-price">{d.price}</div>
        </div>
        <div className="vcard-specs">
          <span>
            <Icon name="cal" /> {d.year}
          </span>
          <span>
            <Icon name="gauge" /> {d.km}
          </span>
          <span>
            <Icon name="fuel" /> {t.fuel[d.fuel]}
          </span>
          <span>
            <Icon name="pin" /> {d.city}
          </span>
        </div>
        <div className="vcard-foot">
          <div className="vcard-seller">
            <span className="ava" />
            {d.seller}
          </div>
          <div className="vcard-trust">
            <Icon name="star" /> {t.listings.trust} <b>{d.score}</b>
          </div>
        </div>
      </div>
    </article>
  )
}

export function Listings() {
  const { t } = useUI()
  return (
    <section className="section" id="listings">
      <div className="wrap">
        <div className="listings-head">
          <div className="sec-head reveal" style={{ marginBottom: 0 }}>
            <div className="eyebrow">
              <span className="dot" /> {t.listings.eyebrow}
            </div>
            <h2>{t.listings.title}</h2>
          </div>
          <Link to="/app" className="btn btn-ghost reveal" style={{ '--i': 1 }}>
            {t.listings.browse} <Icon name="arrow" className="arrow" />
          </Link>
        </div>
        <div className="listings-grid">
          {LISTINGS.map((d, i) => (
            <VCard key={d.id} d={d} idx={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
