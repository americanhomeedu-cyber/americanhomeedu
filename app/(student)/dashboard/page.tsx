import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PurchaseHub } from '@/components/student/purchase-hub'
import { StudentFooter } from '@/components/student/student-footer'
import { Button } from '@/components/ui/button'
import { SOCIALS } from '@/lib/constants'

export const metadata: Metadata = { title: 'Мои курсы — American Home Blueprint' }

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()
  const name = profile?.full_name || 'друг'

  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('course_id, courses(*)')
    .eq('user_id', user.id)
    .is('revoked_at', null)
    .order('granted_at', { ascending: false })

  const active = (enrollments ?? []).filter((e) => e.courses)

  // No course yet → the purchase hub.
  if (!active.length) {
    const { data: featured } = await supabase
      .from('courses')
      .select('*')
      .eq('is_featured', true)
      .eq('is_published', true)
      .single()
    if (!featured) {
      return (
        <main className="s-main">
          <div className="empty">
            <h2>Курсы скоро появятся</h2>
            <p>Загляните позже.</p>
          </div>
        </main>
      )
    }
    return (
      <>
        <PurchaseHub course={featured} name={name} />
        <StudentFooter />
      </>
    )
  }

  const primary = active[0].courses!
  const { data: sections } = await supabase
    .from('course_sections')
    .select('id')
    .eq('course_id', primary.id)
    .eq('is_published', true)
  const total = sections?.length ?? 0
  const sectionIds = (sections ?? []).map((s) => s.id)
  const { data: progress } = sectionIds.length
    ? await supabase
        .from('course_progress')
        .select('section_id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('section_id', sectionIds)
    : { data: [] }
  const doneCount = progress?.length ?? 0
  const pct = total ? Math.round((doneCount / total) * 100) : 0

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'
  const sub =
    pct === 100
      ? 'Поздравляем с завершением курса! 🎉'
      : pct === 0
        ? 'Начните своё путешествие к собственному дому'
        : 'Продолжайте — вы на пути к цели'
  const status =
    pct === 0
      ? { label: 'Не начат', cls: 'soft' }
      : pct === 100
        ? { label: 'Завершён', cls: 'green' }
        : { label: 'В процессе', cls: 'gold' }
  const cta =
    pct === 0 ? 'Начать курс' : pct === 100 ? 'Пересмотреть курс' : 'Продолжить обучение'

  return (
    <>
      <main className="s-main">
        <div className="greet fade-in">
          <h1>
            {greet}, {name.split(' ')[0]}
          </h1>
          <p>{sub}</p>
        </div>

        <div className="section-block">
          <div className="course-feature">
            <div className="cf-cover">
              <span className="cf-badge">
                <span className={`badge ${status.cls}`}>{status.label}</span>
              </span>
              <Image
                src={primary.cover_image_url || '/images/alla-guide.png'}
                alt=""
                fill
                sizes="340px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="cf-body">
              <h2>{primary.title}</h2>
              <p className="cf-sub">{primary.subtitle}</p>
              <div className="prog-wrap">
                <div className="prog-bar">
                  <div
                    className={`fill${pct === 100 ? ' gold' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="prog-meta">
                  <span>
                    Пройдено {doneCount} из {total} разделов
                  </span>
                  <span>{pct}%</span>
                </div>
              </div>
              <div className="cf-actions">
                <Button asChild variant="green" size="lg">
                  <Link href={`/course/${primary.id}`}>
                    {cta} <ChevronRight size={18} />
                  </Link>
                </Button>
                <span className="cf-note">
                  <Check size={15} />
                  Доступ навсегда
                </span>
              </div>
            </div>
          </div>
        </div>

        {active.length > 1 && (
          <div className="section-block">
            <h2 style={{ fontSize: 22, marginBottom: 18 }}>Другие курсы</h2>
            <div className="course-grid">
              {active.slice(1).map((e) => (
                <Link key={e.course_id} href={`/course/${e.courses!.id}`} className="cg-card">
                  <div className="cg-cover">
                    <Image
                      src={e.courses!.cover_image_url || '/images/alla-guide.png'}
                      alt=""
                      fill
                      sizes="280px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="cg-body">
                    <h3>{e.courses!.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="section-block">
          <div className="support-card">
            <div>
              <h3>Остались вопросы?</h3>
              <p>Напишите нам — мы поможем на каждом шаге</p>
            </div>
            <Button asChild variant="outline">
              <a href={SOCIALS.instagram} target="_blank" rel="noopener">
                Написать Алле
              </a>
            </Button>
          </div>
        </div>
      </main>
      <StudentFooter />
    </>
  )
}
