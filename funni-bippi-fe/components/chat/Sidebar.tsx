'use client';

import { Logo } from '@/components/brand/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { IcChat, IcUser, IcSettings, IcSun, IcMoon } from '@/components/ui/icons';
import { ACCENT_COLORS } from '@/lib/constants';
import type { AccentColor, Stranger, Theme } from '@/types';

const ME: Stranger = {
  name: 'You',
  grad: ['var(--accent)', 'var(--accent-2)'],
  glyph: 'Y',
  gender: 'any',
  country: '',
  interests: [],
};

interface SidebarProps {
  nav: 'chat' | 'profile';
  setNav: (n: 'chat' | 'profile') => void;
  accent: AccentColor;
  setAccent: (a: AccentColor) => void;
  theme: Theme;
  toggleTheme: () => void;
  onLogo: () => void;
  openSettings: () => void;
}

export function Sidebar({
  nav,
  setNav,
  accent,
  setAccent,
  theme,
  toggleTheme,
  onLogo,
  openSettings,
}: SidebarProps) {
  return (
    <div className='sidebar'>
      <div onClick={onLogo} title='Funni Bippi' style={{ cursor: 'pointer' }}>
        <Logo size={42} />
      </div>
      <div className='side-nav'>
        <button
          className={'icon-btn' + (nav === 'chat' ? ' active' : '')}
          onClick={() => setNav('chat')}
          title='Chat'
        >
          <IcChat size={22} />
        </button>
        <button
          className={'icon-btn' + (nav === 'profile' ? ' active' : '')}
          onClick={() => setNav('profile')}
          title='Profile'
        >
          <IcUser size={22} />
        </button>
      </div>
      <div style={{ flex: 1 }} />
      {/* <div className='side-swatches'>
        {ACCENT_COLORS.slice(0, 3).map((a) => (
          <span
            key={a.id}
            className={'swatch' + (accent === a.id ? ' on' : '')}
            style={{ background: a.hex, color: a.hex }}
            onClick={() => setAccent(a.id)}
            title={a.id}
          />
        ))}
      </div> */}
      <button className='icon-btn' onClick={openSettings} title='Settings'>
        <IcSettings size={22} />
      </button>
      <div className='side-sep' />
      <button className='icon-btn round' onClick={toggleTheme} title='Toggle light / dark'>
        {theme === 'dark' ? <IcSun size={20} /> : <IcMoon size={20} />}
      </button>
    </div>
  );
}
