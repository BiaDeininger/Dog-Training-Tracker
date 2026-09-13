// Small, reusable UI pieces shared by the bigger screens/modals.

const { useState, useRef } = React;

function ScalePicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: value === n ? "2px solid #1E2B22" : "1px solid #D7DACB",
            background: value === n ? scaleColors[n - 1] : "#FFFFFF",
            color: value === n ? "#17240F" : "#5B6459",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,26,18,0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          borderRadius: "16px 16px 0 0",
          width: "100%",
          maxWidth: 480,
          maxHeight: "88vh",
          overflowY: "auto",
          padding: "20px 20px 28px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 500, margin: 0, color: "#1E2B22" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4, color: "#5B6459", fontSize: 20 }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const TRAINING_ICON_CHOICES = [
  "📋", "🐾", "🦮", "🐕", "🐩", "🗺️", "🧘", "🏠",
  "🚪", "🔔", "🛑", "🎯", "🍖", "🧠", "⏱️", "🎾",
  "🧸", "🚗", "👥", "🌳",
];

function IconPickerModal({ title, current, onClose, onSelect }) {
  const [custom, setCustom] = useState("");
  return (
    <Modal title={title || "Choose an icon"} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 18 }}>
        {TRAINING_ICON_CHOICES.map((icon) => (
          <button
            key={icon}
            onClick={() => onSelect(icon)}
            aria-label={`Use ${icon} icon`}
            style={{
              aspectRatio: "1",
              fontSize: 22,
              borderRadius: 12,
              border: current === icon ? "2px solid #1E2B22" : "1px solid #E4E6DA",
              background: "#FBFAF6",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            {icon}
          </button>
        ))}
      </div>

      <label style={labelStyle}>Or use your own emoji</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          placeholder="🐩"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button
          onClick={() => custom.trim() && onSelect(custom.trim())}
          disabled={!custom.trim()}
          style={{
            border: "none",
            borderRadius: 8,
            padding: "0 16px",
            background: custom.trim() ? "#1E2B22" : "#EAEAE0",
            color: custom.trim() ? "#FFFFFF" : "#A9AA9C",
            fontWeight: 500,
            cursor: custom.trim() ? "pointer" : "default",
          }}
        >
          Use
        </button>
      </div>
    </Modal>
  );
}

function MiniChart({ data, color }) {
  if (data.length < 2) return null;
  const width = 320, height = 110, padX = 6, padY = 14;
  const values = data.map((d) => d.value);
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (width - padX * 2) / (data.length - 1);
  const pts = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = height - padY - ((d.value - min) / range) * (height - padY * 2);
    return { x, y, label: d.date, value: d.value };
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: 110 }}>
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
      <text x={pts[0].x} y={height - 2} fontSize="10" fill="#8B8F7F">
        {pts[0].label}
      </text>
      <text x={pts[pts.length - 1].x} y={height - 2} fontSize="10" fill="#8B8F7F" textAnchor="end">
        {pts[pts.length - 1].label}
      </text>
    </svg>
  );
}

function TrendArrow({ delta }) {
  if (Math.abs(delta) < 0.05) return <span style={{ color: "#8B8F7F" }}>→</span>;
  return <span style={{ color: "#5B6459" }}>{delta > 0 ? "↑" : "↓"}</span>;
}
