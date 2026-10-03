import { useEffect, useRef, useState } from 'react'

/** Reveal once on arrival, including artwork below the fold on small screens. */
export function useEntrance<T extends HTMLElement>(threshold = .12) {
  const ref = useRef<T>(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (preference.matches || !('IntersectionObserver' in window)) {
      setEntered(true)
      return
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setEntered(true)
        observer.disconnect()
      }
    }, { threshold })
    const reduce = () => {
      if (preference.matches) { setEntered(true); observer.disconnect() }
    }
    observer.observe(element)
    preference.addEventListener('change', reduce)
    return () => { observer.disconnect(); preference.removeEventListener('change', reduce) }
  }, [threshold])

  return { ref, entered }
}
