'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Mail, Phone, User } from 'lucide-react'
import { toast } from 'sonner'
import { registerSchema } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics/track'
import { Button } from '@/components/ui/button'
import { AUTH } from '@/lib/constants'
import { AuthField, PasswordField, OtpInput } from './fields'

type FieldErrors = Partial<
  Record<'fullName' | 'email' | 'phone' | 'password' | 'terms', string>
>

export function RegisterForm() {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [step, setStep] = React.useState<'form' | 'code'>('form')
  const [email, setEmail] = React.useState('')
  const [serverError, setServerError] = React.useState('')
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [pw, setPw] = React.useState('')
  const [code, setCode] = React.useState('')
  const [verifying, setVerifying] = React.useState(false)
  const [codeError, setCodeError] = React.useState('')
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (String(fd.get('website') ?? '')) return // honeypot: bot trap
    setServerError('')
    setErrors({})

    const values = {
      fullName: String(fd.get('fullName') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      password: String(fd.get('password') ?? ''),
      terms: fd.get('terms') === 'on',
    }
    const parsed = registerSchema.safeParse(values)
    if (!parsed.success) {
      const fe: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors
        if (key && !fe[key]) fe[key] = issue.message
      }
      setErrors(fe)
      return
    }

    setSubmitting(true)
    track('register_start')
    const { data: res, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.fullName, phone: parsed.data.phone },
      },
    })
    setSubmitting(false)
    if (error) {
      const code = (error as { code?: string }).code
      if (code === 'user_already_exists' || /already.*regist/i.test(error.message)) {
        setServerError('Этот email уже зарегистрирован. Войдите или восстановите пароль на странице входа.')
      } else {
        setServerError(error.message)
      }
      return
    }
    setEmail(parsed.data.email)
    track('register_success')
    // Confirm email OFF -> session exists -> straight to dashboard.
    if (res.session) {
      router.push('/dashboard')
      router.refresh()
      return
    }
    setStep('code')
  }

  async function verify() {
    if (code.length !== AUTH.otpLength) return
    setVerifying(true)
    setCodeError('')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    })
    setVerifying(false)
    if (error) {
      setCodeError(
        'Код неверный или устарел. Нажмите «Отправить повторно» и введите код из самого свежего письма.',
      )
      setCode('')
      return
    }
    toast.success('Email подтверждён')
    router.push('/dashboard')
    router.refresh()
  }

  async function resend() {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) {
      toast.error(error.message)
      return
    }
    // A new code invalidates all previous ones — clear the field so the user
    // doesn't accidentally submit a stale code from an older email.
    setCode('')
    setCodeError('')
    toast.info('Новый код отправлен — введите код из последнего письма')
    setCooldown(AUTH.resendCodeCooldownSeconds)
  }

  if (step === 'code') {
    return (
      <div className="confirm">
        <div className="cf-ic">
          <Mail size={34} />
        </div>
        <h2>Подтвердите email</h2>
        <p>
          Мы отправили {AUTH.otpLength}-значный код на <b>{email}</b>. Если
          запрашивали код несколько раз — введите код из <b>самого свежего</b>{' '}
          письма.
        </p>
        <OtpInput value={code} onChange={setCode} disabled={verifying} length={AUTH.otpLength} />
        {codeError && (
          <div className="err-msg" style={{ textAlign: 'center', marginTop: 10 }}>
            {codeError}
          </div>
        )}
        <Button
          variant="green"
          size="lg"
          className="mt-5 w-full"
          onClick={verify}
          disabled={code.length !== AUTH.otpLength || verifying}
        >
          {verifying ? 'Проверяем…' : 'Подтвердить'}
        </Button>
        <div className="resend">
          Не пришёл код?{' '}
          <button onClick={resend} disabled={cooldown > 0}>
            {cooldown > 0
              ? `Отправить повторно (${cooldown})`
              : 'Отправить повторно'}
          </button>
        </div>
        <p className="hint" style={{ textAlign: 'center', marginTop: 12 }}>
          Проверьте папку «Спам».
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="auth-head">
        <h1>Создайте аккаунт</h1>
        <p>Зарегистрируйтесь, чтобы получить доступ к курсу</p>
      </div>
      {serverError && (
        <div className="alert error">
          <AlertCircle size={17} />
          <div>{serverError}</div>
        </div>
      )}
      <form onSubmit={onSubmit} noValidate>
        <AuthField
          id="rName"
          name="fullName"
          label="Имя и фамилия"
          icon={User}
          placeholder="Александр Петров"
          autoComplete="name"
          error={errors.fullName}
        />
        <AuthField
          id="rEmail"
          name="email"
          label="Email"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />
        <AuthField
          id="rPhone"
          name="phone"
          label="Номер телефона"
          icon={Phone}
          type="tel"
          placeholder="+1 (704) 555-0142"
          autoComplete="tel"
          error={errors.phone}
        />
        <PasswordField
          id="rPw"
          name="password"
          label="Пароль"
          showMeter
          value={pw}
          onValueChange={setPw}
          autoComplete="new-password"
          error={errors.password}
        />
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          style={{ display: 'none' }}
          aria-hidden
        />
        <div className="check-row">
          <input id="rTerms" name="terms" type="checkbox" />
          <label htmlFor="rTerms">
            Я принимаю{' '}
            <Link href="/terms" target="_blank">
              Условия использования
            </Link>{' '}
            и{' '}
            <Link href="/privacy" target="_blank">
              Политику конфиденциальности
            </Link>
          </label>
        </div>
        {errors.terms && (
          <div className="err-msg" style={{ marginTop: -10, marginBottom: 14 }}>
            {errors.terms}
          </div>
        )}
        <Button
          type="submit"
          variant="green"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? 'Создаём аккаунт…' : 'Создать аккаунт'}
        </Button>
      </form>
      <div className="auth-foot">
        Уже есть аккаунт? <Link href="/login">Войти</Link>
      </div>
    </>
  )
}
