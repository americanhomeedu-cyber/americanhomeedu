'use client'

import * as React from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { resetSchema, type ResetInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { PasswordField } from './fields'

export function ResetPasswordForm() {
  const supabase = React.useMemo(() => createClient(), [])
  const [done, setDone] = React.useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirm: '' },
  })

  async function onSubmit(data: ResetInput) {
    const { error } = await supabase.auth.updateUser({ password: data.password })
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
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <PasswordField
          id="nPw"
          label="Новый пароль"
          showMeter
          value={watch('password')}
          error={errors.password?.message}
          registration={register('password')}
        />
        <PasswordField
          id="cPw"
          label="Повторите пароль"
          value={watch('confirm')}
          error={errors.confirm?.message}
          registration={register('confirm')}
        />
        <Button
          type="submit"
          variant="green"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Сохраняем…' : 'Сохранить новый пароль'}
        </Button>
      </form>
    </>
  )
}
