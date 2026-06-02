import { useState } from 'react'
import { usePointerParallax, useScrollParallax } from '../lib/hooks'
import { useUI } from '../lib/ui'
import { Icon } from '../lib/Icon'

const LINE_DELAYS = ['300ms', '400ms', '500ms']

export function Hero() {
  const { t } = useUI()
  const [mode, setMode] = useState('buy')
  const stageRef = usePointerParallax()
  const carRef = useScrollParallax(0.05)

  const h = t.hero
  const fields = h.fields[mode]

  return (
    <header className="hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="grid-lines" />
        <div className="aurora a1" />
        <div className="aurora a2" />
        <div className="aurora a3" />
      </div>

      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="eyebrow load-seq" style={{ '--d': '240ms' }}>
            <span className="dot" /> {h.eyebrow}
          </div>

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

          <div className="searchbar load-seq" style={{ '--d': '740ms', flexDirection: 'column' }}>
            <div className="search-modes">
              {h.modes.map((m) => (
                <button
                  key={m.id}
                  className="search-mode"
                  data-on={mode === m.id ? '1' : '0'}
                  onClick={() => setMode(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <div className="search-fields">
                {fields.map(([label, ph], i) => (
                  <div className="search-field" key={i}>
                    <label>{label}</label>
                    <input placeholder={ph} aria-label={label} />
                  </div>
                ))}
              </div>
              <button className="search-go" aria-label="Search">
                <Icon name="search" />
              </button>
            </div>
          </div>

          <div className="hero-chips load-seq" style={{ '--d': '840ms' }}>
            {h.chips.map((chip, i) => (
              <span key={i}>
                <Icon name={chip.ic} /> {chip.t}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-stage" ref={stageRef}>
            <div className="hero-car" data-depth="0.4" ref={carRef}>
              <img src="/cars/hero.jpg" alt="A clean everyday car by the sea" fetchPriority="high" />
            </div>
            <div className="hero-glow" />

            <div className="fcard fc-verified" data-depth="1.4" style={{ '--d': '1000ms' }}>
              <div className="fc-row">
                <span className="fc-ico">
                  <Icon name="shieldCheck" />
                </span>
                <div>
                  <div className="fc-k">{h.fc.inspection}</div>
                  <div className="fc-v">{h.fc.inspectionValue}</div>
                </div>
              </div>
            </div>

            <div className="fcard fc-trust" data-depth="1.8" style={{ '--d': '1140ms' }}>
              <div className="fc-k">{h.fc.trust}</div>
              <div className="fc-v" style={{ marginTop: 3 }}>
                9.4 <span style={{ color: 'var(--dim)', fontSize: 13, fontWeight: 500 }}>/ 10</span>
              </div>
              <div className="fc-score-bar">
                <i />
              </div>
            </div>

            <div className="fcard fc-price" data-depth="1.1" style={{ '--d': '1260ms' }}>
              <div className="fc-row">
                <span className="fc-ico">
                  <Icon name="bolt" />
                </span>
                <div>
                  <div className="fc-k">{h.fc.listed}</div>
                  <div className="fc-v">{h.fc.price}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
