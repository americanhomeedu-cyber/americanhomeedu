import { HelpCircle, Shield, AlignLeft, UserX } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const PAINS: Array<{ icon: LucideIcon; title: string; text: string; delay?: string }> = [
  {
    icon: HelpCircle,
    title: 'Не понимаю, с чего начать покупку дома',
    text: 'Десятки шагов, незнакомые термины и ни одного понятного источника на русском.',
  },
  {
    icon: Shield,
    title: 'Боюсь, что меня обманут или я что-то упущу',
    text: 'Слишком большие деньги на кону, чтобы доверять интуиции и случайным советам.',
    delay: 'd1',
  },
  {
    icon: AlignLeft,
    title: 'Запутался в mortgage, escrow и inspections',
    text: 'Каждый этап — новая стопка документов и решений, в которых легко ошибиться.',
  },
  {
    icon: UserX,
    title: 'Не доверяю агентам и хочу разобраться сам',
    text: 'Хочется понимать процесс настолько, чтобы контролировать сделку, а не зависеть от других.',
    delay: 'd1',
  },
]

export function PainPoints() {
  return (
    <section className="section" id="about-course">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow center">Это для вас, если</span>
          <h2>Знакомая ситуация?</h2>
        </div>
        <div className="pain-grid">
          {PAINS.map(({ icon: Icon, title, text, delay }) => (
            <div key={title} className={`pain-card reveal${delay ? ' ' + delay : ''}`}>
              <span className="pain-ic">
                <Icon size={26} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="pain-foot reveal">Этот курс создан именно для вас.</p>
      </div>
    </section>
  )
}
