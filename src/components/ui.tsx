import { useState, type ImgHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import { cx } from '../lib/utils'
import { BRAND, BRAND_LOWER } from '../brand'

/** Image with a warm gradient fallback so layouts stay beautiful if a photo fails to load. */
export function Img({ className, alt = '', ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false)
  return (
    <span className={cx('img', failed && 'img--failed', className)}>
      {!failed && <img alt={alt} loading="lazy" onError={() => setFailed(true)} {...rest} />}
    </span>
  )
}

/** The mark from the brand sheet: a peak inside a peak. Colour comes from `currentColor`. */
export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 4 29 27H3Z" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M16 12.8 22.2 23H9.8Z" fill="currentColor" />
    </svg>
  )
}

/** Lockup: mark, half-height gap, lowercase serif wordmark. `tone="light"` = white on dark surfaces. */
export function Logo({ tone = 'ink' }: { tone?: 'ink' | 'light' }) {
  return (
    <Link to="/" className={cx('logo', tone === 'light' && 'logo--light')} aria-label={`${BRAND} home`}>
      <Mark size={30} />
      <span className="logo__name">{BRAND_LOWER}</span>
    </Link>
  )
}

export function Stars({ value, count, small }: { value: number; count?: number; small?: boolean }) {
  return (
    <span className={cx('stars', small && 'stars--sm')}>
      <Icon name="star" size={small ? 13 : 15} filled />
      <strong>{value.toFixed(2)}</strong>
      {count !== undefined && <span className="muted">({count})</span>}
    </span>
  )
}

export function SectionTitle({ eyebrow, title, children, align = 'center' }: { eyebrow?: string; title: ReactNode; children?: ReactNode; align?: 'center' | 'left' }) {
  return (
    <div className={cx('section-title', align === 'left' && 'section-title--left')}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>
        {align === 'center' && <span className="rule" />}
        {title}
        {align === 'center' && <span className="rule" />}
      </h2>
      {children && <p className="section-title__sub">{children}</p>}
    </div>
  )
}

export function Counter({ value, min = 0, max = 99, onChange, label }: { value: number; min?: number; max?: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="counter">
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Icon name="minus" size={16} />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}
