'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Info, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { AuthField, PasswordField } from './fields'

export function LoginForm({ redirect }: { redirect?: string }) {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [serverError, setServerError] = React.useState('')
  const [needsConfirm, setNeedsConfirm] = React.useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginInput) {
    setServerError('')
    setNeedsConfirm(false)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
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
    const email = getValues('email')
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
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          id="lEmail"
          label="Email"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          id="lPw"
          label="Пароль"
          value={watch('password')}
          error={errors.password?.message}
          registration={register('password')}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Входим…' : 'Войти'}
        </Button>
      </form>
      <div className="auth-foot">
        Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
      </div>
    </>
  )
}
