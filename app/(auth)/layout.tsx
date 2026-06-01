import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import './auth.css'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="theme-student min-h-screen bg-cream text-ink">
      <div className="auth">
        <aside className="auth-brand">
          <Image
            className="ab-bg"
            src="/images/alla-guide.png"
            alt=""
            fill
            sizes="(max-width: 860px) 0px, 45vw"
            priority
          />
          <div className="ab-logo">
            <span className="l-main">American Home Blueprint</span>
            <span className="l-sub">with Alla</span>
          </div>
          <div className="ab-quote">
            <h2>Ваш дом в Америке начинается здесь</h2>
            <p>
              Пошаговая система от лицензированного риелтора с 14-летним опытом.
            </p>
          </div>
          <div className="ab-author">
            <Image
              src="/images/alla-portrait.jpg"
              alt="Алла Ризаева"
              width={52}
              height={52}
            />
            <div>
              <div className="aa-name">Алла Ризаева</div>
              <div className="aa-role">Licensed Real Estate Agent · NC</div>
            </div>
          </div>
        </aside>

        <main className="auth-main">
          <div className="auth-card">
            <div className="auth-mlogo">
              <div className="l-main">American Home Blueprint</div>
              <div className="l-sub">with Alla</div>
            </div>
            {children}
          </div>
          <Link className="auth-back" href="/">
            <ChevronLeft size={14} />
            Вернуться на сайт
          </Link>
        </main>
      </div>
    </div>
  )
}
