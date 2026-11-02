/**
 * Pointer-following spotlight for any element with the `spot` class.
 * One delegated listener writes --mx / --my on the hovered card; CSS draws the light.
 */
export function installSpotlight() {
  if (typeof window === 'undefined') return
  window.addEventListener(
    'pointermove',
    (e) => {
      const el = (e.target as Element | null)?.closest?.('.spot') as HTMLElement | null
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    },
    { passive: true },
  )
}
