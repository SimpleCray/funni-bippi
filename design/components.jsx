/* components.jsx — shared building blocks. Pulls icons/mascot/data off window. */
const {
  IcChat, IcUser, IcSettings, IcSun, IcMoon, IcSend, IcSmile, IcClip, IcNext,
  IcShuffle, IcFlag, IcClose, IcCheck, IcBell, IcChevR, IcChevL, IcSparkle,
  IcGlobe, IcPanel, IcImage, IcMars, IcVenus, Mascot, Logo,
  EMOJI, QUICK_REACTS, ICEBREAKERS,
} = window;

/* ---------- Avatar ---------- */
function Avatar({ stranger, size = 40, online = false, dotSize }) {
  const ds = dotSize || Math.max(9, size * 0.26);
  return (
    <div className="avatar" style={{ width: size, height: size, background: stranger.grad, fontSize: size * 0.42 }}>
      <span className="glyph">{stranger.glyph}</span>
      {online && <span className="status-dot" style={{ width: ds, height: ds, right: size*0.02, bottom: size*0.02 }} />}
    </div>
  );
}

function GenderBadge({ g }) {
  if (g === "male") return <span className="gender-badge gb-male"><IcMars size={12} /> Male</span>;
  if (g === "female") return <span className="gender-badge gb-female"><IcVenus size={12} /> Female</span>;
  return <span className="gender-badge gb-any"><IcGlobe size={12} /> Anyone</span>;
}

/* ---------- Chat bubble (hover → timestamp + reaction bar) ---------- */
function Bubble({ m, onReact }) {
  const mine = m.from === "me";
  return (
    <div className={"row " + (mine ? "me" : "them")}>
      {!mine && <Avatar stranger={m.stranger} size={32} />}
      <div className="stack">
        <div className="react-bar">
          {QUICK_REACTS.map(e => (
            <button key={e} onClick={() => onReact(m.id, e)}>{e}</button>
          ))}
        </div>
        <div className={"bubble " + (mine ? "me" : "them")}>
          {m.text}
          {m.reaction && <span className="reaction-chip">{m.reaction}</span>}
        </div>
        <div className="ts">{m.time}</div>
      </div>
    </div>
  );
}

function Typing({ stranger }) {
  return (
    <div className="row them" style={{ marginTop: 8 }}>
      <Avatar stranger={stranger} size={32} />
      <div className="typing"><span></span><span></span><span></span></div>
    </div>
  );
}

