'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Info, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { loginSchema } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { AuthField, PasswordField } from './fields'

export function LoginForm({ redirect }: { redirect?: string }) {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [serverError, setServerError] = React.useState('')
  const [needsConfirm, setNeedsConfirm] = React.useState(false)
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = React.useState(false)
  const lastEmail = React.useRef('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError('')
    setNeedsConfirm(false)
    setErrors({})

    // Read live DOM values via FormData. This captures browser autofill,
    // which react-hook-form can miss (it relies on change events that
    // autofill may not dispatch). Validate with zod directly — no resolver.
    const fd = new FormData(e.currentTarget)
    const values = {
      email: String(fd.get('email') ?? '').trim(),
      password: String(fd.get('password') ?? ''),
    }
    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      const fe: { email?: string; password?: string } = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'email' | 'password'
        if (key && !fe[key]) fe[key] = issue.message
      }
      setErrors(fe)
      return
    }

    lastEmail.current = parsed.data.email
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })
    setLoading(false)
    if (error) {
      if (/confirm/i.test(error.message)) {
        setNeedsConfirm(true)
        return
      }
      setServerError('Неверный email или пароль')
      return
    }
    router.push(redirect || '/dashboard')
    router.refresh()
  }

  async function resendConfirm() {
    const email = lastEmail.current
    if (!email) return
    await supabase.auth.resend({ type: 'signup', email })
    toast.info('Код подтверждения отправлен')
    router.push('/verify-email?email=' + encodeURIComponent(email))
  }

  return (
    <>
      <div className="auth-head">
        <h1>С возвращением</h1>
        <p>Войдите, чтобы продолжить обучение</p>
      </div>
      {serverError && (
        <div className="alert error">
          <AlertCircle size={17} />
          <div>{serverError}</div>
        </div>
      )}
      {needsConfirm && (
        <div className="alert info">
          <Info size={17} />
          <div>
            Email не подтверждён.{' '}
            <button
              type="button"
              onClick={resendConfirm}
              style={{ fontWeight: 700, textDecoration: 'underline' }}
            >
              Отправить код повторно
            </button>
          </div>
        </div>
      )}
      <form onSubmit={onSubmit} noValidate>
        <AuthField
          id="lEmail"
          name="email"
          label="Email"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />
        <PasswordField
          id="lPw"
          name="password"
          label="Пароль"
          autoComplete="current-password"
          error={errors.password}
          link={{ href: '/forgot-password', label: 'Забыли пароль?' }}
        />
        <div className="check-row">
          <input id="lRemember" type="checkbox" defaultChecked />
          <label htmlFor="lRemember">Запомнить меня</label>
        </div>
        <Button
          type="submit"
          variant="green"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Входим…' : 'Войти'}
        </Button>
      </form>
      <div className="auth-foot">
        Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
      </div>
    </>
  )
}
