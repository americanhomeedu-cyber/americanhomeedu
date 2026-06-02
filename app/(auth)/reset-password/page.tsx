import type { Metadata } from 'next'
import Link from 'next/link'
import { KeyRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = { title: 'Новый пароль — American Home Blueprint' }

export default async function ResetPasswordPage() {
  // The recovery link (via /auth/callback) sets a session cookie. Without it,
  // updateUser would fail — so show a "request a new link" state instead of a
  // form that only errors on submit.
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="confirm">
        <div className="cf-ic">
          <KeyRound size={34} />
        </div>
        <h2>Ссылка устарела</h2>
        <p>
          Ссылка для сброса пароля недействительна или истекла. Запросите новую —
          мы отправим свежее письмо.
        </p>
        <Button asChild variant="green" size="lg" className="mt-5 w-full">
          <Link href="/forgot-password">Запросить новую ссылку</Link>
        </Button>
      </div>
    )
  }

  return <ResetPasswordForm />
}
