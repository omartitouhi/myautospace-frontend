/* Inline icon set — single stroke style, sized by CSS via the parent. */

const I = {
  search: <path d="M21 21l-4.3-4.3M11 19a8 8 0 110-16 8 8 0 010 16z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowUR: <path d="M7 17L17 7M8 7h9v9" />,
  check: <path d="M20 6L9 17l-5-5" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  shieldCheck: (
    <g>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </g>
  ),
  star: <path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 18l-6.3 3.2L7 14.2 2 9.4l7-.9L12 2z" />,
  heart: (
    <path d="M12 21s-7-4.3-9.5-8.5C.8 9.6 2 6 5.5 6 7.6 6 9 7.3 12 10c3-2.7 4.4-4 6.5-4 3.5 0 4.7 3.6 3 6.5C19 16.7 12 21 12 21z" />
  ),
  bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />,
  gauge: (
    <g>
      <path d="M12 14l4-4" />
      <path d="M3 18a9 9 0 1118 0" />
    </g>
  ),
  pin: (
    <g>
      <path d="M12 22s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </g>
  ),
  cal: (
    <g>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </g>
  ),
  card: (
    <g>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </g>
  ),
  doc: (
    <g>
      <path d="M14 3v5h5" />
      <path d="M7 3h7l5 5v11a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M9 13h6M9 17h6" />
    </g>
  ),
  chat: <path d="M21 12a8 8 0 01-11.5 7.2L3 21l1.8-5.5A8 8 0 1121 12z" />,
  user: (
    <g>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" />
    </g>
  ),
  wrench: <path d="M14 7a4 4 0 00-5.6 5L3 17.4 6.6 21l5.4-5.4A4 4 0 0017 10l-3 3-3-3 3-3z" />,
  cam: (
    <g>
      <path d="M3 8a2 2 0 012-2h2l2-2h6l2 2h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </g>
  ),
  spray: (
    <g>
      <path d="M9 11h6v9a1 1 0 01-1 1h-4a1 1 0 01-1-1v-9z" />
      <path d="M9 11V7a2 2 0 012-2h2M13 5V3M16 4h2M16 8h2" />
    </g>
  ),
  truck: (
    <g>
      <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </g>
  ),
  road: <path d="M6 21L9 3M18 21L15 3M12 6v2M12 12v2M12 18v1" />,
  lock: (
    <g>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 018 0v3" />
    </g>
  ),
  eye: (
    <g>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </g>
  ),
  fuel: (
    <g>
      <path d="M4 21V5a2 2 0 012-2h6a2 2 0 012 2v16M3 21h12" />
      <path d="M14 8h2.5L19 10v7a2 2 0 01-4 0v-3h-1" />
    </g>
  ),
  cog: (
    <g>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
    </g>
  ),
  tw: (
    <path d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4 4 0 00-6.8 3.6A11.3 11.3 0 013 4.8a4 4 0 001.2 5.3c-.6 0-1.2-.2-1.8-.5a4 4 0 003.2 4 4 4 0 01-1.8.1 4 4 0 003.7 2.8A8 8 0 012 18.3a11.3 11.3 0 006.1 1.8c7.3 0 11.4-6.1 11.4-11.4v-.5c.8-.6 1.5-1.3 2-2.1z" />
  ),
  ig: (
    <g>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" />
    </g>
  ),
  li: (
    <g>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 014 0v4M11 17v-7" />
    </g>
  ),
  yt: (
    <g>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9l5 3-5 3z" />
    </g>
  ),
  sun: (
    <g>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </g>
  ),
  moon: <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />,
  bell: (
    <g>
      <path d="M18 9a6 6 0 10-12 0c0 6-2.5 7.5-2.5 7.5h17S18 15 18 9z" />
      <path d="M10 20a2.2 2.2 0 004 0" />
    </g>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  chevDown: <path d="M6 9l6 6 6-6" />,
  pen: <path d="M17 3l4 4L8 20l-5 1 1-5L17 3z" />,
  trash: (
    <g>
      <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
      <path d="M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" />
      <path d="M10 11v6M14 11v6" />
    </g>
  ),
  logout: (
    <g>
      <path d="M15 4H7a2 2 0 00-2 2v12a2 2 0 002 2h8" />
      <path d="M11 12h10M17 8l4 4-4 4" />
    </g>
  ),
  mail: (
    <g>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </g>
  ),
  phone: (
    <g>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </g>
  ),
  clock: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </g>
  ),
  refresh: <path d="M21 12a9 9 0 11-2.6-6.4M21 3v5h-5" />,
  alert: (
    <g>
      <path d="M12 3l10 17H2L12 3z" />
      <path d="M12 10v4M12 17.5v.01" />
    </g>
  ),
  info: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8v.01" />
    </g>
  ),
  car: (
    <g>
      <path d="M5 11l1.6-4.3A2 2 0 018.5 5.5h7a2 2 0 011.9 1.2L19 11" />
      <path d="M4 11h16a1 1 0 011 1v4a1 1 0 01-1 1h-1.2M3 17V12a1 1 0 011-1M5.2 17H3" />
      <circle cx="7.5" cy="16.5" r="1.7" />
      <circle cx="16.5" cy="16.5" r="1.7" />
    </g>
  ),
  tag: (
    <g>
      <path d="M3 11V4a1 1 0 011-1h7l10 10-8 8L3 11z" />
      <circle cx="8" cy="8" r="1.4" />
    </g>
  ),
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" />,
}

export function Icon({ name, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {I[name]}
    </svg>
  )
}
