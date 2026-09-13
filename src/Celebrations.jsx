// Transient celebratory overlays: a confetti burst for a personal best, a
// unicorn fly-by for a perfect (5/5) scale rating. Both are purely
// decorative and self-contained — App just renders <Celebration> for a few
// seconds (see the timer around setCelebration in App.jsx) and this file
// doesn't track any state of its own beyond the one-time confetti layout.

const CONFETTI_COLORS = ["#4C6B4F", "#B5652E", "#3E6690", "#8B5A9E", "#E8B23D"];

function ConfettiBurst() {
  const [pieces] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: 1.6 + Math.random() * 1,
      drift: (Math.random() - 0.5) * 80,
      rotate: 180 + Math.random() * 540,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    }))
  );
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, overflow: "hidden", pointerEvents: "none" }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            position: "absolute",
            top: -16,
            left: `${p.left}%`,
            width: 7,
            height: 12,
            borderRadius: 2,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--confetti-drift": `${p.drift}px`,
            "--confetti-rotate": `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}

// A cute, static chibi-style unicorn (rainbow mane/tail, blush, thick
// cartoon outline) that just glides across the screen — no internal
// animation of its own, only the outer element's flight path (see
// .unicorn-flyby in style.css). Facing right, the direction it travels.
function UnicornFly() {
  const OUTLINE = "#1E2B22";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, overflow: "hidden", pointerEvents: "none" }}>
      <div className="unicorn-flyby">
        <svg className="unicorn-svg" viewBox="-20 -20 240 240" xmlns="http://www.w3.org/2000/svg">
          {/* tail: rainbow strands fanning from the rear of the body */}
          <path d="M56.0,118.0 Q40.0,97.2 17.9,96.0 Q30.0,114.6 56.0,118.0 Z" fill="#5FA9DE" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M56.0,118.0 Q27.2,101.1 -0.5,105.0 Q22.7,120.6 56.0,118.0 Z" fill="#7DC77E" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M56.0,118.0 Q19.0,111.2 -9.7,123.8 Q20.7,131.1 56.0,118.0 Z" fill="#F3D551" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M56.0,118.0 Q20.6,121.5 -1.5,141.2 Q28.1,140.0 56.0,118.0 Z" fill="#F5A94D" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M56.0,118.0 Q28.5,128.0 17.7,150.1 Q41.4,143.3 56.0,118.0 Z" fill="#F6879C" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />

          {/* body */}
          <path
            d="M65,115 C60,145 72,172 100,176 C128,172 142,148 140,120 C138,98 122,84 100,84 C80,84 68,96 65,115 Z"
            fill="#FFFFFF"
            stroke={OUTLINE}
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* grounded front leg — drawn as a thick outlined stroke (outline
              stroke first, narrower white stroke on top) rather than a box,
              so it reads as a rounded limb rather than a stiff rectangle */}
          <path d="M98,148 L98,190" fill="none" stroke={OUTLINE} strokeWidth="17" strokeLinecap="round" />
          <path d="M98,148 L98,190" fill="none" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
          <circle cx="98" cy="190" r="7" fill="#F6AFC0" stroke={OUTLINE} strokeWidth="3" />

          {/* raised, bent front leg tucked up near the chin — the cute "prancing" touch */}
          <path d="M106,145 Q118,138 124,120" fill="none" stroke={OUTLINE} strokeWidth="17" strokeLinecap="round" />
          <path d="M106,145 Q118,138 124,120" fill="none" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
          <circle cx="124" cy="120" r="7" fill="#F6AFC0" stroke={OUTLINE} strokeWidth="3" />

          {/* mane: rainbow strands, drawn before the head so their base tucks underneath it */}
          <path d="M118.0,40.0 Q128.2,17.6 116.6,0.0 Q106.2,18.4 118.0,40.0 Z" fill="#5FA9DE" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M118.0,40.0 Q118.2,8.3 99.5,-10.7 Q97.5,15.9 118.0,40.0 Z" fill="#7DC77E" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M118.0,40.0 Q105.7,6.4 79.8,-8.9 Q88.3,19.9 118.0,40.0 Z" fill="#F3D551" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M118.0,40.0 Q98.2,12.7 70.5,6.7 Q85.6,30.7 118.0,40.0 Z" fill="#F5A94D" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M118.0,40.0 Q98.0,21.0 74.8,24.3 Q90.5,41.7 118.0,40.0 Z" fill="#F6879C" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />

          {/* head, with ear/horn/snout/face on top of it */}
          <circle cx="138" cy="62" r="40" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="5" />
          <path d="M126,25 C122,10 138,6 136,22 C132,28 128,30 126,25 Z" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M148,26 L156,4 L160,26 Z" fill="#FCE38A" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="172" cy="80" rx="15" ry="12" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="4" />
          <circle cx="166" cy="76" r="7" fill="#F6AFC0" opacity="0.85" />
          <circle cx="152" cy="62" r="7" fill={OUTLINE} />
          <circle cx="155" cy="59" r="2" fill="#FFFFFF" />
          <circle cx="182" cy="82" r="1.8" fill={OUTLINE} />
        </svg>
      </div>
    </div>
  );
}

function Celebration({ celebration }) {
  if (!celebration) return null;
  const isPerfect = celebration.type === "perfect-score";
  return (
    <React.Fragment>
      {isPerfect ? <UnicornFly /> : <ConfettiBurst />}
      <div
        style={{
          position: "fixed",
          top: "max(18px, env(safe-area-inset-top))",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1E2B22",
          color: "#FFFFFF",
          padding: "10px 18px",
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 500,
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          zIndex: 72,
          display: "flex",
          alignItems: "center",
          gap: 8,
          pointerEvents: "none",
          maxWidth: "calc(100% - 32px)",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 16 }}>{isPerfect ? "🦄" : "🎉"}</span>
        {celebration.message}
      </div>
    </React.Fragment>
  );
}
