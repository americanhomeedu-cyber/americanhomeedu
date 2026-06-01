'use client'

import * as React from 'react'

// TODO(client): цифры — иллюстративные, заменить на реальные перед публикацией.
const STATS = [
  { target: 14, suffix: '+', label: 'лет в недвижимости' },
  { target: 500, suffix: '+', label: 'успешных сделок' },
  { target: 100, suffix: '+', label: 'relocation-клиентов' },
  { target: 4.9, suffix: '★', label: 'средняя оценка отзывов', decimal: 1 },
]

function Counter({
  target,
  suffix,
  decimal = 0,
}: {
  target: number
  suffix: string
  decimal?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [val, setVal] = React.useState(0)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const dur = 1400
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / dur)
          const eased = 1 - Math.pow(1 - p, 3)
          setVal(target * eased)
          if (p < 1) requestAnimationFrame(tick)
          else setVal(target)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target])

  const display = decimal ? val.toFixed(decimal) : Math.round(val).toString()
  const done = val >= target

  return (
    <div className="s-num" ref={ref}>
      {display}
      {done ? suffix : ''}
    </div>
  )
}

export function Stats() {
  return (
    <section className="section stats">
      <div className="wrap stats-grid">
        {STATS.map((s, i) => (
          <div key={s.label} className={`stat reveal${i ? ' d' + i : ''}`}>
            <Counter target={s.target} suffix={s.suffix} decimal={s.decimal} />
            <div className="s-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
