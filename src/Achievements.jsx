// The dog profile's "Achievements" section: badges for each training's first
// logged session, total session milestones, and streak milestones (see
// src/gamification.js for the unlock rules). Locked badges show greyed out
// with a progress counter underneath; unlocking just colors them in — no
// separate "unlocked!" moment here, that's what Celebrations.jsx is for.

function BadgeTile({ icon, title, subtitle, unlocked, accent, accentLight }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 84, textAlign: "center" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          background: unlocked ? accentLight : "#EDEEE6",
          border: unlocked ? `2px solid ${accent}` : "1px solid #DCDFD2",
          filter: unlocked ? "none" : "grayscale(1)",
          opacity: unlocked ? 1 : 0.5,
          marginBottom: 6,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 500, color: unlocked ? "#1E2B22" : "#8B8F7F", lineHeight: 1.25 }}>
        {title}
      </div>
      {subtitle && <div style={{ fontSize: 10.5, color: "#A9AA9C", marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}

function BadgeGrid({ badges, accent, accentLight }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 22 }}>
      {badges.map((b) => (
        <BadgeTile
          key={b.id}
          icon={b.icon}
          title={b.title}
          subtitle={b.progressLabel}
          unlocked={b.unlocked}
          accent={accent}
          accentLight={accentLight}
        />
      ))}
    </div>
  );
}

function AchievementsSection({ categories, entries, accent, accentLight }) {
  if (categories.length === 0) return null;
  const { trainingBadges, sessionBadges, streakBadges } = computeAchievements(categories, entries);

  return (
    <div style={{ marginTop: 28 }}>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 500, color: "#1E2B22", marginBottom: 14 }}>
        Achievements
      </h3>

      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#5B6459", marginBottom: 10 }}>First sessions</div>
      <BadgeGrid badges={trainingBadges} accent={accent} accentLight={accentLight} />

      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#5B6459", marginBottom: 10 }}>Session milestones</div>
      <BadgeGrid badges={sessionBadges} accent={accent} accentLight={accentLight} />

      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#5B6459", marginBottom: 10 }}>Streaks</div>
      <BadgeGrid badges={streakBadges} accent={accent} accentLight={accentLight} />
    </div>
  );
}
