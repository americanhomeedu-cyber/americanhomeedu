'use client'

import * as React from 'react'
import { X } from 'lucide-react'

export function Sheet({
  open,
  onClose,
  title,
  icon,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  icon?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  const [mounted, setMounted] = React.useState(false)
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setMounted(true)
      document.body.style.overflow = 'hidden'
      const r = requestAnimationFrame(() => setShow(true))
      return () => cancelAnimationFrame(r)
    }
    setShow(false)
    document.body.style.overflow = ''
    const t = setTimeout(() => setMounted(false), 320)
    return () => clearTimeout(t)
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted) return null
  return (
    <>
      <div className={`sheet-overlay${show ? ' show' : ''}`} onClick={onClose} />
      <aside className={`sheet${show ? ' show' : ''}`} role="dialog" aria-modal="true">
        <div className="sheet-head">
          <h3>
            {icon}
            {title}
          </h3>
          <button className="modal-x" onClick={onClose} aria-label="Закрыть">
            <X size={18} />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </aside>
    </>
  )
}
