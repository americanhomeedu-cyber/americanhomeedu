import type { Metadata } from 'next'
import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Покупка отменена — American Home Blueprint' }

export default function CheckoutCancelPage() {
  return (
    <div className="w-full max-w-md rounded-xl border border-line bg-paper p-8 text-center shadow-e2">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-cream-deep text-ink-mute">
        <XCircle size={30} />
      </div>
      <h1 className="font-serif text-2xl">Покупка отменена</h1>
      <p className="mt-2 text-ink-soft">
        Ничего не списано. Вы можете вернуться и попробовать снова в любой момент.
      </p>
      <Button asChild variant="green" className="mt-5">
        <Link href="/dashboard">Вернуться в кабинет</Link>
      </Button>
    </div>
  )
}
