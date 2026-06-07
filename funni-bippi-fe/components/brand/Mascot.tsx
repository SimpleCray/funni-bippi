interface MascotProps {
  size?: number;
  mood?: 'happy' | 'wink';
  bob?: boolean;
}

export function Mascot({ size = 120, mood = 'happy', bob = true }: MascotProps) {
  const eyeY = 0.46;
  const blink = mood === 'wink';

  return (
    <span className={`blob-wrap${bob ? ' bob' : ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox='0 0 100 100' style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id='blobg' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0' stopColor='var(--accent-2)' />
            <stop offset='1' stopColor='var(--accent)' />
          </linearGradient>
        </defs>

        {/* body */}
        <path
          d='M50 8 C74 8 90 26 90 50 C90 76 73 92 50 92 C27 92 10 76 10 50 C10 26 26 8 50 8 Z'
          fill='url(#blobg)'
        />

        {/* cheek highlight */}
        <ellipse cx='35' cy='34' rx='13' ry='9' fill='#fff' opacity='0.22' />

        {/* eyes (white) */}
        <circle cx='38' cy={eyeY * 100 + 6} r='9.5' fill='#fff' />
        <circle cx='62' cy={eyeY * 100 + 6} r='9.5' fill='#fff' />

        {/* pupils / blink */}
        {blink ? (
          <>
            <circle cx='38' cy='52' r='4.2' fill='#2B2520' />
            <path
              d='M56 52 q6 4 12 0'
              stroke='#2B2520'
              strokeWidth='3.4'
              fill='none'
              strokeLinecap='round'
            />
          </>
        ) : (
          <>
            <circle cx='39.5' cy='53' r='4.4' fill='#2B2520' />
            <circle cx='63.5' cy='53' r='4.4' fill='#2B2520' />
          </>
        )}

        {/* eye highlights */}
        {!blink && (
          <>
            <circle cx='41' cy='51.4' r='1.5' fill='#fff' />
            <circle cx='65' cy='51.4' r='1.5' fill='#fff' />
          </>
        )}

        {/* blush */}
        <ellipse cx='28' cy='63' rx='6' ry='3.6' fill='#fff' opacity='0.28' />
        <ellipse cx='72' cy='63' rx='6' ry='3.6' fill='#fff' opacity='0.28' />

        {/* smile */}
        <path
          d='M42 66 q8 7 16 0'
          stroke='#2B2520'
          strokeWidth='3.2'
          fill='none'
          strokeLinecap='round'
        />

        {/* antenna */}
        <circle cx='50' cy='6' r='3.2' fill='var(--accent-2)' />
        <line
          x1='50'
          y1='9'
          x2='50'
          y2='15'
          stroke='var(--accent-2)'
          strokeWidth='2.4'
          strokeLinecap='round'
        />
      </svg>
    </span>
  );
}
