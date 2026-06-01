import type { ReactNode } from 'react'

const LEGAL_CSS = `
.legal-content { color: var(--ink-soft); font-size: 17px; line-height: 1.7; }
.legal-content h2 { font-size: 22px; color: var(--ink); margin: 34px 0 12px; font-weight: 700; font-family: var(--font-serif, Georgia, serif); }
.legal-content h3 { font-size: 18px; color: var(--ink); margin: 22px 0 8px; font-weight: 700; }
.legal-content p { margin-bottom: 14px; }
.legal-content ul { margin: 0 0 16px; padding-left: 22px; }
.legal-content li { margin-bottom: 7px; }
.legal-content a { color: var(--green); text-decoration: underline; }
.legal-content strong { color: var(--ink); }
.legal-content .lead { font-size: 18px; }
`

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="section">
      <style dangerouslySetInnerHTML={{ __html: LEGAL_CSS }} />
      <div className="wrap legal-content" style={{ maxWidth: 820 }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: 20 }}>{title}</h1>
        {children}
        <p style={{ marginTop: 32, fontSize: 14, color: 'var(--ink-mute)' }}>
          Последнее обновление: июнь 2026 г.
        </p>
      </div>
    </section>
  )
}

/**
 * Render admin-authored rich HTML (from the settings WYSIWYG editor). The
 * content only ever comes from an authenticated admin via a constrained
 * TipTap editor, so a lightweight strip of scripts / inline handlers /
 * javascript: URLs is enough — and it avoids pulling jsdom (isomorphic-dompurify)
 * into statically-prerendered pages, which breaks the build.
 */
function stripDangerous(html: string) {
  return html
    .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*\/?\s*(iframe|object|embed)[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}

export function LegalHtml({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: stripDangerous(html) }} />
}

/** Render an admin-provided plain-text override (from site_settings) as paragraphs. */
export function LegalOverride({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n{2,}|\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </>
  )
}
