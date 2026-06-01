'use client'

import * as React from 'react'

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

function rangeBg(val: number, min: number, max: number): React.CSSProperties {
  const p = ((val - min) / (max - min)) * 100
  return {
    background: `linear-gradient(90deg, var(--gold) ${p}%, var(--cream-deep) ${p}%)`,
  }
}

export function Calculator({ ctaHref }: { ctaHref: string }) {
  const [price, setPrice] = React.useState(420000)
  const [downPct, setDownPct] = React.useState(20)
  const [rate, setRate] = React.useState(6.5)
  const [term, setTerm] = React.useState(30)

  const downAmt = (price * downPct) / 100
  const loan = price - downAmt
  const r = rate / 100 / 12
  const n = term * 12
  const pi = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  const tax = (price * 0.011) / 12
  const ins = 250
  const total = pi + tax + ins

  return (
    <section className="section calc" id="calc">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow center">Попробуйте сами</span>
          <h2>Прикиньте свой ежемесячный платёж</h2>
          <p>
            Поиграйте с цифрами — в курсе мы разбираем каждую строку этого расчёта
            подробно.
          </p>
        </div>
        <div className="calc-shell reveal">
          <div className="calc-controls">
            <div className="calc-field">
              <div className="calc-field-top">
                <label htmlFor="cPrice">Цена дома</label>
                <span className="calc-val">{fmt(price)}</span>
              </div>
              <input
                type="range"
                className="calc-range"
                id="cPrice"
                min={150000}
                max={1200000}
                step={5000}
                value={price}
                style={rangeBg(price, 150000, 1200000)}
                onChange={(e) => setPrice(+e.target.value)}
              />
            </div>
            <div className="calc-field">
              <div className="calc-field-top">
                <label htmlFor="cDown">Первоначальный взнос</label>
                <span className="calc-val">
                  {downPct}% · {fmt(downAmt)}
                </span>
              </div>
              <input
                type="range"
                className="calc-range"
                id="cDown"
                min={3}
                max={50}
                step={1}
                value={downPct}
                style={rangeBg(downPct, 3, 50)}
                onChange={(e) => setDownPct(+e.target.value)}
              />
            </div>
            <div className="calc-field">
              <div className="calc-field-top">
                <label htmlFor="cRate">Ставка по кредиту</label>
                <span className="calc-val">{rate.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                className="calc-range"
                id="cRate"
                min={3}
                max={9}
                step={0.1}
                value={rate}
                style={rangeBg(rate, 3, 9)}
                onChange={(e) => setRate(+e.target.value)}
              />
            </div>
            <div className="calc-field">
              <div className="calc-field-top">
                <label>Срок кредита</label>
              </div>
              <div className="calc-seg">
                <button className={term === 15 ? 'active' : ''} onClick={() => setTerm(15)}>
                  15 лет
                </button>
                <button className={term === 30 ? 'active' : ''} onClick={() => setTerm(30)}>
                  30 лет
                </button>
              </div>
            </div>
          </div>
          <div className="calc-result">
            <span className="cr-label">Примерный платёж в месяц</span>
            <div className="cr-amount">
              {fmt(total)}
              <small>/мес</small>
            </div>
            <div className="calc-breakdown">
              <div className="cb-row">
                <span>
                  <span className="cb-dot" style={{ background: 'var(--gold)' }} />
                  Кредит (principal + interest)
                </span>
                <span>{fmt(pi)}</span>
              </div>
              <div className="cb-row">
                <span>
                  <span className="cb-dot" style={{ background: '#7FA38F' }} />
                  Налог на недвижимость
                </span>
                <span>{fmt(tax)}</span>
              </div>
              <div className="cb-row">
                <span>
                  <span className="cb-dot" style={{ background: '#B8965A' }} />
                  Страховка + HOA
                </span>
                <span>{fmt(ins)}</span>
              </div>
            </div>
            <p className="calc-note">
              Оценка для иллюстрации: налог ≈ 1.1%/год, страховка + HOA ≈ $250/мес.
              Реальные цифры зависят от штата и объекта.
            </p>
            <a href={ctaHref} className="btn btn-gold calc-cta">
              Научиться считать точно →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
