'use client'

import { Logo } from '@/components/brand/Logo'
import { Mascot } from '@/components/brand/Mascot'
import { IcSparkle, IcGlobe, IcMars, IcVenus, IcSun, IcMoon, IcSettings } from '@/components/ui/icons'
import { useChatStore } from '@/store/chatStore'
import { ACCENT_COLORS, GENDER_FILTERS } from '@/lib/constants'
import type { AccentColor, Theme } from '@/types'

interface LandingScreenProps {
  theme: Theme
  toggleTheme: () => void
  accent: AccentColor
  setAccent: (a: AccentColor) => void
  onStart: () => void
  openSettings: () => void
}

const FILTER_ICONS = { everyone: IcGlobe, male: IcMars, female: IcVenus }

export function LandingScreen({ theme, toggleTheme, accent, setAccent, onStart, openSettings }: LandingScreenProps) {
  const { filter, setFilter } = useChatStore()

  return (
    <div className="landing fade-screen">
      {/* decorative blobs */}
      <div className="deco float" style={{ width: 240, height: 240, background: 'var(--accent)', top: '-60px', left: '-50px' }} />
      <div className="deco float" style={{ width: 180, height: 180, background: 'var(--accent-2)', bottom: '6%', right: '-40px', animationDelay: '1.5s' }} />

      {/* floating speech bubbles */}
      <div className="deco-bubble float" style={{ top: '20%', left: '9%', animationDelay: '.4s' }}>
        <span style={{ fontSize: 18 }}>👋</span> hi there!
      </div>
      <div className="deco-bubble float" style={{ bottom: '22%', right: '11%', animationDelay: '1s' }}>
        <span style={{ fontSize: 18 }}>✨</span> nice to meet you
      </div>
      <div className="deco-bubble float" style={{ top: '30%', right: '16%', animationDelay: '1.8s', borderRadius: '24px 24px 8px 24px' }}>
        <span style={{ fontSize: 18 }}>🧋</span> what&apos;s up?
      </div>

      <header className="landing-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <Logo size={40} />
          <span className="wordmark" style={{ fontSize: 21 }}>Funni Bippi</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="icon-btn round" onClick={toggleTheme} title="Theme">
            {theme === 'dark' ? <IcSun size={20} /> : <IcMoon size={20} />}
          </button>
          <button className="icon-btn round" onClick={openSettings} title="Settings">
            <IcSettings size={21} />
          </button>
        </div>
      </header>

      <div className="landing-hero">
        <div style={{ marginBottom: 6 }}>
          <Mascot size={104} />
        </div>
        <div className="eyebrow"><IcSparkle size={15} /> Meet someone new, right now</div>
        <h1 className="hero-title">
          World without <span className="hl">strangers.</span>
        </h1>
        <p className="hero-sub">
          One tap drops you into a friendly chat with a real human somewhere on Earth.
          No profiles, no pressure — just good conversation and great vibes.
        </p>

        <div className="hero-cta-row">
          <button className="btn btn-primary huge pulse-hover" onClick={onStart}>
            Start Chatting ✨
          </button>
          <div className="filter-label">I&apos;d like to chat with</div>
          <div className="seg">
            {GENDER_FILTERS.map(f => {
              const Icon = FILTER_ICONS[f.id]
              return (
                <button
                  key={f.id}
                  className={filter === f.id ? 'on' : ''}
                  onClick={() => setFilter(f.id)}
                >
                  <Icon size={15} /> {f.label}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginTop: 4 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>theme</span>
            {ACCENT_COLORS.slice(0, 3).map(a => (
              <span
                key={a.id}
                className={'swatch' + (accent === a.id ? ' on' : '')}
                style={{ background: a.hex, color: a.hex }}
                onClick={() => setAccent(a.id)}
                title={a.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
