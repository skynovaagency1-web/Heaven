import { useEffect, useRef, type ReactNode } from 'react'
import { cx } from '../lib/utils'

/** Click-away / Escape aware popover panel. */
export default function Popover({ open, onClose, children, className, align = 'left' }: { open: boolean; onClose: () => void; children: ReactNode; className?: string; align?: 'left' | 'right' | 'center' }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const parent = ref.current?.parentElement
      if (parent && !parent.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div ref={ref} className={cx('popover', `popover--${align}`, className)}>
      {children}
    </div>
  )
}
