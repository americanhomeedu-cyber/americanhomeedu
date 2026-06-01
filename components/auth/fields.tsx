'use client'

import * as React from 'react'
import Link from 'next/link'
import { Check, Eye, EyeOff, Lock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export function pwState(v: string) {
  return { len: v.length >= 8, up: /[A-Z]/.test(v), num: /[0-9]/.test(v) }
}
export function pwScore(v: string) {
  const s = pwState(v)
  return (s.len ? 1 : 0) + (s.up ? 1 : 0) + (s.num ? 1 : 0)
}

type FieldBaseProps = {
  label: string
  id: string
  icon?: LucideIcon
  error?: string
  link?: { href: string; label: string }
  hint?: string
}

export function AuthField({
  label,
  id,
  icon: Icon,
  error,
  link,
  hint,
  type = 'text',
  ...props
}: FieldBaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="field">
      <div className="lbl-row">
        <label htmlFor={id}>{label}</label>
        {link && (
          <Link className="lnk" href={link.href}>
            {link.label}
          </Link>
        )}
      </div>
      <div className={`inp${Icon ? ' with-icon' : ''}`}>
        {Icon && <Icon className="lead" size={17} />}
        <input id={id} type={type} className={error ? 'err' : ''} {...props} />
      </div>
      {error && <div className="err-msg">{error}</div>}
      {hint && !error && <div className="hint">{hint}</div>}
    </div>
  )
}

export function PasswordField({
  label,
  id,
  name,
  error,
  showMeter,
  value,
  onValueChange,
  link,
  autoComplete,
}: {
  label: string
  id: string
  name: string
  error?: string
  showMeter?: boolean
  value?: string
  onValueChange?: (v: string) => void
  link?: { href: string; label: string }
  autoComplete?: string
}) {
  const [show, setShow] = React.useState(false)
  const v = value ?? ''
  const st = pwState(v)
  const score = pwScore(v)
  const reqs: Array<[keyof typeof st, string]> = [
    ['len', 'Минимум 8 символов'],
    ['up', 'Заглавная буква'],
    ['num', 'Цифра'],
  ]
  return (
    <div className="field">
      <div className="lbl-row">
        <label htmlFor={id}>{label}</label>
        {link && (
          <Link className="lnk" href={link.href}>
            {link.label}
          </Link>
        )}
      </div>
      <div className="inp with-icon">
        <Lock className="lead" size={17} />
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          className={error ? 'err' : ''}
          autoComplete={autoComplete}
          {...(onValueChange
            ? { value: v, onChange: (e) => onValueChange(e.target.value) }
            : {})}
        />
        <button
          type="button"
          className="toggle"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && <div className="err-msg">{error}</div>}
      {showMeter && (
        <>
          <div className={`pw-meter s${score}`}>
            <span className="seg" />
            <span className="seg" />
            <span className="seg" />
          </div>
          <ul className="pw-reqs">
            {reqs.map(([k, txt]) => (
              <li key={k} className={st[k] ? 'ok' : ''}>
                <span className="rq">
                  <Check size={10} />
                </span>
                {txt}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([])
  const chars = Array.from({ length: 6 }, (_, i) => value[i] ?? '')

  function setAt(i: number, ch: string) {
    const next = chars.slice()
    next[i] = ch
    onChange(next.join('').slice(0, 6))
  }

  return (
    <div className="otp">
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          inputMode="numeric"
          maxLength={1}
          value={c}
          disabled={disabled}
          autoFocus={i === 0}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, '').slice(-1)
            setAt(i, d)
            if (d && i < 5) refs.current[i + 1]?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !chars[i] && i > 0)
              refs.current[i - 1]?.focus()
          }}
          onPaste={(e) => {
            e.preventDefault()
            const p = e.clipboardData
              .getData('text')
              .replace(/\D/g, '')
              .slice(0, 6)
            if (p) {
              onChange(p)
              refs.current[Math.min(p.length, 5)]?.focus()
            }
          }}
        />
      ))}
    </div>
  )
}
