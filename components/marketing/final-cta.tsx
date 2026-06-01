export function FinalCta({
  ctaHref,
  priceLabel,
}: {
  ctaHref: string
  priceLabel: string
}) {
  return (
    <section className="section final">
      <div className="wrap final-inner reveal">
        <span className="eyebrow center">Сделайте первый шаг</span>
        <h2>Ваш дом в Америке ближе, чем кажется</h2>
        <p>
          Каждый месяц промедления — это упущенная возможность зафиксировать ставку,
          цену и начать строить капитал. Начните разбираться сегодня.
        </p>
        <a href={ctaHref} className="btn btn-gold btn-lg">
          Начать курс — {priceLabel}
        </a>
        <p className="final-note">
          💳 Безопасная оплата через Stripe · мгновенный доступ · гарантия 30 дней
        </p>
      </div>
    </section>
  )
}
