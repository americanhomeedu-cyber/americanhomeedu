import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Вход — American Home Blueprint' }

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  return <LoginForm redirect={searchParams.redirect} />
}
