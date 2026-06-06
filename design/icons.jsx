/* icons.jsx — friendly line/filled icons + the Funni Bippi mascot & logo.
   All icons inherit `currentColor`. Rounded caps/joins everywhere. */

const I = ({ d, size = 22, sw = 2, fill = "none", children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke={fill === "none" ? "currentColor" : "none"} strokeWidth={sw}
       strokeLinecap="round" strokeLinejoin="round" {...p}>
    {d ? <path d={d} /> : children}
  </svg>
);

const IcChat    = (p) => <I {...p} d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9.6 9.6 0 0 1-3.6-.7L3 21l1.7-5.4A8.4 8.4 0 0 1 4 11.5 8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />;
const IcUser    = (p) => <I {...p}><circle cx="12" cy="8" r="3.6" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></I>;
const IcSettings= (p) => <I {...p}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.1a2 2 0 0 1-4 0v-.2A1.7 1.7 0 0 0 8 18a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H2a2 2 0 0 1 0-4h.2A1.7 1.7 0 0 0 4 6a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 1.6 1.7 1.7 0 0 0 10 0" transform="translate(0 2.5) scale(0.96)" /></I>;
const IcSun     = (p) => <I {...p}><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" /></I>;
const IcMoon    = (p) => <I {...p} d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5z" />;
const IcSend    = (p) => <I {...p} fill="currentColor" sw={0}><path d="M3.4 10.9 19.6 3.6c1-.5 2 .6 1.6 1.6l-6.6 16.1c-.4 1.1-2 1-2.4-.1l-2-5.6a1 1 0 0 0-.6-.6l-5.7-2c-1.1-.4-1.2-2-.1-2.5z" /></I>;
const IcSmile   = (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0" /><circle cx="9" cy="9.8" r="0.4" fill="currentColor" /><circle cx="15" cy="9.8" r="0.4" fill="currentColor" /></I>;
const IcClip    = (p) => <I {...p} d="M20.4 11.5 12 19.9a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8" />;
const IcNext    = (p) => <I {...p} d="M5 12h13M12.5 5.5 19 12l-6.5 6.5M5 5.5v13" />;
const IcShuffle = (p) => <I {...p}><path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="m15 15 6 6M4 4l5 5" /></I>;
const IcFlag    = (p) => <I {...p} d="M5 21V4M5 4h11l-1.6 3.5L16 11H5" />;
const IcClose   = (p) => <I {...p} d="M6 6l12 12M18 6 6 18" />;
const IcCheck   = (p) => <I {...p} d="M5 12.5 10 17.5 19.5 7" />;
const IcBell    = (p) => <I {...p}><path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5z" /><path d="M10.3 20a2 2 0 0 0 3.4 0" /></I>;
const IcChevR   = (p) => <I {...p} d="M9 6l6 6-6 6" />;
const IcChevL   = (p) => <I {...p} d="M15 6l-6 6 6 6" />;
const IcSparkle = (p) => <I {...p} fill="currentColor" sw={0}><path d="M12 2.5c.4 3.8 1.7 5.1 5.5 5.5-3.8.4-5.1 1.7-5.5 5.5-.4-3.8-1.7-5.1-5.5-5.5 3.8-.4 5.1-1.7 5.5-5.5z" /><path d="M18.5 13.5c.2 1.9.9 2.6 2.8 2.8-1.9.2-2.6.9-2.8 2.8-.2-1.9-.9-2.6-2.8-2.8 1.9-.2 2.6-.9 2.8-2.8z" /></I>;
const IcGlobe   = (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" /></I>;
const IcPanel   = (p) => <I {...p}><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M15 4v16" /></I>;
const IcImage   = (p) => <I {...p}><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L20 21" /></I>;
const IcMars    = (p) => <I {...p} size={p.size||14}><circle cx="10" cy="14" r="5.5" /><path d="M14 10l6-6M15 4h5v5" /></I>;
const IcVenus   = (p) => <I {...p} size={p.size||14}><circle cx="12" cy="9" r="5.5" /><path d="M12 14.5V22M8.5 19h7" /></I>;

/* ---------- BLOB MASCOT ----------
   A round friendly blob with big eyes. Pure SVG primitives (no hand-drawn complexity). */
function Mascot({ size = 120, mood = "happy", bob = true, peek = false }) {
  const eyeY = 0.46, blink = mood === "wink";
  return (
    <span className={"blob-wrap" + (bob ? " bob" : "")} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="blobg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent-2)" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        {/* body — soft squashed round */}
        <path d="M50 8 C74 8 90 26 90 50 C90 76 73 92 50 92 C27 92 10 76 10 50 C10 26 26 8 50 8 Z"
              fill="url(#blobg)" />
        {/* cheek highlight */}
        <ellipse cx="35" cy="34" rx="13" ry="9" fill="#fff" opacity="0.22" />
        {/* eyes */}
        <g fill="#fff">
          <circle cx="38" cy={eyeY * 100 + 6} r="9.5" />
          <circle cx="62" cy={eyeY * 100 + 6} r="9.5" />
        </g>
        <g fill="#2B2520">
          {blink
            ? <><circle cx="38" cy="52" r="4.2" /><path d="M56 52 q6 4 12 0" stroke="#2B2520" strokeWidth="3.4" fill="none" strokeLinecap="round" /></>
            : <><circle cx="39.5" cy="53" r="4.4" /><circle cx="63.5" cy="53" r="4.4" /></>}
        </g>
        {!blink && <g fill="#fff"><circle cx="41" cy="51.4" r="1.5" /><circle cx="65" cy="51.4" r="1.5" /></g>}
        {/* blush */}
        <ellipse cx="28" cy="63" rx="6" ry="3.6" fill="#fff" opacity="0.28" />
        <ellipse cx="72" cy="63" rx="6" ry="3.6" fill="#fff" opacity="0.28" />
        {/* smile */}
        <path d="M42 66 q8 7 16 0" stroke="#2B2520" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        {/* little antenna bloop */}
        <circle cx="50" cy="6" r="3.2" fill="var(--accent-2)" />
        <line x1="50" y1="9" x2="50" y2="15" stroke="var(--accent-2)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/* ---------- LOGO: speech bubble + bloop ripple ---------- */
function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="logo-mark">
      <defs>
        <linearGradient id="logog" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-2)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <path d="M24 5C12.4 5 4 12.6 4 21.8c0 4.6 2.2 8.7 5.8 11.7-.3 2.6-1.3 5-3 7 .1.2.3.3.5.3 3.3-.3 6-1.6 8.2-3.3 2.7.9 5.6 1.3 8.5 1.3 11.6 0 20-7.6 20-16.8S35.6 5 24 5z"
            fill="url(#logog)" />
      {/* bloop ripple drop */}
      <circle cx="24" cy="20.5" r="4.4" fill="#fff" />
      <circle cx="24" cy="20.5" r="8.6" fill="none" stroke="#fff" strokeWidth="2" opacity="0.55" />
      <circle cx="24" cy="20.5" r="12.4" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.3" />
    </svg>
  );
}

Object.assign(window, {
  IcChat, IcUser, IcSettings, IcSun, IcMoon, IcSend, IcSmile, IcClip, IcNext,
  IcShuffle, IcFlag, IcClose, IcCheck, IcBell, IcChevR, IcChevL, IcSparkle,
  IcGlobe, IcPanel, IcImage, IcMars, IcVenus, Mascot, Logo,
});
