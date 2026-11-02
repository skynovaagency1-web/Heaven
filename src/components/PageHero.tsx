import type { ReactNode } from 'react'
import { Img } from './ui'
import { cx } from '../lib/utils'

/** Shorter photo hero used by the content pages (destinations, about, help…). */
export default function PageHero({ image, eyebrow, title, children, small }: { image?: string; eyebrow?: string; title: ReactNode; children?: ReactNode; small?: boolean }) {
  return (
    <section className={cx('page-hero', small && 'page-hero--small', !image && 'page-hero--plain')}>
      {image && <Img className="page-hero__bg" src={image} alt="" />}
      <div className="page-hero__scrim" />
      <div className="container page-hero__inner">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <span className="flourish" aria-hidden="true" />
        {children && <div className="page-hero__lead">{children}</div>}
      </div>
    </section>
  )
}