/* ---------- Emoji picker (spring pop) ---------- */
function EmojiPicker({ onPick, onClose }) {
  React.useEffect(() => {
    const h = (e) => { if (!e.target.closest(".emoji-pop") && !e.target.closest(".emoji-trigger")) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="emoji-pop">
      {Object.entries(EMOJI).map(([cat, list]) => (
        <div key={cat}>
          <div className="cat">{cat}</div>
          <div className="emoji-grid scroll" style={{ maxHeight: cat === "Smileys" ? 110 : 80 }}>
            {list.map((e, i) => <button key={i} onClick={() => onPick(e)}>{e}</button>)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Composer ---------- */
function Composer({ onSend, compact = false }) {
  const [val, setVal] = React.useState("");
  const [focus, setFocus] = React.useState(false);
  const [emoji, setEmoji] = React.useState(false);
  const inputRef = React.useRef(null);
  const submit = () => {
    const t = val.trim();
    if (!t) return;
    onSend(t); setVal(""); setEmoji(false);
    inputRef.current && inputRef.current.focus();
  };
  return (
    <div style={{ position: "relative" }}>
      {emoji && <EmojiPicker onPick={(e) => { setVal(v => v + e); inputRef.current && inputRef.current.focus(); }} onClose={() => setEmoji(false)} />}
      <div className={"composer-bar" + (focus ? " focus" : "")}>
        <button className="icon-btn round emoji-trigger" style={{ width: 38, height: 38 }}
                onClick={() => setEmoji(v => !v)} title="Emoji"><IcSmile size={21} /></button>
        {!compact && <button className="icon-btn round" style={{ width: 38, height: 38 }} title="Attach image"><IcClip size={20} /></button>}
        <input ref={inputRef} value={val} placeholder="Say something nice…"
               onChange={e => setVal(e.target.value)}
               onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
               onKeyDown={e => { if (e.key === "Enter") submit(); }} />
        <button className="send-btn pulse-hover" onClick={submit} disabled={!val.trim()} title="Send"><IcSend size={20} /></button>
      </div>
    </div>
  );
}

/* ---------- Icebreaker card ---------- */
function Icebreaker({ ib, onUse }) {
  return (
    <button className="ice-card" onClick={() => onUse(ib.html.join(""))}>
      <span className="ice-emoji">{ib.e}</span>
      <span className="ice-text">{ib.html[0]}<b>{ib.html[1]}</b>{ib.html[2]}</span>
    </button>
  );
}

/* ---------- Right profile panel ---------- */
function ProfilePanel({ stranger, onNext, onReport, onUseIce, ices }) {
  return (
    <div className="right-inner scroll">
      <div className="panel-card">
        <div className="big-ava"><Avatar stranger={stranger} size={84} online /></div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>{stranger.name}</div>
        <div style={{ display: "flex", justifyContent: "center", margin: "10px 0 4px" }}><GenderBadge g={stranger.gender} /></div>
        <div style={{ fontSize: 13, color: "var(--text-soft)", marginTop: 8 }}>{stranger.country}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 14 }}>
          {stranger.interests.map((it, i) => (
            <span key={i} style={{ fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 99, background: "var(--accent-soft)", color: "var(--accent-strong)" }}>{it}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 9 }}>
        <button className="btn btn-soft" style={{ flex: 1, justifyContent: "center" }} onClick={onNext}><IcShuffle size={17} /> Next</button>
        <button className="btn btn-danger" style={{ flex: 1, justifyContent: "center" }} onClick={onReport}><IcFlag size={16} /> Report</button>
      </div>

      <div>
        <div className="panel-label">Icebreakers</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {ices.map((ib, i) => <Icebreaker key={i} ib={ib} onUse={onUseIce} />)}
        </div>
      </div>
    </div>
  );
}

/* ---------- Sidebar ---------- */
const ACCENTS = [
  { id: "coral",  c: "#FF6B5E" },
  { id: "teal",   c: "#16BFAE" },
  { id: "yellow", c: "#FFB627" },
];
function Sidebar({ me, nav, setNav, accent, setAccent, theme, toggleTheme, onLogo, openSettings }) {
  return (
    <div className="sidebar">
      <div onClick={onLogo} title="Funni Bippi"><Logo size={42} /></div>
      <div style={{ position: "relative" }}><Avatar stranger={me} size={46} online /></div>
      <div className="side-nav">
        <button className={"icon-btn" + (nav === "chat" ? " active" : "")} onClick={() => setNav("chat")} title="Chat"><IcChat size={22} /></button>
        <button className={"icon-btn" + (nav === "profile" ? " active" : "")} onClick={() => setNav("profile")} title="Profile"><IcUser size={22} /></button>
        <button className="icon-btn" onClick={openSettings} title="Settings"><IcSettings size={22} /></button>
      </div>
      <div style={{ flex: 1 }} />
      <div className="side-swatches">
        {ACCENTS.map(a => (
          <span key={a.id} className={"swatch" + (accent === a.id ? " on" : "")}
                style={{ background: a.c, color: a.c }} onClick={() => setAccent(a.id)} title={a.id} />
        ))}
      </div>
      <div className="side-sep" />
      <button className="icon-btn round" onClick={toggleTheme} title="Toggle light / dark">
        {theme === "dark" ? <IcSun size={20} /> : <IcMoon size={20} />}
      </button>
    </div>
  );
}

/* ---------- Toast + confetti ---------- */
function Toast({ icon, children }) {
  return (
    <div className="toast-wrap">
      <div className="toast"><span className="spark">{icon}</span>{children}</div>
    </div>
  );
}
function fireConfetti() {
  const colors = ["#FF8E6B","#16BFAE","#FFB627","#4A90FF","#FF6F9E","#3CC97B"];
  const n = 70;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.left = Math.random() * 100 + "vw";
    p.style.background = colors[i % colors.length];
    p.style.setProperty("--dur", (2 + Math.random() * 1.6) + "s");
    p.style.setProperty("--rot", (300 + Math.random() * 540) + "deg");
    p.style.top = (-10 - Math.random() * 20) + "px";
    p.style.animationDelay = Math.random() * 0.3 + "s";
    if (Math.random() > 0.5) p.style.borderRadius = "50%";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 4200);
  }
}

Object.assign(window, {
  Avatar, GenderBadge, Bubble, Typing, EmojiPicker, Composer, Icebreaker,
  ProfilePanel, Sidebar, Toast, fireConfetti, ACCENTS,
});
