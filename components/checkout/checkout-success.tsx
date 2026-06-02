'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

type Status = 'processing' | 'done' | 'slow'

export function CheckoutSuccess({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [status, setStatus] = React.useState<Status>('processing')

  React.useEffect(() => {
    if (!sessionId) {
      setStatus('slow')
      return
    }
    let cancelled = false
    let attempts = 0
    let courseId: string | null = null

    const poll = async () => {
      if (cancelled) return
      attempts++
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        // Scope to the course just purchased so a returning buyer who already
        // owns another course isn't redirected before THIS access is granted.
        let q = supabase
          .from('course_enrollments')
          .select('id')
          .eq('user_id', user.id)
          .is('revoked_at', null)
        if (courseId) q = q.eq('course_id', courseId)
        const { data: enr } = await q.limit(1).maybeSingle()
        if (enr) {
          setStatus('done')
          setTimeout(() => router.push('/dashboard'), 1200)
          return
        }
      }
      if (attempts >= 13) {
        setStatus('slow')
        return
      }
      setTimeout(poll, 1500)
    }

    // Backup fulfillment in case the webhook is delayed; also tells us which
    // course was purchased so the poll can be scoped to it.
    fetch('/api/stripe/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((d) => {
        courseId = d?.courseId ?? null
      })
      .catch(() => {})
      .finally(() => poll())

    return () => {
      cancelled = true
    }
  }, [sessionId, supabase, router])

  return (
    <div className="w-full max-w-md rounded-xl border border-line bg-paper p-8 text-center shadow-e2">
      {status === 'processing' && (
        <>
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-green-tint">
            <span className="block h-7 w-7 animate-spin rounded-full border-2 border-green border-r-transparent" />
          </div>
          <h1 className="font-serif text-2xl">Оплата прошла!</h1>
          <p className="mt-2 text-ink-soft">
            Готовим ваш доступ к курсу — это займёт пару секунд…
          </p>
        </>
      )}
      {status === 'done' && (
        <>
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-green text-white">
            <Check size={30} />
          </div>
          <h1 className="font-serif text-2xl">Доступ открыт!</h1>
          <p className="mt-2 text-ink-soft">Перенаправляем вас в кабинет…</p>
        </>
      )}
      {status === 'slow' && (
        <>
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-gold-soft text-gold-deep">
            <Clock size={30} />
          </div>
          <h1 className="font-serif text-2xl">Почти готово</h1>
          <p className="mt-2 text-ink-soft">
            Доступ скоро появится — мы уже обрабатываем оплату. Если через минуту
            его не будет, напишите в поддержку.
          </p>
          <Button asChild variant="green" className="mt-5">
            <Link href="/dashboard">В кабинет</Link>
          </Button>
        </>
      )}
    </div>
  )
}
