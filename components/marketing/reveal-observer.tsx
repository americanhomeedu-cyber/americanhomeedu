'use client'

import * as React from 'react'

/**
 * Adds the `.in` class to `.reveal` elements as they scroll into view
 * (matches the design's scroll-reveal). Mount once on the page.
 */
export function RevealObserver() {
  React.useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = Array.from(
      document.querySelectorAll<HTMLElement>('.reveal:not(.in)'),
    )
    if (reduced) {
      els.forEach((e) => e.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    )
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        el.classList.add('in')
      } else {
        io.observe(el)
      }
    })
    return () => io.disconnect()
  }, [])
  return null
}
