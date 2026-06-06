/* app.jsx — Funni Bippi orchestrator: routing, conversation engine, tweaks. */
const {
  Sidebar, Avatar, GenderBadge, Bubble, Typing, Composer, ProfilePanel, Icebreaker,
  Toast, fireConfetti, Landing, Matchmaking, Settings,
  Mascot, Logo, IcChat, IcUser, IcSettings, IcShuffle, IcFlag, IcPanel, IcClose,
  IcChevR, IcSparkle, makeStranger, autoReply, OPENERS, ICEBREAKERS, pickRand,
  IOSDevice, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle,
} = window;

const fmtTime = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const ME = { name: "You", grad: "var(--accent-grad)", glyph: "Y", gender: "any" };
const sampleIces = () => [...ICEBREAKERS].sort(() => Math.random() - 0.5).slice(0, 4);

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "coral",
  "dark": false,
  "device": "desktop",
  "bubble": "filled",
  "motion": "lively"
}/*EDITMODE-END*/;

function useNarrow() {
  const [n, setN] = React.useState(() => window.innerWidth < 720);
  React.useEffect(() => {
    const h = () => setN(window.innerWidth < 720);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return n;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = t.dark ? "dark" : "light";
  const accent = t.accent;
  const setAccent = (id) => setTweak("accent", id);
  const setTheme = (m) => setTweak("dark", m === "dark");
  const toggleTheme = () => setTweak("dark", !t.dark);

  const [screen, setScreen] = React.useState("landing"); // landing | matching | chat
  const [nav, setNav] = React.useState("chat");
  const [filter, setFilter] = React.useState("everyone");
  const [stranger, setStranger] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [typing, setTyping] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [rightOpen, setRightOpen] = React.useState(true);
  const [ices, setIces] = React.useState(sampleIces);
  const [prefs, setPrefs] = React.useState({ match: true, sound: true, typing: true });

  const narrow = useNarrow();
  const mobile = t.device === "mobile" || narrow;
  const framed = t.device === "mobile" && !narrow;

  // reflect tokens on root
  React.useEffect(() => {
    const r = document.querySelector(".app-root");
    if (!r) return;
    r.setAttribute("data-theme", theme);
    r.setAttribute("data-accent", accent);
    r.setAttribute("data-bubble", t.bubble);
    r.setAttribute("data-motion", t.motion);
  }, [theme, accent, t.bubble, t.motion]);

  const convo = React.useRef(0);
  const timers = React.useRef([]);
  const after = (ms, fn) => { const id = setTimeout(fn, ms); timers.current.push(id); };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const msgsRef = React.useRef(null);
  React.useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const flashToast = (icon, text, ms = 2600) => {
    setToast({ icon, text });
    after(ms, () => setToast(null));
  };

  function strangerSpeaks(s, text, id) {
    if (convo.current !== id) return;
    setTyping(true);
    after(900 + Math.random() * 900, () => {
      if (convo.current !== id) return;
      setTyping(false);
      setMessages(m => [...m, { id: Date.now() + Math.random(), from: "them", text, time: fmtTime(), stranger: s }]);
    });
  }

  function beginConversation(s) {
    const id = ++convo.current;
    setStranger(s);
    setMessages([]);
    setIces(sampleIces());
    after(700, () => strangerSpeaks(s, pickRand(OPENERS), id));
  }

  function startMatch() {
    setScreen("matching");
    clearTimers();
    after(2600, () => {
      const s = makeStranger(filter);
      setScreen("chat");
      setNav("chat");
      beginConversation(s);
      if (prefs.match) { flashToast("✨", "You matched! Say hi 👋"); fireConfetti(); }
    });
  }

  function nextStranger() {
    clearTimers();
    setTyping(false);
    setScreen("matching");
    after(1600, () => {
      const s = makeStranger(filter);
      setScreen("chat");
      beginConversation(s);
      flashToast("🔀", "New friend incoming!");
    });
  }

  function report() {
    flashToast("🚩", "Thanks — reported. Finding someone new…");
    nextStranger();
  }

  function send(text) {
    const id = convo.current;
    setMessages(m => [...m, { id: Date.now() + Math.random(), from: "me", text, time: fmtTime(), stranger: ME }]);
    after(550, () => strangerSpeaks(stranger, autoReply(text), id));
  }

  function react(mid, emoji) {
    setMessages(m => m.map(x => x.id === mid ? { ...x, reaction: x.reaction === emoji ? null : emoji } : x));
  }

  function goHome() {
    clearTimers(); setTyping(false); setScreen("landing"); setMessages([]); setStranger(null);
  }

  React.useEffect(() => () => clearTimers(), []);

  /* ---------- shared bits ---------- */
  const toastNode = toast && <Toast icon={toast.icon}>{toast.text}</Toast>;
  const settingsNode = settingsOpen && (
    <Settings accent={accent} setAccent={setAccent} theme={theme} setTheme={setTheme}
              prefs={prefs} setPrefs={setPrefs} onClose={() => setSettingsOpen(false)} />
  );

  const tweaksNode = (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Preview" />
      <TweakRadio label="Device" value={t.device} options={["desktop", "mobile"]} onChange={v => setTweak("device", v)} />
      <TweakSection label="Theme" />
      <TweakColor label="Accent" value={t.accent} options={["#FF6B5E", "#16BFAE", "#FFB627"]}
                  onChange={hex => setAccent({ "#FF6B5E": "coral", "#16BFAE": "teal", "#FFB627": "yellow" }[hex])} />
      <TweakToggle label="Dark mode" value={t.dark} onChange={v => setTweak("dark", v)} />
      <TweakSection label="Style" />
      <TweakRadio label="Bubbles" value={t.bubble} options={["filled", "soft", "outline"]} onChange={v => setTweak("bubble", v)} />
      <TweakRadio label="Motion" value={t.motion} options={["lively", "calm"]} onChange={v => setTweak("motion", v)} />
    </TweaksPanel>
  );

  /* ---------- DESKTOP CHAT ---------- */
  function DesktopChat() {
    return (
      <div className="layout">
        <Sidebar me={ME} nav={nav} setNav={setNav} accent={accent} setAccent={setAccent}
                 theme={theme} toggleTheme={toggleTheme} onLogo={goHome} openSettings={() => setSettingsOpen(true)} />
        <div className="center">
          <div className="chat-topbar">
            {stranger && <Avatar stranger={stranger} size={46} online />}
            <div className="who">
              <div className="name">{stranger ? stranger.name : "—"} {stranger && <GenderBadge g={stranger.gender} />}</div>
              <div className="sub"><span className="conn-live"><span className="blip" /> Connected</span> · anonymous chat</div>
            </div>
            <div style={{ flex: 1 }} />
            <button className="btn btn-soft" onClick={nextStranger}><IcShuffle size={16} /> Next stranger</button>
            <button className="icon-btn" onClick={() => setRightOpen(o => !o)} title="Toggle profile panel"><IcPanel size={21} /></button>
          </div>

          {nav === "profile" ? <ProfileView /> : (
            <>
              <div className="msgs scroll" ref={msgsRef}>
                <div className="day-pill">Today · you're now chatting 🎉</div>
                {messages.map(m => <Bubble key={m.id} m={m} onReact={react} />)}
                {typing && stranger && <Typing stranger={stranger} />}
              </div>
              <div className="composer"><Composer onSend={send} /></div>
            </>
          )}
        </div>

        <div className={"right" + (rightOpen ? "" : " collapsed")}>
          {stranger && <ProfilePanel stranger={stranger} onNext={nextStranger} onReport={report} onUseIce={send} ices={ices} />}
        </div>
      </div>
    );
  }

  function ProfileView() {
    return (
      <div className="msgs scroll" style={{ alignItems: "center", justifyContent: "center", gap: 16 }}>
        <Mascot size={96} />
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 }}>This is you 👋</div>
        <div className="panel-card" style={{ width: 320 }}>
          <div className="big-ava"><Avatar stranger={ME} size={80} online /></div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>Anonymous You</div>
          <div style={{ fontSize: 13, color: "var(--text-soft)", marginTop: 6 }}>You appear to strangers with a fun random name each chat. No photos, no real name — just vibes.</div>
        </div>
        <button className="btn btn-ghost" onClick={() => setNav("chat")}><IcChat size={17} /> Back to chat</button>
      </div>
    );
  }

  /* ---------- MOBILE ---------- */
  function MobileApp() {
    const pad = framed ? { paddingTop: 50, paddingBottom: 24 } : {};
    let body;
    if (screen === "landing") {
      body = (
        <div className="m-landing">
          <Mascot size={92} />
          <div className="eyebrow" style={{ marginTop: 16 }}><IcSparkle size={14} /> Meet someone new</div>
          <h1 className="hero-title" style={{ fontSize: 40, margin: "10px 0 14px" }}>World without <span className="hl">strangers.</span></h1>
          <p className="hero-sub" style={{ fontSize: 15, marginBottom: 26 }}>One tap, one new friend, somewhere on Earth.</p>
          <div className="seg" style={{ marginBottom: 22 }}>
            {["everyone", "male", "female"].map(f => (
              <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)} style={{ padding: "9px 15px", textTransform: "capitalize" }}>{f}</button>
            ))}
          </div>
          <button className="btn btn-primary huge pulse-hover" style={{ width: "100%", justifyContent: "center" }} onClick={startMatch}>Start Chatting ✨</button>
        </div>
      );
    } else if (screen === "matching") {
      body = <Matchmaking filter={filter} onCancel={goHome} />;
    } else {
      body = (
        <div className="m-shell">
          <div className="m-topbar">
            <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={goHome}><IcChevR size={20} style={{ transform: "rotate(180deg)" }} /></button>
            {stranger && <Avatar stranger={stranger} size={38} online />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="name">{stranger && stranger.name}</div>
              <div className="sub"><span className="conn-live"><span className="blip" /> connected</span></div>
            </div>
            <button className="icon-btn" style={{ width: 38, height: 38 }} onClick={nextStranger} title="Next"><IcShuffle size={19} /></button>
            <button className="icon-btn" style={{ width: 38, height: 38 }} onClick={report} title="Report"><IcFlag size={18} /></button>
          </div>
          <div className="m-msgs scroll" ref={mobile ? msgsRef : null}>
            {messages.map(m => <Bubble key={m.id} m={m} onReact={react} />)}
            {typing && stranger && <Typing stranger={stranger} />}
          </div>
          <div style={{ display: "flex", gap: 7, padding: "0 12px 8px", overflowX: "auto" }} className="no-bar">
            {ices.slice(0, 4).map((ib, i) => (
              <button key={i} className="ice-card" style={{ flexShrink: 0, padding: "8px 12px", whiteSpace: "nowrap" }} onClick={() => send(ib.html.join(""))}>
                <span className="ice-emoji" style={{ fontSize: 16 }}>{ib.e}</span>
                <span className="ice-text" style={{ fontSize: 12.5 }}>{ib.html[1]}…</span>
              </button>
            ))}
          </div>
          <div className="m-composer"><Composer onSend={send} compact /></div>
        </div>
      );
    }
    return (
      <div className="m-shell" style={{ ...pad }}>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>{body}</div>
        {screen !== "matching" && (
          <div className="m-nav">
            <button className={nav === "chat" ? "on" : ""} onClick={() => { setNav("chat"); if (screen === "landing") {} }}><IcChat size={21} /> Chat</button>
            <button className={nav === "profile" ? "on" : ""} onClick={() => setNav("profile")}><IcUser size={21} /> Profile</button>
            <button onClick={() => setSettingsOpen(true)}><IcSettings size={21} /> Settings</button>
          </div>
        )}
      </div>
    );
  }

  /* ---------- RENDER ---------- */
  let main;
  if (mobile) {
    const mob = <MobileApp />;
    main = framed
      ? <div style={{ height: "100%", display: "grid", placeItems: "center", background: "var(--bg-sunken)" }}>
          <IOSDevice dark={theme === "dark"}>
            <div className="app-root" data-theme={theme} data-accent={accent} data-bubble={t.bubble} data-motion={t.motion} style={{ height: "100%" }}>{mob}</div>
          </IOSDevice>
        </div>
      : mob;
  } else if (screen === "landing") {
    main = <Landing filter={filter} setFilter={setFilter} onStart={startMatch} openSettings={() => setSettingsOpen(true)}
                    theme={theme} toggleTheme={toggleTheme} accent={accent} setAccent={setAccent} />;
  } else if (screen === "matching") {
    main = (
      <div className="layout">
        <Sidebar me={ME} nav={nav} setNav={setNav} accent={accent} setAccent={setAccent} theme={theme} toggleTheme={toggleTheme} onLogo={goHome} openSettings={() => setSettingsOpen(true)} />
        <div className="center"><Matchmaking filter={filter} onCancel={goHome} /></div>
      </div>
    );
  } else {
    main = <DesktopChat />;
  }

  return (
    <div className="app-root" data-theme={theme} data-accent={accent} data-bubble={t.bubble} data-motion={t.motion} data-screen-label={mobile ? "Mobile · " + screen : screen}>
      {main}
      {toastNode}
      {settingsNode}
      {tweaksNode}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
