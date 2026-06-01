import type { ReactNode } from 'react'

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="theme-marketing grid min-h-screen place-items-center bg-cream p-6 text-ink">
      {children}
    </div>
  )
}
