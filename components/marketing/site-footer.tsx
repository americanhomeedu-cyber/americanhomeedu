import Link from 'next/link'
import { Instagram, Youtube, Facebook } from './social-icons'
import { SOCIALS } from '@/lib/constants'

const NAV = [
  ['about-course', 'О курсе'],
  ['program', 'Программа'],
  ['author', 'Об авторе'],
  ['reviews', 'Отзывы'],
  ['faq', 'FAQ'],
]

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <Link href="/" className="brand">
              <span className="b-main">American Home Blueprint</span>
              <span className="b-sub">with Alla</span>
            </Link>
            <p className="footer-desc">
              Пошаговая система покупки дома в США для русскоязычных иммигрантов —
              от лицензированного риелтора с 14-летним опытом.
            </p>
            <div className="footer-social">
              <a href={SOCIALS.instagram} target="_blank" rel="noopener" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href={SOCIALS.youtube} target="_blank" rel="noopener" aria-label="YouTube">
                <Youtube size={18} />
              </a>
              <a href={SOCIALS.facebook} target="_blank" rel="noopener" aria-label="Facebook">
                <Facebook size={18} />
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Навигация</h4>
            {NAV.map(([id, label]) => (
              <Link key={id} href={`/#${id}`}>
                {label}
              </Link>
            ))}
          </div>
          <div className="footer-col">
            <h4>Юридическое</h4>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/refund">Refund Policy</Link>
          </div>
          <div className="footer-col">
            <h4>Контакты</h4>
            <p>hello@americanhomeedu.com</p>
            <a href={SOCIALS.instagram} target="_blank" rel="noopener">
              Instagram @move.us.with.alla
            </a>
            <a href={SOCIALS.youtube} target="_blank" rel="noopener">
              YouTube · Alla Rizayev
            </a>
            <a href={SOCIALS.facebook} target="_blank" rel="noopener">
              Facebook · Alla Rizayev
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 American Home Blueprint. Все права защищены.</span>
          <span className="footer-disclaimer">
            Курс является информационным продуктом и не заменяет юридическую или
            финансовую консультацию.
          </span>
        </div>
      </div>
    </footer>
  )
}
