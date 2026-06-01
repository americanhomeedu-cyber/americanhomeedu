'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const PERIODS = [
  { id: 'today', label: 'Сегодня' },
  { id: '7', label: '7 дней' },
  { id: '30', label: '30 дней' },
  { id: '90', label: '90 дней' },
  { id: 'all', label: 'Всё время' },
]

export function PeriodSwitcher({ value }: { value: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function set(id: string) {
    const p = new URLSearchParams(Array.from(params.entries()))
    p.set('period', id)
    router.push(`${pathname}?${p.toString()}`)
  }

  return (
    <div className="seg">
      {PERIODS.map((p) => (
        <button
          key={p.id}
          className={value === p.id ? 'active' : ''}
          onClick={() => set(p.id)}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
