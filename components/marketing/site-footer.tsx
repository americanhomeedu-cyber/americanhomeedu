import Link from 'next/link'
import { Instagram, Youtube, Facebook } from './social-icons'
import { getSiteSettings } from '@/lib/settings'

const NAV = [
  ['about-course', 'О курсе'],
  ['program', 'Программа'],
  ['author', 'Об авторе'],
  ['reviews', 'Отзывы'],
  ['faq', 'FAQ'],
]

export async function SiteFooter() {
  const s = await getSiteSettings()
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <Link href="/" className="brand">
              <span className="b-main">{s.site_title}</span>
              <span className="b-sub">with Alla</span>
            </Link>
            <p className="footer-desc">
              Пошаговая система покупки дома в США для русскоязычных иммигрантов —
              от лицензированного риелтора с 14-летним опытом.
            </p>
            <div className="footer-social">
              {s.social_instagram && (
                <a href={s.social_instagram} target="_blank" rel="noopener" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
              )}
              {s.social_youtube && (
                <a href={s.social_youtube} target="_blank" rel="noopener" aria-label="YouTube">
                  <Youtube size={18} />
                </a>
              )}
              {s.social_facebook && (
                <a href={s.social_facebook} target="_blank" rel="noopener" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
              )}
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
            <Link href="/cookies">Cookie Policy</Link>
          </div>
          <div className="footer-col">
            <h4>Контакты</h4>
            <p>{s.contact_email}</p>
            {s.social_instagram && (
              <a href={s.social_instagram} target="_blank" rel="noopener">
                Instagram @move.us.with.alla
              </a>
            )}
            {s.social_youtube && (
              <a href={s.social_youtube} target="_blank" rel="noopener">
                YouTube · Alla Rizayev
              </a>
            )}
            {s.social_telegram && (
              <a href={s.social_telegram} target="_blank" rel="noopener">
                Telegram
              </a>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 {s.site_title}. Все права защищены.</span>
          <span className="footer-disclaimer">
            Курс является информационным продуктом и не заменяет юридическую или
            финансовую консультацию.
          </span>
        </div>
      </div>
    </footer>
  )
}
