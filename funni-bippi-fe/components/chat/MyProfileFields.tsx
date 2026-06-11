'use client';

import { IcMars, IcVenus, IcGlobe } from '@/components/ui/icons';
import { useSettingsStore } from '@/store/settingsStore';
import { MY_GENDER_OPTIONS, INTEREST_OPTIONS } from '@/lib/constants';

const GENDER_ICONS = { male: IcMars, female: IcVenus };
const INTEREST_ICONS = { everyone: IcGlobe, male: IcMars, female: IcVenus };

export function MyProfileFields() {
  const { myGender, setMyGender, myInterest, setMyInterest } = useSettingsStore();

  return (
    <>
      <div className='panel-label' style={{ textAlign: 'left' }}>
        I am a
      </div>
      <div className='seg seg-sm' style={{ marginBottom: 18 }}>
        {MY_GENDER_OPTIONS.map((g) => {
          const Icon = GENDER_ICONS[g.id];
          return (
            <button
              key={g.id}
              className={myGender === g.id ? 'on' : ''}
              onClick={() => setMyGender(g.id)}
            >
              <Icon size={15} /> {g.label}
            </button>
          );
        })}
      </div>

      <div className='panel-label' style={{ textAlign: 'left' }}>
        I&apos;d like to chat with
      </div>
      <div className='seg seg-sm'>
        {INTEREST_OPTIONS.map((i) => {
          const Icon = INTEREST_ICONS[i.id];
          return (
            <button
              key={i.id}
              className={myInterest === i.id ? 'on' : ''}
              onClick={() => setMyInterest(i.id)}
            >
              <Icon size={15} /> {i.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
