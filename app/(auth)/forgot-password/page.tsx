import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = { title: 'Восстановление пароля — American Home Blueprint' }

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
