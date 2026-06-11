'use client';

import { useState, useEffect } from 'react';
import { Mascot } from '@/components/brand/Mascot';
import { MATCHING_COPY } from '@/lib/constants';
import { useSettingsStore } from '@/store/settingsStore';

interface MatchmakingScreenProps {
  onCancel: () => void;
}

export function MatchmakingScreen({ onCancel }: MatchmakingScreenProps) {
  const [copyIdx, setCopyIdx] = useState(0);
  const { myInterest } = useSettingsStore();

  useEffect(() => {
    const id = setInterval(() => setCopyIdx((v) => (v + 1) % MATCHING_COPY.length), 1400);
    return () => clearInterval(id);
  }, []);

  const who =
    myInterest === 'everyone' ? 'anyone friendly' : myInterest === 'male' ? 'a guy' : 'a gal';

  return (
    <div className='match-screen fade-screen'>
      <div className='radar'>
        <div className='ring' />
        <div className='ring' style={{ animationDelay: '0.8s' }} />
        <div className='ring' style={{ animationDelay: '1.6s' }} />
        <div className='core'>
          <Mascot size={70} bob={false} />
        </div>
      </div>
      <div>
        <div className='match-copy'>
          {MATCHING_COPY[copyIdx]}
          <span className='match-dots'>
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className='match-sub' style={{ marginTop: 12 }}>
          Matching you with {who} who&apos;s online right now.
        </div>
      </div>
      <button className='btn btn-ghost' onClick={onCancel} style={{ marginTop: 6 }}>
        Cancel
      </button>
    </div>
  );
}
