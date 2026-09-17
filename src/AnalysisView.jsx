// The "Insights" tab: scope/date-range filters, session counts, trend
// charts per field, and the notes-insights panel (AI analysis or manual
// copy-paste).

function AnalysisView({ dog, categories, entries, accent, accentLight, aiConfig, onOpenAISettings, onLogCategory }) {
  const [scope, setScope] = useState("all");
  const [range, setRange] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState("");

  const streak = computeStreak(entries);

  const scopedCategories = scope === "all" ? categories : categories.filter((c) => c.id === scope);
  const scopedCategoryIds = new Set(scopedCategories.map((c) => c.id));
  const scopedEntries = entries.filter((e) => scopedCategoryIds.has(e.categoryId));
  const rangedEntries = scopedEntries.filter((e) => inDateRange(e.date, range, customStart, customEnd));
  const dates = rangedEntries.map((e) => e.date).sort();
  const firstDate = dates[0], lastDate = dates[dates.length - 1];

  const hasLoggedDetail = (e) =>
    (e.notes && e.notes.trim()) || Object.values(e.values || {}).some((v) => v !== undefined && v !== "");
  const loggedEntries = rangedEntries.filter(hasLoggedDetail);

  const staleCats =
    scope === "all"
      ? categories.filter((c) => {
          const catEntries = entries.filter((e) => e.categoryId === c.id);
          if (catEntries.length === 0) return true;
          const last = catEntries.map((e) => e.date).sort().slice(-1)[0];
          return daysSince(last) > 10;
        })
      : [];

  const buildNotesPrompt = () => {
    if (loggedEntries.length === 0) return null;
    const catName = (id) => categories.find((c) => c.id === id)?.name || "";
    const catFields = (id) => categories.find((c) => c.id === id)?.fields || [];
    const describeEntry = (e) => {
      const details = catFields(e.categoryId)
        .map((f) => {
          const v = e.values?.[f.id];
          if (v === undefined || v === "") return null;
          const shown = f.type === "scale" ? `${v}/5` : f.unit ? `${v} ${f.unit}` : v;
          return `${f.label}: ${shown}`;
        })
        .filter(Boolean)
        .join(", ");
      let line = `${e.date} — ${catName(e.categoryId)}`;
      if (details) line += ` (${details})`;
      if (e.notes && e.notes.trim()) line += `: ${e.notes.trim()}`;
      return line;
    };
    const sorted = [...loggedEntries].sort((a, b) => (a.date < b.date ? -1 : 1));
    const scopeLabel = scope === "all" ? "across all training types" : `for "${scopedCategories[0]?.name}" sessions`;
    const transcript = sorted.map(describeEntry).join("\n");
    return {
      text: `Here is my dated training journal for my dog ${dog.name}, ${scopeLabel}. Each line lists the training type, any logged details (like duration, place, and rating), and free-text notes when I added them. Please identify recurring triggers or patterns — including how the place or environment affects performance — signs of progress over time, and anything worth watching or adjusting:\n\n${transcript}`,
    };
  };

  const copyNotes = async () => {
    const built = buildNotesPrompt();
    if (!built) return;
    try {
      await navigator.clipboard.writeText(built.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      alert("Couldn't copy automatically — please select and copy the notes manually.");
    }
  };

  const runAIAnalysis = async () => {
    const built = buildNotesPrompt();
    if (!built || !aiConfig?.apiKey) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);
    try {
      const prompt = `${built.text}\n\nIn plain, concise language (short paragraphs or a short bullet list, no headers, no markdown bold), identify: 1) recurring triggers or patterns — including how the place or environment affects the dog, 2) signs of progress over time, 3) anything worth watching or adjusting. Base this only on what's in the log below. Keep it under 180 words.`;
      const text = await callAIProvider(aiConfig, prompt);
      setAiResult(text || "No insights could be generated from this log.");
    } catch (e) {
      console.error("AI analysis failed:", e);
      setAiError(e.message || "Couldn't reach the AI provider. Check your API key and try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const rangeOptions = [
    { key: "all", label: "All time" },
    { key: "week", label: "Last week" },
    { key: "month", label: "Last month" },
    { key: "custom", label: "Custom" },
  ];

  const streakTitle =
    streak.current > 0 ? `${streak.current}-day streak` : streak.longest > 0 ? "Streak broken" : "No streak yet";
  const streakSubtitle =
    streak.current > 0
      ? (streak.loggedToday ? "Logged today — keep it going tomorrow" : "Log today to keep it going") +
        (streak.longest > streak.current ? ` · best ${streak.longest}` : "")
      : streak.longest > 0
      ? `Log today to start a new one — best was ${streak.longest} days`
      : "Log a session today to start one";

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: streak.current > 0 ? accentLight : "#FFFFFF",
          border: streak.current > 0 ? "none" : "1px solid #E4E6DA",
          borderRadius: 14,
          padding: "14px 16px",
          marginBottom: 18,
        }}
      >
        {streak.current > 0 ? (
          <span style={{ fontSize: 26, lineHeight: 1 }}>🔥</span>
        ) : streak.longest > 0 ? (
          // Grayed out rather than gone entirely — signals "you had one, it lapsed" instead of "never started".
          <span style={{ fontSize: 26, lineHeight: 1, filter: "grayscale(1)", opacity: 0.4 }}>🔥</span>
        ) : null}
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: streak.current > 0 ? accent : "#1E2B22" }}>{streakTitle}</div>
          <div style={{ fontSize: 12.5, color: "#5B6459", marginTop: 2 }}>{streakSubtitle}</div>
        </div>
      </div>

      <label style={{ ...labelStyle, marginBottom: 8 }}>Scope</label>
      <select
        style={{ ...inputStyle, marginBottom: 14 }}
        value={scope}
        onChange={(e) => {
          setScope(e.target.value);
          setCopied(false);
        }}
      >
        <option value="all">All trainings — overall</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <label style={{ ...labelStyle, marginBottom: 8 }}>Date range</label>
      <div style={{ display: "flex", gap: 4, marginBottom: 10, background: "#E4E6DA", borderRadius: 10, padding: 3 }}>
        {rangeOptions.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            style={{
              flex: 1,
              padding: "7px 0",
              borderRadius: 8,
              border: "none",
              background: range === r.key ? "#FFFFFF" : "transparent",
              color: range === r.key ? "#1E2B22" : "#5B6459",
              fontWeight: 500,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {range === "custom" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input
            type="date"
            style={{ ...inputStyle, flex: 1 }}
            value={customStart}
            max={customEnd || todayStr()}
            onChange={(e) => setCustomStart(e.target.value)}
          />
          <input
            type="date"
            style={{ ...inputStyle, flex: 1 }}
            value={customEnd}
            min={customStart}
            max={todayStr()}
            onChange={(e) => setCustomEnd(e.target.value)}
          />
        </div>
      )}

      <div style={{ display: "flex", background: "#FFFFFF", border: "1px solid #E4E6DA", borderRadius: 12, padding: "14px 8px", marginBottom: 18, marginTop: 4 }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#1E2B22" }}>{rangedEntries.length}</div>
          <div style={{ fontSize: 11, color: "#8B8F7F", marginTop: 2 }}>Sessions</div>
        </div>
        <div style={{ width: 1, background: "#E4E6DA" }} />
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#1E2B22" }}>{scopedCategories.length}</div>
          <div style={{ fontSize: 11, color: "#8B8F7F", marginTop: 2 }}>Training{scopedCategories.length === 1 ? "" : "s"}</div>
        </div>
        <div style={{ width: 1, background: "#E4E6DA" }} />
        <div style={{ flex: 1, textAlign: "center", padding: "0 4px" }}>
          <div style={{ fontSize: firstDate ? 13 : 12, fontWeight: 600, color: firstDate ? "#1E2B22" : "#8B8F7F", marginTop: firstDate ? 3 : 0 }}>
            {firstDate ? `${fmtDate(firstDate)} – ${fmtDate(lastDate)}` : "No entries"}
          </div>
          <div style={{ fontSize: 11, color: "#8B8F7F", marginTop: 2 }}>Range</div>
        </div>
      </div>

      {staleCats.length > 0 && (
        <div style={{ background: "#FFFFFF", border: "1px solid #F3E3D5", borderLeft: "3px solid #B5652E", borderRadius: 12, padding: "12px 14px", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#B5652E", marginBottom: 6 }}>
            <span>⏳</span>
            <span>Needs attention</span>
          </div>
          {staleCats.map((c) => {
            const catEntries = entries.filter((e) => e.categoryId === c.id);
            const last = catEntries.map((e) => e.date).sort().slice(-1)[0];
            const label = last ? `${daysSince(last)}d ago` : "never logged";
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                <span style={{ color: "#1E2B22" }}>
                  {c.name} <span style={{ color: "#8B8F7F" }}>· {label}</span>
                </span>
                <button
                  onClick={() => onLogCategory && onLogCategory(c)}
                  style={{ border: "none", background: "transparent", color: "#B5652E", fontWeight: 500, fontSize: 13, cursor: "pointer", padding: 0 }}
                >
                  Log now
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 500, color: "#1E2B22", marginBottom: 10 }}>Trends</div>
      <div style={{ marginBottom: 20 }}>
        {scopedCategories.map((cat) => {
          const rows = cat.fields
            .filter((f) => f.type !== "text")
            .map((f) => ({ field: f, t: fieldTrend(rangedEntries, cat.id, f.id) }));
          const withTrend = rows.filter((r) => r.t);
          if (withTrend.length === 0) return null;
          return (
            <div key={cat.id} style={{ background: "#FFFFFF", border: "1px solid #E4E6DA", borderRadius: 14, padding: 14, marginBottom: 14 }}>
              {scope === "all" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 15, background: accentLight, width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {cat.icon || "📋"}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#1E2B22" }}>{cat.name}</span>
                </div>
              )}
              {withTrend.map(({ field, t }) => {
                const chartData = rangedEntries
                  .filter((e) => e.categoryId === cat.id && e.values[field.id] !== undefined && e.values[field.id] !== "")
                  .sort((a, b) => (a.date < b.date ? -1 : 1))
                  .map((e) => ({ date: fmtDate(e.date), value: Number(e.values[field.id]) }));
                return (
                  <div key={field.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", fontSize: 13 }}>
                      <span style={{ color: "#1E2B22" }}>{field.label}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#5B6459" }}>
                        {t.a1.toFixed(1)} → {t.a2.toFixed(1)}
                        {field.unit ? ` ${field.unit}` : ""} <TrendArrow delta={t.delta} />
                      </span>
                    </div>
                    <MiniChart data={chartData} color={accent} />
                  </div>
                );
              })}
            </div>
          );
        })}
        {scopedCategories.every((cat) => cat.fields.filter((f) => f.type !== "text").every((f) => !fieldTrend(rangedEntries, cat.id, f.id))) && (
          <p style={{ fontSize: 13, color: "#5B6459" }}>
            Not enough sessions in this range yet — log at least two per training, or widen the date range.
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: "#1E2B22" }}>Notes insights</div>
        {aiConfig?.apiKey && (
          <button
            onClick={onOpenAISettings}
            title="Manage Gemini key"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "none",
              background: "#EAF3EC",
              color: "#22643B",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 20,
              padding: "4px 10px",
              cursor: "pointer",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3F8F5F", display: "inline-block" }} />
            Gemini connected
          </button>
        )}
      </div>

      {aiConfig?.apiKey ? (
        <React.Fragment>
          <button
            onClick={runAIAnalysis}
            disabled={aiLoading || loggedEntries.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              width: "100%",
              padding: "11px",
              borderRadius: 10,
              border: "none",
              background: loggedEntries.length === 0 ? "#EAEAE0" : accentLight,
              color: loggedEntries.length === 0 ? "#A9AA9C" : accent,
              fontWeight: 500,
              fontSize: 14,
              cursor: loggedEntries.length === 0 || aiLoading ? "default" : "pointer",
              marginBottom: 8,
            }}
          >
            {aiLoading && <span className="spin">⟳</span>}
            {aiLoading ? "Reading your training log…" : loggedEntries.length === 0 ? "No sessions in this range" : "Analyze with AI"}
          </button>

          {aiError && <p style={{ fontSize: 13, color: "#B5432E", marginBottom: 8 }}>{aiError}</p>}

          {aiResult && (
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E4E6DA",
                borderRadius: 12,
                padding: "14px 16px",
                fontSize: 14,
                lineHeight: 1.6,
                color: "#1E2B22",
                whiteSpace: "pre-wrap",
                marginBottom: 10,
              }}
            >
              {aiResult}
            </div>
          )}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <p style={{ fontSize: 13, color: "#5B6459", marginBottom: 6 }}>
            Connect a free Google Gemini key and it'll read your logged sessions — durations, places, ratings, and
            notes — and pull out patterns, triggers, and signs of progress on its own.
          </p>
          <p style={{ fontSize: 12, color: "#8B8F7F", marginBottom: 10 }}>
            No credit card needed, about a minute to set up.
          </p>
          <button
            onClick={onOpenAISettings}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              width: "100%",
              padding: "11px",
              borderRadius: 10,
              border: "none",
              background: accentLight,
              color: accent,
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
              marginBottom: 14,
            }}
          >
            Set up free AI analysis
          </button>
        </React.Fragment>
      )}

      <p style={{ fontSize: 12, color: "#8B8F7F", marginBottom: 6 }}>Or just copy the training log and paste it anywhere yourself:</p>
      <button
        onClick={copyNotes}
        disabled={loggedEntries.length === 0}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          width: "100%",
          padding: "10px",
          borderRadius: 10,
          border: "1px solid #D7DACB",
          background: "transparent",
          color: loggedEntries.length === 0 ? "#A9AA9C" : "#5B6459",
          fontWeight: 500,
          fontSize: 13,
          cursor: loggedEntries.length === 0 ? "default" : "pointer",
        }}
      >
        {copied ? "Copied ✓" : loggedEntries.length === 0 ? "No sessions in this range" : `Copy ${loggedEntries.length} session${loggedEntries.length === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}
