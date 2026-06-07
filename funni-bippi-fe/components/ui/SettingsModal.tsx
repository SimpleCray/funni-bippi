'use client';

import { useSettingsStore } from '@/store/settingsStore';
import { ACCENT_COLORS } from '@/lib/constants';
import { IcClose, IcCheck, IcSparkle, IcSun, IcMoon, IcBell } from './icons';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const {
    accent,
    setAccent,
    theme,
    setTheme,
    notifyMatch,
    setNotifyMatch,
    notifySound,
    setNotifySound,
    showTyping,
    setShowTyping,
  } = useSettingsStore();

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button className={'tog' + (on ? ' on' : '')} onClick={onClick}>
      <span className='knob' />
    </button>
  );

  return (
    <div
      className='modal-scrim'
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).classList.contains('modal-scrim')) onClose();
      }}
    >
      <div className='modal scroll'>
        <div className='modal-head'>
          <h2>Settings</h2>
          <button className='icon-btn round' onClick={onClose}>
            <IcClose size={20} />
          </button>
        </div>
        <div className='modal-body'>
          <div className='set-group'>
            <div className='set-title'>
              <IcSparkle size={16} /> Theme color
            </div>
            <div className='theme-grid'>
              {ACCENT_COLORS.map((s) => (
                <div
                  key={s.id}
                  className={'theme-pick' + (accent === s.id ? ' on' : '')}
                  style={{ background: s.grad, color: s.hex }}
                  onClick={() => setAccent(s.id)}
                >
                  <span className='tick'>
                    <IcCheck size={22} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className='set-group'>
            <div className='set-title'>Appearance</div>
            <div className='mode-toggle'>
              <div
                className={'mode-card' + (theme === 'light' ? ' on' : '')}
                onClick={() => setTheme('light')}
              >
                <div className='swatch-prev' style={{ background: '#FBF5EF' }} />
                <span>
                  <IcSun size={15} style={{ verticalAlign: '-2px' }} /> Light
                </span>
              </div>
              <div
                className={'mode-card' + (theme === 'dark' ? ' on' : '')}
                onClick={() => setTheme('dark')}
              >
                <div className='swatch-prev' style={{ background: '#181410' }} />
                <span>
                  <IcMoon size={15} style={{ verticalAlign: '-2px' }} /> Dark
                </span>
              </div>
            </div>
          </div>

          <div className='set-group'>
            <div className='set-title'>
              <IcBell size={16} /> Notifications
            </div>
            <div className='set-row'>
              <div className='lbl'>
                New match alerts<small>Buzz when we find someone</small>
              </div>
              <Toggle on={notifyMatch} onClick={() => setNotifyMatch(!notifyMatch)} />
            </div>
            <div className='set-row'>
              <div className='lbl'>
                Message sounds<small>Soft bloop on new messages</small>
              </div>
              <Toggle on={notifySound} onClick={() => setNotifySound(!notifySound)} />
            </div>
            <div className='set-row'>
              <div className='lbl'>
                Show typing indicator<small>Let others see when you type</small>
              </div>
              <Toggle on={showTyping} onClick={() => setShowTyping(!showTyping)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
