'use client';

import type { IcebreakerItem, Stranger } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { GenderBadge } from '@/components/ui/GenderBadge';
import { IcShuffle, IcFlag } from '@/components/ui/icons';

interface ProfilePanelProps {
  stranger: Stranger;
  icebreakers: IcebreakerItem[];
  collapsed: boolean;
  onNext: () => void;
  onReport: () => void;
  onUseIce: (text: string) => void;
}

export function ProfilePanel({
  stranger,
  icebreakers,
  collapsed,
  onNext,
  onReport,
  onUseIce,
}: ProfilePanelProps) {
  return (
    <div className={'right' + (collapsed ? ' collapsed' : '')}>
      <div className='right-inner scroll'>
        <div className='panel-card'>
          <div className='big-ava'>
            <Avatar stranger={stranger} size={84} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
            {stranger.name}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
              margin: '10px 0 4px',
            }}
          >
            <GenderBadge gender={stranger.gender} />
            <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>looking for</span>
            <GenderBadge gender={stranger.interest} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 8 }}>
            {stranger.country}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 9 }}>
          <button
            className='btn btn-soft'
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onNext}
          >
            <IcShuffle size={17} /> Next
          </button>
          <button
            className='btn btn-danger'
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onReport}
          >
            <IcFlag size={16} /> Report
          </button>
        </div>

        <div>
          <div className='panel-label'>Icebreakers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {icebreakers.map((ib, i) => (
              <button key={i} className='ice-card' onClick={() => onUseIce(ib.parts.join(''))}>
                <span className='ice-emoji'>{ib.e}</span>
                <span className='ice-text'>
                  {ib.parts[0]}
                  <b>{ib.parts[1]}</b>
                  {ib.parts[2]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
