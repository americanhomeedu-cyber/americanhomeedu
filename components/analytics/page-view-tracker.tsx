'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { track } from '@/lib/analytics/track'

export function PageViewTracker() {
  const pathname = usePathname()
  useEffect(() => {
    // Don't pollute marketing analytics with admin-panel navigation.
    if (pathname.startsWith('/admin')) return
    track('page_view')
  }, [pathname])
  return null
}
