/* screens.jsx — Landing, Matchmaking, Settings. Reads helpers off window. */
const {
  Logo, Mascot, IcSparkle, IcGlobe, IcMars, IcVenus, IcSettings, IcSun, IcMoon,
  IcClose, IcCheck, IcBell, Avatar, ACCENTS,
} = window;

const FILTERS = [
  { id: "everyone", label: "Everyone", icon: <IcGlobe size={15} /> },
  { id: "male",     label: "Male",     icon: <IcMars size={15} /> },
  { id: "female",   label: "Female",   icon: <IcVenus size={15} /> },
];

/* ---------------- LANDING ---------------- */
function Landing({ filter, setFilter, onStart, openSettings, theme, toggleTheme, accent, setAccent }) {
  return (
    <div className="landing fade-screen">
      {/* deco */}
      <div className="deco float" style={{ width: 240, height: 240, background: "var(--accent)", top: "-60px", left: "-50px" }} />
      <div className="deco float" style={{ width: 180, height: 180, background: "var(--accent-2)", bottom: "6%", right: "-40px", animationDelay: "1.5s" }} />
      <div className="deco-bubble float" style={{ top: "20%", left: "9%", animationDelay: ".4s" }}>
        <span style={{ fontSize: 18 }}>👋</span> hi there!
      </div>
      <div className="deco-bubble float" style={{ bottom: "22%", right: "11%", animationDelay: "1s" }}>
        <span style={{ fontSize: 18 }}>✨</span> nice to meet you
      </div>
      <div className="deco-bubble float" style={{ top: "30%", right: "16%", animationDelay: "1.8s", borderRadius: "24px 24px 8px 24px" }}>
        <span style={{ fontSize: 18 }}>🧋</span> what's up?
      </div>

      <header className="landing-top">
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Logo size={40} />
          <span className="wordmark" style={{ fontSize: 21 }}>Funni Bippi</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="icon-btn round" onClick={toggleTheme} title="Theme">{theme === "dark" ? <IcSun size={20} /> : <IcMoon size={20} />}</button>
          <button className="icon-btn round" onClick={openSettings} title="Settings"><IcSettings size={21} /></button>
        </div>
      </header>

      <div className="landing-hero">
        <div style={{ marginBottom: 6 }}><Mascot size={104} /></div>
        <div className="eyebrow"><IcSparkle size={15} /> Meet someone new, right now</div>
        <h1 className="hero-title">World without <span className="hl">strangers.</span></h1>
        <p className="hero-sub">One tap drops you into a friendly chat with a real human somewhere on Earth. No profiles, no pressure — just good conversation and great vibes.</p>

        <div className="hero-cta-row">
          <button className="btn btn-primary huge pulse-hover" onClick={onStart}>Start Chatting ✨</button>
          <div className="filter-label">I'd like to chat with</div>
          <div className="seg">
            {FILTERS.map(f => (
              <button key={f.id} className={filter === f.id ? "on" : ""} onClick={() => setFilter(f.id)}>{f.icon}{f.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 4 }}>
            <span style={{ fontSize: 12.5, color: "var(--text-faint)" }}>theme</span>
            {ACCENTS.map(a => (
              <span key={a.id} className={"swatch" + (accent === a.id ? " on" : "")} style={{ background: a.c, color: a.c }} onClick={() => setAccent(a.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- MATCHMAKING ---------------- */
const MATCH_LINES = [
  "Looking for someone cool…",
  "Tuning into the same wavelength…",
  "Shaking the friendship snow globe…",
  "Almost there — they seem nice 👀",
];
function Matchmaking({ filter, onCancel }) {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % MATCH_LINES.length), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="match-screen fade-screen">
      <div className="radar">
        <div className="ring" />
        <div className="ring" style={{ animationDelay: "0.8s" }} />
        <div className="ring" style={{ animationDelay: "1.6s" }} />
        <div className="core"><Mascot size={70} bob={false} /></div>
      </div>
      <div>
        <div className="match-copy">
          {MATCH_LINES[i]}
          <span className="match-dots"><i></i><i></i><i></i></span>
        </div>
        <div className="match-sub" style={{ marginTop: 12 }}>
          Matching you with {filter === "everyone" ? "anyone friendly" : filter === "male" ? "a guy" : "a gal"} who's online right now.
        </div>
      </div>
      <button className="btn btn-ghost" onClick={onCancel} style={{ marginTop: 6 }}>Cancel</button>
    </div>
  );
}

/* ---------------- SETTINGS ---------------- */
const THEME_SWATCHES = [
  { id: "coral",  c: "linear-gradient(135deg,#FF8E6B,#FF5E72)" },
  { id: "teal",   c: "linear-gradient(135deg,#2BD9C3,#11A6C7)" },
  { id: "yellow", c: "linear-gradient(135deg,#FFD25E,#FFA92E)" },
  { id: "blue",   c: "linear-gradient(135deg,#6EA8FF,#3C6BFF)" },
  { id: "pink",   c: "linear-gradient(135deg,#FF9EC8,#FF5E9E)" },
];
function Settings({ accent, setAccent, theme, setTheme, prefs, setPrefs, onClose }) {
  const Toggle = ({ on, onClick }) => (
    <button className={"tog" + (on ? " on" : "")} onClick={onClick}><span className="knob" /></button>
  );
  return (
    <div className="modal-scrim" onMouseDown={e => { if (e.target.classList.contains("modal-scrim")) onClose(); }}>
      <div className="modal scroll">
        <div className="modal-head">
          <h2>Settings</h2>
          <button className="icon-btn round" onClick={onClose}><IcClose size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="set-group">
            <div className="set-title"><IcSparkle size={16} /> Theme color</div>
            <div className="theme-grid">
              {THEME_SWATCHES.map(s => (
                <div key={s.id}
                     className={"theme-pick" + (accent === s.id ? " on" : "")}
                     style={{ background: s.c, color: s.id === "coral" ? "#FF6B5E" : s.id === "teal" ? "#16BFAE" : s.id === "yellow" ? "#FFB627" : s.id === "blue" ? "#3C6BFF" : "#FF5E9E" }}
                     onClick={() => setAccent(s.id)}>
                  <span className="tick"><IcCheck size={22} /></span>
                </div>
              ))}
            </div>
          </div>

          <div className="set-group">
            <div className="set-title">Appearance</div>
            <div className="mode-toggle">
              <div className={"mode-card" + (theme === "light" ? " on" : "")} onClick={() => setTheme("light")}>
                <div className="swatch-prev" style={{ background: "#FBF5EF" }} />
                <span><IcSun size={15} style={{ verticalAlign: "-2px" }} /> Light</span>
              </div>
              <div className={"mode-card" + (theme === "dark" ? " on" : "")} onClick={() => setTheme("dark")}>
                <div className="swatch-prev" style={{ background: "#181410" }} />
                <span><IcMoon size={15} style={{ verticalAlign: "-2px" }} /> Dark</span>
              </div>
            </div>
          </div>

          <div className="set-group">
            <div className="set-title"><IcBell size={16} /> Notifications</div>
            <div className="set-row">
              <div className="lbl">New match alerts<small>Buzz when we find someone</small></div>
              <Toggle on={prefs.match} onClick={() => setPrefs(p => ({ ...p, match: !p.match }))} />
            </div>
            <div className="set-row">
              <div className="lbl">Message sounds<small>Soft bloop on new messages</small></div>
              <Toggle on={prefs.sound} onClick={() => setPrefs(p => ({ ...p, sound: !p.sound }))} />
            </div>
            <div className="set-row">
              <div className="lbl">Show typing indicator<small>Let others see when you type</small></div>
              <Toggle on={prefs.typing} onClick={() => setPrefs(p => ({ ...p, typing: !p.typing }))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Landing, Matchmaking, Settings });
