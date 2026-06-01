import { Check, X } from 'lucide-react'

const BEFORE = [
  'Страх и неопределённость на каждом этапе',
  'Зависимость от советов случайных людей',
  'Риск переплатить или попасть в плохую сделку',
]
const AFTER = [
  'Чёткое понимание каждого шага сделки',
  'Уверенность в собственных решениях',
  'Дом мечты по справедливой цене',
]

export function Transformation() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow center">О чём курс</span>
          <h2>От тревоги — к уверенности</h2>
          <p>
            Один и тот же путь ощущается совершенно по-разному, когда вы понимаете
            каждый шаг.
          </p>
        </div>
        <div className="transform-grid">
          <div className="tcol before reveal">
            <span className="t-tag">До курса</span>
            <h3>Покупка вслепую</h3>
            <ul className="tlist">
              {BEFORE.map((t) => (
                <li key={t}>
                  <span className="ti">
                    <X size={15} strokeWidth={2.5} />
                  </span>{' '}
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="tcol after reveal d1">
            <span className="t-tag">После курса</span>
            <h3>Покупка с контролем</h3>
            <ul className="tlist">
              {AFTER.map((t) => (
                <li key={t}>
                  <span className="ti">
                    <Check size={15} strokeWidth={3} />
                  </span>{' '}
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
