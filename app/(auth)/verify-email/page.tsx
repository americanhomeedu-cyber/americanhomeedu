import type { Metadata } from 'next'
import { VerifyForm } from '@/components/auth/verify-form'

export const metadata: Metadata = { title: 'Подтверждение email — American Home Blueprint' }

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  return <VerifyForm email={searchParams.email ?? ''} />
}
