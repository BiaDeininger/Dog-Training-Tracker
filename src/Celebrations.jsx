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

function UnicornFly() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, overflow: "hidden", pointerEvents: "none" }}>
      <span className="unicorn-flyby">🦄</span>
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
