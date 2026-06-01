'use client'

import * as React from 'react'
import Link from 'next/link'
import { Check, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { resetSchema } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { PasswordField } from './fields'

export function ResetPasswordForm() {
  const supabase = React.useMemo(() => createClient(), [])
  const [done, setDone] = React.useState(false)
  const [pw, setPw] = React.useState('')
  const [errors, setErrors] = React.useState<{ password?: string; confirm?: string }>({})
  const [submitting, setSubmitting] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    const fd = new FormData(e.currentTarget)
    const values = {
      password: String(fd.get('password') ?? ''),
      confirm: String(fd.get('confirm') ?? ''),
    }
    const parsed = resetSchema.safeParse(values)
    if (!parsed.success) {
      const fe: { password?: string; confirm?: string } = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'password' | 'confirm'
        if (key && !fe[key]) fe[key] = issue.message
      }
      setErrors(fe)
      return
    }

    setSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
    setSubmitting(false)
    if (error) {
      toast.error(
        /session/i.test(error.message)
          ? 'Ссылка недействительна или истекла. Запросите новую.'
          : error.message,
      )
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="confirm">
        <div className="cf-ic gold">
          <Check size={34} />
        </div>
        <h2>Пароль изменён</h2>
        <p>Теперь вы можете войти с новым паролем.</p>
        <Button asChild variant="green" size="lg" className="w-full">
          <Link href="/login">Войти</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="auth-head">
        <span className="au-ic">
          <Lock size={26} />
        </span>
        <h1>Новый пароль</h1>
        <p>Придумайте надёжный пароль для вашего аккаунта</p>
      </div>
      <form onSubmit={onSubmit} noValidate>
        <PasswordField
          id="nPw"
          name="password"
          label="Новый пароль"
          showMeter
          value={pw}
          onValueChange={setPw}
          autoComplete="new-password"
          error={errors.password}
        />
        <PasswordField
          id="cPw"
          name="confirm"
          label="Повторите пароль"
          autoComplete="new-password"
          error={errors.confirm}
        />
        <Button
          type="submit"
          variant="green"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? 'Сохраняем…' : 'Сохранить новый пароль'}
        </Button>
      </form>
    </>
  )
}
