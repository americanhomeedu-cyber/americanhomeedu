'use client'

import * as React from 'react'
import Link from 'next/link'
import { KeyRound, Mail } from 'lucide-react'
import { forgotSchema } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { AuthField } from './fields'

export function ForgotPasswordForm() {
  const supabase = React.useMemo(() => createClient(), [])
  const [sent, setSent] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [error, setError] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const parsed = forgotSchema.safeParse({
      email: String(fd.get('email') ?? '').trim(),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Введите корректный email')
      return
    }

    setSubmitting(true)
    // Always succeed UX-wise (don't reveal whether the account exists).
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setSubmitting(false)
    setEmail(parsed.data.email)
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
      <form onSubmit={onSubmit} noValidate>
        <AuthField
          id="fEmail"
          name="email"
          label="Email"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={error}
        />
        <Button
          type="submit"
          variant="green"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? 'Отправляем…' : 'Отправить ссылку'}
        </Button>
      </form>
      <div className="auth-foot">
        <Link href="/login">← Вернуться ко входу</Link>
      </div>
    </>
  )
}
