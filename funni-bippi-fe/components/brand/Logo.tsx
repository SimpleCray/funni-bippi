interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 40, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`logo-mark ${className ?? ''}`}
    >
      <defs>
        <linearGradient id="logog" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-2)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <path
        d="M24 5C12.4 5 4 12.6 4 21.8c0 4.6 2.2 8.7 5.8 11.7-.3 2.6-1.3 5-3 7 .1.2.3.3.5.3 3.3-.3 6-1.6 8.2-3.3 2.7.9 5.6 1.3 8.5 1.3 11.6 0 20-7.6 20-16.8S35.6 5 24 5z"
        fill="url(#logog)"
      />
      <circle cx="24" cy="20.5" r="4.4" fill="#fff" />
      <circle cx="24" cy="20.5" r="8.6" fill="none" stroke="#fff" strokeWidth="2" opacity="0.55" />
      <circle cx="24" cy="20.5" r="12.4" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.3" />
    </svg>
  )
}
