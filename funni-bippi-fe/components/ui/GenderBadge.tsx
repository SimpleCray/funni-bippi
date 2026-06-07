'use client';

import type { Gender } from '@/types';
import { IcMars, IcVenus, IcGlobe } from './icons';

export function GenderBadge({ gender }: { gender: Gender }) {
  if (gender === 'male')
    return (
      <span className='gender-badge gb-male'>
        <IcMars size={12} /> Male
      </span>
    );
  if (gender === 'female')
    return (
      <span className='gender-badge gb-female'>
        <IcVenus size={12} /> Female
      </span>
    );
  return (
    <span className='gender-badge gb-any'>
      <IcGlobe size={12} /> Anyone
    </span>
  );
}
