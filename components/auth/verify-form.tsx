'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { AUTH } from '@/lib/constants'
import { OtpInput } from './fields'

export function VerifyForm({ email }: { email: string }) {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [code, setCode] = React.useState('')
  const [verifying, setVerifying] = React.useState(false)
  const [error, setError] = React.useState('')
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function verify() {
    if (code.length !== 6 || !email) return
    setVerifying(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    })
    setVerifying(false)
    if (error) {
      setError('Неверный или просроченный код')
      return
    }
    toast.success('Email подтверждён')
    router.push('/dashboard')
    router.refresh()
  }

  async function resend() {
    if (!email) return
    await supabase.auth.resend({ type: 'signup', email })
    toast.info('Код отправлен повторно')
    setCooldown(AUTH.resendCodeCooldownSeconds)
  }

  return (
    <div className="confirm">
      <div className="cf-ic">
        <Mail size={34} />
      </div>
      <h2>Подтвердите email</h2>
      <p>
        {email ? (
          <>
            Введите 6-значный код, отправленный на <b>{email}</b>.
          </>
        ) : (
          'Введите 6-значный код из письма.'
        )}
      </p>
      <OtpInput value={code} onChange={setCode} disabled={verifying} />
      {error && (
        <div className="err-msg" style={{ textAlign: 'center', marginTop: 10 }}>
          {error}
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
          {cooldown > 0 ? `Отправить повторно (${cooldown})` : 'Отправить повторно'}
        </button>
      </div>
      <div style={{ marginTop: 18 }}>
        <Link className="auth-foot" style={{ margin: 0, display: 'block' }} href="/login">
          ← Ко входу
        </Link>
      </div>
    </div>
  )
}
