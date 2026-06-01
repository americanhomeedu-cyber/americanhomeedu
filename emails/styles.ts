import type { CSSProperties } from 'react'

export const colors = {
  cream: '#F5F1EA',
  green: '#2D4A3E',
  gold: '#C9A96E',
  ink: '#1A1A1A',
  inkSoft: '#4A463F',
  inkMute: '#8A857B',
  line: '#E4DDD0',
  paper: '#FFFFFF',
}

export const main: CSSProperties = {
  background: colors.cream,
  fontFamily: 'Arial, Helvetica, sans-serif',
  margin: 0,
  padding: '40px 0',
}
export const container: CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  background: colors.paper,
  border: `1px solid ${colors.line}`,
  borderRadius: '16px',
  overflow: 'hidden',
}
export const header: CSSProperties = { background: colors.green, padding: '26px 32px' }
export const brandMain: CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '20px',
  fontWeight: 700,
  color: '#ffffff',
  margin: 0,
}
export const brandSub: CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: colors.gold,
  margin: '2px 0 0',
}
export const content: CSSProperties = { padding: '32px' }
export const h1: CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '23px',
  color: colors.ink,
  margin: '0 0 14px',
}
export const text: CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: colors.inkSoft,
  margin: '0 0 16px',
}
export const button: CSSProperties = {
  background: colors.gold,
  color: '#2A2412',
  fontWeight: 700,
  fontSize: '15px',
  padding: '14px 28px',
  borderRadius: '999px',
  textDecoration: 'none',
  display: 'inline-block',
}
export const footerText: CSSProperties = {
  padding: '0 32px 28px',
  fontSize: '12px',
  lineHeight: '1.5',
  color: colors.inkMute,
}
export const info: CSSProperties = {
  background: colors.cream,
  borderRadius: '10px',
  padding: '14px 16px',
  fontSize: '14px',
  color: colors.ink,
  margin: '0 0 18px',
}
