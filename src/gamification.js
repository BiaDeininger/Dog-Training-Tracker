// Gamification: celebratory triggers (personal bests, perfect scores) and
// achievement badge definitions. Pure logic — no React, no DOM — so it can
// be unit-reasoned-about independently of how App.jsx and Achievements.jsx
// render it.

// Only "number" fields are checked for personal bests. "scale" fields (1-5)
// get their own perfect-score check below instead, since hitting the top of
// a 1-5 scale isn't a "record" to keep beating the way a growing number is.
// Checks personal bests before perfect scores; only one celebration fires
// per entry so they never stack.
function detectCelebration(category, priorEntries, savedEntry) {
  const numberFields = category.fields.filter((f) => f.type === "number");
  for (const f of numberFields) {
    const raw = savedEntry.values[f.id];
    if (raw === undefined || raw === "") continue;
    const val = Number(raw);
    if (Number.isNaN(val)) continue;

    const priorValues = priorEntries
      .map((e) => e.values[f.id])
      .filter((v) => v !== undefined && v !== "")
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    if (priorValues.length === 0) continue; // no baseline yet, nothing to beat

    if (val > Math.max(...priorValues)) {
      return {
        type: "personal-best",
        message: `New record: ${val}${f.unit ? ` ${f.unit}` : ""} ${f.label}!`,
      };
    }
  }

  const scaleFields = category.fields.filter((f) => f.type === "scale");
  for (const f of scaleFields) {
    if (Number(savedEntry.values[f.id]) === 5) {
      return { type: "perfect-score", message: `Perfect ${f.label.toLowerCase()}!` };
    }
  }

  return null;
}

const SESSION_MILESTONES = [10, 25, 50, 100];
const STREAK_MILESTONES = [7, 14, 30];

// `categories`/`entries` are expected pre-filtered to one dog.
function computeAchievements(categories, entries) {
  const trainingBadges = categories.map((cat) => {
    const unlocked = entries.some((e) => e.categoryId === cat.id);
    return {
      id: `first-${cat.id}`,
      icon: cat.icon || "📋",
      title: cat.name,
      unlocked,
      progressLabel: unlocked ? "First session logged" : "Not started",
    };
  });

  const totalSessions = entries.length;
  const sessionBadges = SESSION_MILESTONES.map((tier) => ({
    id: `sessions-${tier}`,
    icon: "🎯",
    title: `${tier} sessions`,
    unlocked: totalSessions >= tier,
    progressLabel: totalSessions >= tier ? "Unlocked" : `${totalSessions}/${tier}`,
  }));

  const { longest } = computeStreak(entries);
  const streakBadges = STREAK_MILESTONES.map((tier) => ({
    id: `streak-${tier}`,
    icon: "🔥",
    title: `${tier}-day streak`,
    unlocked: longest >= tier,
    progressLabel: longest >= tier ? "Unlocked" : `${longest}/${tier} days`,
  }));

  return { trainingBadges, sessionBadges, streakBadges };
}
