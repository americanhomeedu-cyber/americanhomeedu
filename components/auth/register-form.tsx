'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Mail, Phone, User } from 'lucide-react'
import { toast } from 'sonner'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { AUTH } from '@/lib/constants'
import { AuthField, PasswordField, OtpInput } from './fields'

export function RegisterForm() {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [step, setStep] = React.useState<'form' | 'code'>('form')
  const [email, setEmail] = React.useState('')
  const [serverError, setServerError] = React.useState('')
  const [code, setCode] = React.useState('')
  const [verifying, setVerifying] = React.useState(false)
  const [codeError, setCodeError] = React.useState('')
  const [cooldown, setCooldown] = React.useState(0)
  const honeypot = React.useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phone: '', password: '', terms: false },
  })

  React.useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function onSubmit(data: RegisterInput) {
    if (honeypot.current?.value) return // bot trap
    setServerError('')
    const { data: res, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName, phone: data.phone } },
    })
    if (error) {
      setServerError(error.message)
      return
    }
    setEmail(data.email)
    // Confirm email OFF -> session exists -> straight to dashboard.
    if (res.session) {
      router.push('/dashboard')
      router.refresh()
      return
    }
    setStep('code')
  }

  async function verify() {
    if (code.length !== 6) return
    setVerifying(true)
    setCodeError('')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    })
    setVerifying(false)
    if (error) {
      setCodeError('Неверный или просроченный код')
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
    toast.info('Код отправлен повторно')
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
          Мы отправили 6-значный код на <b>{email}</b>. Введите его ниже.
        </p>
        <OtpInput value={code} onChange={setCode} disabled={verifying} />
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
          disabled={code.length !== 6 || verifying}
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

  const pw = watch('password')
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
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          id="rName"
          label="Имя и фамилия"
          icon={User}
          placeholder="Александр Петров"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <AuthField
          id="rEmail"
          label="Email"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <AuthField
          id="rPhone"
          label="Номер телефона"
          icon={Phone}
          type="tel"
          placeholder="+1 (704) 555-0142"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <PasswordField
          id="rPw"
          label="Пароль"
          showMeter
          value={pw}
          error={errors.password?.message}
          registration={register('password')}
        />
        <input
          ref={honeypot}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          style={{ display: 'none' }}
          aria-hidden
        />
        <div className="check-row">
          <input id="rTerms" type="checkbox" {...register('terms')} />
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
            {errors.terms.message}
          </div>
        )}
        <Button
          type="submit"
          variant="green"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Создаём аккаунт…' : 'Создать аккаунт'}
        </Button>
      </form>
      <div className="auth-foot">
        Уже есть аккаунт? <Link href="/login">Войти</Link>
      </div>
    </>
  )
}
