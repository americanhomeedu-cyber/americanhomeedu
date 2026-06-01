import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

/**
 * TEMP design-system showcase (STAGE 0). The real featured-course landing
 * replaces this in STAGE 4 (moved to app/(marketing)/page.tsx).
 */
const swatches: Array<[string, string]> = [
  ['Cream', '#F5F1EA'],
  ['Cream deep', '#EFE9DE'],
  ['Green', '#2D4A3E'],
  ['Green deep', '#213A30'],
  ['Gold', '#C9A96E'],
  ['Gold deep', '#B8965A'],
  ['Ink', '#1A1A1A'],
  ['Line', '#E4DDD0'],
]

export default function Home() {
  return (
    <main className="theme-marketing min-h-screen bg-surface text-ink">
      <div className="wrap space-y-16 py-20">
        <header className="space-y-4">
          <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold-deep">
            Design system
          </p>
          <h1 className="text-5xl">
            American Home Blueprint <span className="italic text-green">with Alla</span>
          </h1>
          <p className="max-w-2xl text-lg text-ink-soft">
            Базовая дизайн-система собрана из эталонного дизайна. Эта страница —
            временная витрина токенов; настоящий лендинг появится на этапе 4.
          </p>
        </header>

        <section className="space-y-5">
          <h2 className="text-2xl">Палитра</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {swatches.map(([name, hex]) => (
              <div key={hex} className="overflow-hidden rounded-md border border-line bg-paper">
                <div className="h-20" style={{ background: hex }} />
                <div className="p-3">
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="text-xs text-ink-mute">{hex}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl">Кнопки</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="gold">Получить доступ</Button>
            <Button variant="green">Купить курс</Button>
            <Button variant="outline">Подробнее</Button>
            <Button variant="light">Войти</Button>
            <Button variant="ghost">Отмена</Button>
            <Button variant="danger">Удалить</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm" variant="green">
              Small
            </Button>
            <Button size="default" variant="green">
              Default
            </Button>
            <Button size="lg" variant="gold">
              Large
            </Button>
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl">Бейджи</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Featured</Badge>
            <Badge variant="gold">Premium</Badge>
            <Badge variant="success">Published</Badge>
            <Badge variant="warning">Draft</Badge>
            <Badge variant="error">Refunded</Badge>
            <Badge variant="info">Pending</Badge>
            <Badge variant="outline">Manual</Badge>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-e2">
            <CardHeader>
              <CardTitle>Как купить дом в Америке</CardTitle>
              <CardDescription>Пошаговая система для иммигрантов</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-4xl font-bold text-green">$397</span>
                <span className="text-ink-mute line-through">$497</span>
              </div>
              <Button variant="gold" className="w-full">
                Купить курс
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Форма</CardTitle>
              <CardDescription>Поля ввода в брендовом стиле</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Имя и фамилия" />
              <Input type="email" placeholder="you@example.com" />
              <Input type="password" placeholder="••••••••" />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
