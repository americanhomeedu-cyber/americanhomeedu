import Link from 'next/link'

export const metadata = { title: 'Страница не найдена — American Home Blueprint' }

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: '#F5F1EA',
        color: '#1a1a1a',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 72, fontWeight: 700, color: '#2D4A3E', lineHeight: 1 }}>
          404
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, margin: '14px 0 10px' }}>
          Страница не найдена
        </h1>
        <p style={{ color: '#4a463f', margin: '0 0 26px', lineHeight: 1.6 }}>
          Похоже, такой страницы нет или она была перемещена. Вернёмся на главную.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            background: '#C9A96E',
            color: '#2A2412',
            fontWeight: 700,
            padding: '14px 28px',
            borderRadius: 14,
            textDecoration: 'none',
          }}
        >
          На главную
        </Link>
      </div>
    </div>
  )
}
