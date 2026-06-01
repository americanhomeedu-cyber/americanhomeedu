import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Вход — American Home Blueprint' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect(searchParams.redirect || '/dashboard')
  return <LoginForm redirect={searchParams.redirect} />
}
