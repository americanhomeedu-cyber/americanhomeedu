import type { Metadata } from 'next'
import { CheckoutSuccess } from '@/components/checkout/checkout-success'

export const metadata: Metadata = { title: 'Оплата прошла — American Home Blueprint' }

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  return <CheckoutSuccess sessionId={searchParams.session_id ?? ''} />
}
