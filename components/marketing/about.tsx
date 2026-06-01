import Image from 'next/image'
import { BadgeCheck } from 'lucide-react'
import { Instagram, Youtube, Facebook } from './social-icons'
import { getSiteSettings } from '@/lib/settings'

const DEFAULT_BIO = (
  <>
    <p>
      За <strong>14+ лет в недвижимости США</strong> я провела через сделки
      сотни семей — и знаю, как страшно делать первый шаг на чужом рынке, на
      неродном языке.
    </p>
    <p>
      Я сама прошла путь иммигранта и помню, каково это — разбираться в
      mortgage, escrow и closing без понятных объяснений. Поэтому я создала
      систему, которая говорит с вами на русском и ведёт за руку.
    </p>
    <p>
      Работаю в <strong>Keller Williams Ballantyne</strong> и специализируюсь
      на relocation- и first-time buyers. Мой подход — честность,
      прозрачность и забота о клиенте, а не о комиссии.
    </p>
    <p>
      В этом курсе я собрала всё, что обычно рассказываю клиентам лично —
      чтобы вы могли купить дом спокойно и осознанно.
    </p>
  </>
)

export async function About() {
  const s = await getSiteSettings()
  const bioParagraphs = s.about_bio.trim()
    ? s.about_bio.split(/\n{2,}|\n/).filter(Boolean)
    : null
  return (
    <section className="section about" id="author">
      <div className="wrap about-grid">
        <div className="about-photo reveal">
          <Image
            src="/images/alla-guide.jpg"
            alt={s.about_name}
            fill
            sizes="(max-width: 980px) 100vw, 40vw"
            style={{ objectFit: 'cover', objectPosition: 'center 28%' }}
          />
        </div>
        <div className="about-copy reveal d1">
          <span className="eyebrow">Ваш проводник</span>
          <h2>{s.about_name}</h2>
          <p className="role">{s.about_role}</p>
          <div className="about-bio">
            {bioParagraphs ? bioParagraphs.map((p, i) => <p key={i}>{p}</p>) : DEFAULT_BIO}
          </div>
          <div className="about-socials">
            <a href={s.social_instagram} target="_blank" rel="noopener" className="social-pill">
              <span className="si ig">
                <Instagram size={18} />
              </span>
              <span>
                <span className="sp-count">@move.us.with.alla</span>
                <br />
                <span className="sp-label">Instagram</span>
              </span>
            </a>
            <a href={s.social_youtube} target="_blank" rel="noopener" className="social-pill">
              <span className="si yt">
                <Youtube size={18} />
              </span>
              <span>
                <span className="sp-count">Alla Rizayev</span>
                <br />
                <span className="sp-label">YouTube</span>
              </span>
            </a>
            <a href={s.social_facebook} target="_blank" rel="noopener" className="social-pill">
              <span className="si fb">
                <Facebook size={18} />
              </span>
              <span>
                <span className="sp-count">Alla Rizayev</span>
                <br />
                <span className="sp-label">Facebook</span>
              </span>
            </a>
          </div>
          <div className="about-badges">
            <span className="lic-badge">
              <BadgeCheck size={16} /> NC Real Estate License
            </span>
            <span className="lic-badge">
              <BadgeCheck size={16} /> REALTOR® · NAR Member
            </span>
            <span className="lic-badge">
              <BadgeCheck size={16} /> Keller Williams
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
