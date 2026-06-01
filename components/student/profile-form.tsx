'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { KeyRound, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

type Course = {
  id: string
  title: string
  cover_image_url: string | null
  granted_at: string
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '•'
  )
}

export function ProfileForm({
  profile,
  courses,
}: {
  profile: { id: string; full_name: string; email: string; phone: string }
  courses: Course[]
}) {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [name, setName] = React.useState(profile.full_name)
  const [phone, setPhone] = React.useState(profile.phone)
  const [saving, setSaving] = React.useState(false)

  async function save() {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name, phone })
      .eq('id', profile.id)
    setSaving(false)
    if (error) toast.error('Не удалось сохранить')
    else {
      toast.success('Изменения сохранены')
      router.refresh()
    }
  }

  async function changePassword() {
    await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    toast.success('Ссылка для смены пароля отправлена на email')
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <div className="greet fade-in" style={{ marginBottom: 28 }}>
        <h1>Настройки профиля</h1>
        <p>Управляйте аккаунтом и данными</p>
      </div>

      <div style={{ maxWidth: 680 }}>
        <div className="s-card">
          <h3>Личные данные</h3>
          <div className="sc-sub">Эта информация видна только вам</div>
          <div className="avatar-row">
            <span className="avatar s80">{initials(name || profile.email)}</span>
          </div>
          <div className="prof-field">
            <label htmlFor="pName">Имя и фамилия</label>
            <input id="pName" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="prof-field">
            <label htmlFor="pEmail">Email</label>
            <div className="lockrow">
              <input id="pEmail" value={profile.email} disabled />
              <Lock size={16} />
            </div>
            <div className="hint" style={{ marginTop: 6 }}>
              Email изменить нельзя
            </div>
          </div>
          <div className="prof-field">
            <label htmlFor="pPhone">Телефон</label>
            <input
              id="pPhone"
              value={phone}
              placeholder="Необязательно"
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button variant="green" size="sm" onClick={save} disabled={saving}>
            {saving ? 'Сохраняем…' : 'Сохранить изменения'}
          </Button>
        </div>

        <div className="s-card">
          <h3>Безопасность</h3>
          <div className="sc-sub">Смена пароля аккаунта</div>
          <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
            Мы отправим ссылку для смены пароля на ваш email.
          </p>
          <Button variant="outline" size="sm" onClick={changePassword}>
            <KeyRound size={15} />
            Сменить пароль
          </Button>
        </div>

        <div className="s-card">
          <h3>Мои курсы</h3>
          <div className="sc-sub">Курсы, к которым у вас есть доступ</div>
          {courses.length === 0 && (
            <p className="muted" style={{ fontSize: 14 }}>
              У вас пока нет курсов.
            </p>
          )}
          {courses.map((c) => (
            <div className="my-course-row" key={c.id}>
              <span className="mc-cover">
                {c.cover_image_url ? (
                  <Image src={c.cover_image_url} alt="" width={48} height={48} style={{ objectFit: 'cover' }} />
                ) : (
                  'АН'
                )}
              </span>
              <div style={{ flex: 1 }}>
                <div className="mc-name">{c.title}</div>
                <div className="mc-meta">
                  Куплен {format(new Date(c.granted_at), 'd MMMM yyyy', { locale: ru })} ·{' '}
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                    Доступ навсегда
                  </span>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/course/${c.id}`}>Открыть</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="s-card danger">
          <h3>Аккаунт</h3>
          <div className="sc-sub">Управление сессией</div>
          <div className="toggle-row" style={{ border: 'none', paddingTop: 0 }}>
            <div className="tr-t">Выйти из аккаунта</div>
            <Button variant="outline" size="sm" onClick={logout}>
              Выйти
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
