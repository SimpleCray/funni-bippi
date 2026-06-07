interface LogoMascotProps {
  size?: number;
}

export function LogoMascot({ size = 120 }: LogoMascotProps) {
  const chatBubbleSize = size * 1.8;

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width: chatBubbleSize,
        height: chatBubbleSize,
      }}
    >
      {/* Chat bubble background */}
      <svg
        width={chatBubbleSize}
        height={chatBubbleSize}
        viewBox='0 0 48 48'
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <linearGradient id='logog' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0' stopColor='var(--accent-2)' />
            <stop offset='1' stopColor='var(--accent)' />
          </linearGradient>
        </defs>
        <path
          d='M24 5C12.4 5 4 12.6 4 21.8c0 4.6 2.2 8.7 5.8 11.7-.3 2.6-1.3 5-3 7 .1.2.3.3.5.3 3.3-.3 6-1.6 8.2-3.3 2.7.9 5.6 1.3 8.5 1.3 11.6 0 20-7.6 20-16.8S35.6 5 24 5z'
          fill='none'
          stroke='url(#logog)'
          strokeWidth='1.8'
          opacity='0.6'
        />
      </svg>

      {/* Mascot centered in bubble */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
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
          <circle cx='38' cy='52' r='9.5' fill='#fff' />
          <circle cx='62' cy='52' r='9.5' fill='#fff' />

          {/* pupils */}
          <circle cx='39.5' cy='53' r='4.4' fill='#2B2520' />
          <circle cx='63.5' cy='53' r='4.4' fill='#2B2520' />

          {/* eye highlights */}
          <circle cx='41' cy='51.4' r='1.5' fill='#fff' />
          <circle cx='65' cy='51.4' r='1.5' fill='#fff' />

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
      </div>
    </div>
  );
}
