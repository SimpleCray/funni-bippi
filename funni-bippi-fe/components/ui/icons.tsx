'use client';

import { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

function I({ size = 22, strokeWidth = 2, children, fill = 'none', ...props }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill={fill}
      stroke={fill === 'none' ? 'currentColor' : 'none'}
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      {children}
    </svg>
  );
}

export const IcChat = (p: P) => (
  <I {...p}>
    <path d='M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9.6 9.6 0 0 1-3.6-.7L3 21l1.7-5.4A8.4 8.4 0 0 1 4 11.5 8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z' />
  </I>
);

export const IcUser = (p: P) => (
  <I {...p}>
    <circle cx='12' cy='8' r='3.6' />
    <path d='M5.5 20a6.5 6.5 0 0 1 13 0' />
  </I>
);

export const IcSettings = (p: P) => (
  <I {...p}>
    <circle cx='12' cy='12' r='3' />
    <path d='M19.4 13.5a1.5 1.5 0 0 0 .4 1.7l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.5 1.5 0 0 0-1.7-.4 1.5 1.5 0 0 0-.9 1.4V19a2 2 0 0 1-4 0v-.1a1.5 1.5 0 0 0-1-1.4 1.5 1.5 0 0 0-1.7.4l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.5 1.5 0 0 0 .4-1.7 1.5 1.5 0 0 0-1.4-.9H5a2 2 0 0 1 0-4h.1a1.5 1.5 0 0 0 1.4-1 1.5 1.5 0 0 0-.4-1.7l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.5 1.5 0 0 0 1.7.4H11A1.5 1.5 0 0 0 12 5V5a2 2 0 0 1 4 0v.1a1.5 1.5 0 0 0 .9 1.4 1.5 1.5 0 0 0 1.7-.4l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.5 1.5 0 0 0-.4 1.7v.1a1.5 1.5 0 0 0 1.4.9H19a2 2 0 0 1 0 4h-.1a1.5 1.5 0 0 0-1.4.9z' />
  </I>
);

export const IcSun = (p: P) => (
  <I {...p}>
    <circle cx='12' cy='12' r='4.2' />
    <path d='M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7' />
  </I>
);

export const IcMoon = (p: P) => (
  <I {...p}>
    <path d='M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5z' />
  </I>
);

export const IcSend = (p: P) => (
  <I {...p} fill='currentColor' strokeWidth={0}>
    <path d='M3.4 10.9 19.6 3.6c1-.5 2 .6 1.6 1.6l-6.6 16.1c-.4 1.1-2 1-2.4-.1l-2-5.6a1 1 0 0 0-.6-.6l-5.7-2c-1.1-.4-1.2-2-.1-2.5z' />
  </I>
);

export const IcSmile = (p: P) => (
  <I {...p}>
    <circle cx='12' cy='12' r='9' />
    <path d='M8.5 14.5a4.5 4.5 0 0 0 7 0' />
    <circle cx='9' cy='9.8' r='0.4' fill='currentColor' />
    <circle cx='15' cy='9.8' r='0.4' fill='currentColor' />
  </I>
);

export const IcClip = (p: P) => (
  <I {...p}>
    <path d='M20.4 11.5 12 19.9a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8' />
  </I>
);

export const IcShuffle = (p: P) => (
  <I {...p}>
    <path d='M16 3h5v5' />
    <path d='M4 20 21 3' />
    <path d='M21 16v5h-5' />
    <path d='m15 15 6 6M4 4l5 5' />
  </I>
);

export const IcFlag = (p: P) => (
  <I {...p}>
    <path d='M5 21V4M5 4h11l-1.6 3.5L16 11H5' />
  </I>
);

export const IcClose = (p: P) => (
  <I {...p}>
    <path d='M6 6l12 12M18 6 6 18' />
  </I>
);

export const IcCheck = (p: P) => (
  <I {...p}>
    <path d='M5 12.5 10 17.5 19.5 7' />
  </I>
);

export const IcBell = (p: P) => (
  <I {...p}>
    <path d='M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5z' />
    <path d='M10.3 20a2 2 0 0 0 3.4 0' />
  </I>
);

export const IcChevR = (p: P) => (
  <I {...p}>
    <path d='M9 6l6 6-6 6' />
  </I>
);

export const IcChevL = (p: P) => (
  <I {...p}>
    <path d='M15 6l-6 6 6 6' />
  </I>
);

export const IcSparkle = (p: P) => (
  <I {...p} fill='currentColor' strokeWidth={0}>
    <path d='M12 2.5c.4 3.8 1.7 5.1 5.5 5.5-3.8.4-5.1 1.7-5.5 5.5-.4-3.8-1.7-5.1-5.5-5.5 3.8-.4 5.1-1.7 5.5-5.5z' />
    <path d='M18.5 13.5c.2 1.9.9 2.6 2.8 2.8-1.9.2-2.6.9-2.8 2.8-.2-1.9-.9-2.6-2.8-2.8 1.9-.2 2.6-.9 2.8-2.8z' />
  </I>
);

export const IcGlobe = (p: P) => (
  <I {...p}>
    <circle cx='12' cy='12' r='9' />
    <path d='M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18' />
  </I>
);

export const IcPanel = (p: P) => (
  <I {...p}>
    <rect x='3' y='4' width='18' height='16' rx='3' />
    <path d='M15 4v16' />
  </I>
);

export const IcImage = (p: P) => (
  <I {...p}>
    <rect x='3' y='4' width='18' height='16' rx='3' />
    <circle cx='8.5' cy='9.5' r='1.6' />
    <path d='m4 17 4.5-4.5a2 2 0 0 1 2.8 0L20 21' />
  </I>
);

export const IcMars = (p: P) => (
  <I {...p} size={p.size ?? 14}>
    <circle cx='10' cy='14' r='5.5' />
    <path d='M14 10l6-6M15 4h5v5' />
  </I>
);

export const IcVenus = (p: P) => (
  <I {...p} size={p.size ?? 14}>
    <circle cx='12' cy='9' r='5.5' />
    <path d='M12 14.5V22M8.5 19h7' />
  </I>
);
