'use client'

import * as React from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Mail } from 'lucide-react'
import { forgotSchema, type ForgotInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { AuthField } from './fields'

export function ForgotPasswordForm() {
  const supabase = React.useMemo(() => createClient(), [])
  const [sent, setSent] = React.useState(false)
  const [email, setEmail] = React.useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ForgotInput) {
    // Always succeed UX-wise (don't reveal whether the account exists).
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setEmail(data.email)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="confirm">
        <div className="cf-ic">
          <Mail size={34} />
        </div>
        <h2>Письмо отправлено</h2>
        <p>
          Если аккаунт с email <b>{email}</b> существует, мы отправили на него
          ссылку для сброса пароля.
        </p>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/login">Вернуться ко входу</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="auth-head">
        <span className="au-ic">
          <KeyRound size={26} />
        </span>
        <h1>Забыли пароль?</h1>
        <p>Введите email, и мы отправим ссылку для сброса пароля</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          id="fEmail"
          label="Email"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button
          type="submit"
          variant="green"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Отправляем…' : 'Отправить ссылку'}
        </Button>
      </form>
      <div className="auth-foot">
        <Link href="/login">← Вернуться ко входу</Link>
      </div>
    </>
  )
}
