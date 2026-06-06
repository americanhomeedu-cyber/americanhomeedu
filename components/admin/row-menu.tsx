'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type MenuItem =
  | { sep: true }
  | { label: string; icon?: LucideIcon; onClick: () => void; danger?: boolean }

/**
 * Dropdown menu rendered into a body portal with fixed positioning, so it's
 * never clipped by a table/card `overflow: hidden` ancestor (z-index can't fix
 * clipping). Positioned with its right edge under the trigger button.
 */
export function RowMenu({
  items,
  ariaLabel = 'Действия',
  trigger,
}: {
  items: MenuItem[]
  ariaLabel?: string
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const [coords, setCoords] = React.useState({ top: 0, left: 0 })
  const [mounted, setMounted] = React.useState(false)
  const btnRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    document.addEventListener('click', close)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      document.removeEventListener('click', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function toggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setCoords({ top: r.bottom + 6, left: r.right })
    }
    setOpen((o) => !o)
  }

  return (
    <>
      <button ref={btnRef} className="btn btn-ghost btn-icon btn-sm" aria-label={ariaLabel} onClick={toggle}>
        {trigger ?? <MoreHorizontal size={16} />}
      </button>
      {open &&
        mounted &&
        createPortal(
          <div
            className="dd-menu"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              right: 'auto',
              transform: 'translateX(-100%)',
              opacity: 1,
              pointerEvents: 'auto',
              zIndex: 200,
            }}
          >
            {items.map((it, i) =>
              'sep' in it ? (
                <div key={i} className="dd-sep" />
              ) : (
                <button
                  key={i}
                  className={`dd-item${it.danger ? ' danger' : ''}`}
                  onClick={() => {
                    setOpen(false)
                    it.onClick()
                  }}
                >
                  {it.icon ? <it.icon size={15} /> : null}
                  {it.label}
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </>
  )
}
