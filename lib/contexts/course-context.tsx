'use client'

import * as React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export type AdminCourse = {
  id: string
  title: string
  slug: string
  price_cents: number
  currency: string
  is_published: boolean
  is_featured: boolean
  cover_image_url: string | null
}

type CourseCtxValue = {
  courses: AdminCourse[]
  current: AdminCourse | null
  courseId: string
  isAll: boolean
  switchCourse: (id: string) => void
  /** Append the active ?course= to a nav href. */
  withCourse: (href: string) => string
}

const CourseCtx = React.createContext<CourseCtxValue | null>(null)

export function CourseProvider({
  courses,
  children,
}: {
  courses: AdminCourse[]
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const featured = courses.find((c) => c.is_featured) ?? courses[0] ?? null
  const param = searchParams.get('course')

  const [stored, setStored] = React.useState<string | null>(null)
  React.useEffect(() => {
    setStored(localStorage.getItem('ahb_admin_course'))
  }, [])
  React.useEffect(() => {
    if (param) localStorage.setItem('ahb_admin_course', param)
  }, [param])

  const courseId = param || stored || featured?.id || 'all'
  const isAll = courseId === 'all'
  const current = isAll
    ? null
    : (courses.find((c) => c.id === courseId) ?? featured)

  const withCourse = React.useCallback(
    (href: string) => {
      const [path, q] = href.split('?')
      const sp = new URLSearchParams(q)
      sp.set('course', courseId)
      return `${path}?${sp.toString()}`
    },
    [courseId],
  )

  const switchCourse = React.useCallback(
    (id: string) => {
      localStorage.setItem('ahb_admin_course', id)
      const sp = new URLSearchParams(Array.from(searchParams.entries()))
      sp.set('course', id)
      router.push(`${pathname}?${sp.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <CourseCtx.Provider
      value={{ courses, current, courseId, isAll, switchCourse, withCourse }}
    >
      {children}
    </CourseCtx.Provider>
  )
}

export function useCurrentCourse() {
  const ctx = React.useContext(CourseCtx)
  if (!ctx) throw new Error('useCurrentCourse must be used within CourseProvider')
  return ctx
}
