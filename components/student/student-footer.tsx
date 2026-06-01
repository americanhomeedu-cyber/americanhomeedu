import Link from 'next/link'
import { SOCIALS } from '@/lib/constants'

export function StudentFooter() {
  return (
    <footer className="s-footer">
      <div className="wrap">
        <span>© 2026 American Home Blueprint</span>
        <div className="ff-links">
          <Link href="/profile">Поддержка</Link>
          <Link href="/terms">Условия</Link>
          <a href={SOCIALS.instagram} target="_blank" rel="noopener">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  )
}
