import { Check, X, Minus } from 'lucide-react'

type Cell = 'yes' | 'no' | 'partial' | string

function CIcon({ v }: { v: Cell }) {
  if (v === 'yes')
    return (
      <span className="ci yes">
        <Check size={14} strokeWidth={3} />
      </span>
    )
  if (v === 'no')
    return (
      <span className="ci no">
        <X size={14} strokeWidth={3} />
      </span>
    )
  if (v === 'partial')
    return (
      <span className="ci partial">
        <Minus size={14} strokeWidth={3} />
      </span>
    )
  return <span className="c-text-no">{v}</span>
}

export function Comparison({ priceLabel }: { priceLabel: string }) {
  const rows: Array<{ f: string; yt: Cell; cons: Cell; course: Cell }> = [
    { f: 'Структура и порядок', yt: 'no', cons: 'partial', course: 'yes' },
    { f: 'Объяснения на русском', yt: 'partial', cons: 'partial', course: 'yes' },
    { f: 'Практика именно для США', yt: 'partial', cons: 'yes', course: 'yes' },
    { f: 'Чек-листы и шаблоны', yt: 'no', cons: 'no', course: 'yes' },
    { f: 'Цена', yt: 'Бесплатно, но хаос', cons: '$200–400 / час', course: `${priceLabel} — навсегда` },
    { f: 'Актуальность 2026', yt: 'partial', cons: 'yes', course: 'yes' },
  ]

  return (
    <section className="section compare">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow center">Почему этот курс</span>
          <h2>Почему курс, а не YouTube</h2>
          <p>
            Сравните, как иначе можно разбираться в покупке дома — и что вы получаете
            здесь.
          </p>
        </div>
        <div className="compare-table reveal">
          <div className="compare-row head">
            <div className="ch-feature">Что важно</div>
            <div>YouTube</div>
            <div>Консультант&nbsp;$$$</div>
            <div className="ch-course">Этот курс</div>
          </div>
          {rows.map((r) => (
            <div className="compare-row" key={r.f}>
              <div className="c-feature">{r.f}</div>
              <div>
                <CIcon v={r.yt} />
              </div>
              <div>
                <CIcon v={r.cons} />
              </div>
              <div className="c-course">
                <CIcon v={r.course} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
