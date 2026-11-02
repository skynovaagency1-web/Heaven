import type { ReactNode } from 'react'
import { Img } from './ui'
import { cx } from '../lib/utils'

/** Editorial page header: kicker, large title, intro in the side column, optional wide photo below. */
export default function PageHero({ image, eyebrow, title, children, small }: { image?: string; eyebrow?: string; title: ReactNode; children?: ReactNode; small?: boolean }) {
  return (
    <section className={cx('container page-head', small && 'page-head--small')}>
      <div className="page-head__grid">
        <div>
          {eyebrow && <span className="kicker">{eyebrow}</span>}
          <h1>{title}</h1>
        </div>
        {children && <div className="page-head__lead">{children}</div>}
      </div>
      {image && <Img className="page-head__img" src={image} alt="" />}
    </section>
  )
}
