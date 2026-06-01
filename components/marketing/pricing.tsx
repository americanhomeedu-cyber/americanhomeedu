import { Check, ShieldCheck } from 'lucide-react'

const FEATURES = [
  '7 модулей + бонус — от подготовки до ключей',
  'Видео-уроки на понятном русском языке',
  'Чек-листы для каждого этапа сделки',
  'Шаблоны вопросов агенту и кредитору',
  'Разбор mortgage, inspection и closing',
  'Бонус: стратегия создания капитала',
  'Обновления актуальные на 2026 год',
  'Доступ с любого устройства, навсегда',
]

export function Pricing({
  priceMajor,
  oldPriceLabel,
  ctaHref,
}: {
  priceMajor: number
  oldPriceLabel: string | null
  ctaHref: string
}) {
  return (
    <section className="section" id="pricing">
      <div className="wrap">
        <div className="price-card reveal">
          <span className="price-badge">🎉 Launch Price</span>
          {oldPriceLabel && <div className="price-old">{oldPriceLabel}</div>}
          <div className="price-now">
            <small>$</small>
            {priceMajor.toLocaleString('en-US')}
          </div>
          <p className="price-sub">Одноразовая оплата · доступ навсегда</p>
          <ul className="price-list">
            {FEATURES.map((f) => (
              <li key={f}>
                <span className="check">
                  <Check size={12} strokeWidth={3} />
                </span>{' '}
                {f}
              </li>
            ))}
          </ul>
          <a href={ctaHref} className="btn btn-gold btn-lg">
            Получить доступ сейчас
          </a>
          <p className="price-guarantee">
            <ShieldCheck size={18} /> 30-дневная гарантия возврата денег
          </p>
          <div className="pay-icons">
            <span className="pay">VISA</span>
            <span className="pay">MC</span>
            <span className="pay">AMEX</span>
            <span className="pay">Apple&nbsp;Pay</span>
          </div>
        </div>
      </div>
    </section>
  )
}
