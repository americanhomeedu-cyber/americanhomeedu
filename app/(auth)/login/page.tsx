import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { safePath } from '@/lib/utils'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Вход — American Home Blueprint' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; error?: string }
}) {
  const target = safePath(searchParams.redirect)
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect(target)
  return (
    <LoginForm
      redirect={searchParams.redirect ? target : undefined}
      callbackError={searchParams.error === 'auth_callback'}
    />
  )
}
