import type { SVGProps } from 'react'

const paths: Record<string, string> = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.35-4.35',
  heart: 'M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.9 3.8 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.4 0 5.6 3.4 4.4 6.7-1.7 4.7-9.2 9.3-9.2 9.3Z',
  star: 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z',
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  calendar: 'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm0 4h16M8 3v4m8-4v4',
  users: 'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm10 9v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.15a3.5 3.5 0 0 1 0 6.7',
  bed: 'M3 18V6m0 7h18v5M3 13V9h7a3 3 0 0 1 3 3v1m8 0v-1a3 3 0 0 0-3-3h-5',
  bath: 'M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Zm2 0V6a2 2 0 0 1 3.5-1.3M7 19l-1 2m12-2 1 2',
  door: 'M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M4 21h16m-6-9h.01',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  arrowLeft: 'M19 12H5m5-5-5 5 5 5',
  chevronLeft: 'm15 18-6-6 6-6',
  chevronRight: 'm9 18 6-6-6-6',
  chevronDown: 'm6 9 6 6 6-6',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'm5 12 5 5 9-10',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  menu: 'M4 7h16M4 12h16M4 17h16',
  filter: 'M4 6h16M7 12h10m-7 6h4',
  shield: 'M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Zm-3.5 9 2.5 2.5 4.5-5',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
  key: 'M15 7a4 4 0 1 1-3.9 5H9v2H7v2H4v-3l6.1-6.1A4 4 0 0 1 15 7Zm1 0h.01',
  medal: 'M8 3h8l-2 6h-4L8 3Zm4 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0 3 1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 17l-2.4 1.2.5-2.6-1.9-1.8 2.6-.4L12 12Z',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 12 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z',
  share: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4m4-4v13',
  grid: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  chart: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  home: 'm3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9Z',
  wallet: 'M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2Zm14 7h.01',
  message: 'M4 5h16v11H8l-4 4V5Z',
  lock: 'M6 11h12v10H6V11Zm2 0V8a4 4 0 0 1 8 0v3',
  card: 'M3 6h18v12H3V6Zm0 4h18M7 15h3',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z',
  play: 'M8 5v14l11-7L8 5Z',
  trash: 'M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff: 'M3 3l18 18M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.7 8.5 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.3-1',
  // categories
  wave: 'M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M12 3a5 5 0 0 0 0 8',
  mountain: 'm2 20 7-12 4 6 3-4 6 10H2Zm7-12 2 3',
  city: 'M3 21h18M5 21V8l5-3v16m0 0V10l5 2v9m0 0V6l4-2v17M8 10h.01M8 14h.01M13 14h.01M17 9h.01M17 13h.01',
  leaf: 'M5 19c0-8 6-14 15-14 0 9-6 15-14 15M5 19l7-7',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-13v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4',
  palm: 'M12 21v-9m0 0C10 8 6 7 3 8m9 4c2-4 6-5 9-4m-9 4c-1-4-4-7-7-8m7 8c1-4 4-7 7-8M8 21h8',
}

interface Props extends SVGProps<SVGSVGElement> {
  name: keyof typeof paths | string
  size?: number
  filled?: boolean
}

export default function Icon({ name, size = 20, filled, strokeWidth = 1.6, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={paths[name] ?? ''} />
    </svg>
  )
}
