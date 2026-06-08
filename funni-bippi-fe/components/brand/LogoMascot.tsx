import { Mascot } from './Mascot';

interface LogoMascotProps {
  size?: number;
  movingEyes?: boolean;
}

export function LogoMascot({ size = 120 }: LogoMascotProps) {
  const chatBubbleSize = size * 1.2;

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width: chatBubbleSize,
        height: chatBubbleSize,
      }}
    >
      {/* Chat bubble border */}
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
        <Mascot size={size} bob={false} />
      </div>
    </div>
  );
}
