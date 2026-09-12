// The "Insights" tab: scope/date-range filters, session counts, trend
// charts per field, and the notes-insights panel (AI analysis or manual
// copy-paste).

function AnalysisView({ dog, categories, entries, accent, accentLight, aiConfig, onOpenAISettings }) {
  const [scope, setScope] = useState("all");
  const [range, setRange] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState("");

  const scopedCategories = scope === "all" ? categories : categories.filter((c) => c.id === scope);
  const scopedCategoryIds = new Set(scopedCategories.map((c) => c.id));
  const scopedEntries = entries.filter((e) => scopedCategoryIds.has(e.categoryId));
  const rangedEntries = scopedEntries.filter((e) => inDateRange(e.date, range, customStart, customEnd));
  const dates = rangedEntries.map((e) => e.date).sort();
  const firstDate = dates[0], lastDate = dates[dates.length - 1];

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
    const notesEntries = rangedEntries.filter((e) => e.notes && e.notes.trim());
    if (notesEntries.length === 0) return null;
    const catName = (id) => categories.find((c) => c.id === id)?.name || "";
    const sorted = [...notesEntries].sort((a, b) => (a.date < b.date ? -1 : 1));
    const scopeLabel = scope === "all" ? "across all training types" : `for "${scopedCategories[0]?.name}" sessions`;
    const transcript = sorted.map((e) => `${e.date} — ${catName(e.categoryId)}: ${e.notes}`).join("\n");
    return {
      notesEntries,
      text: `Here are my dated training journal notes for my dog ${dog.name}, ${scopeLabel}. Please identify recurring triggers or patterns, signs of progress over time, and anything worth watching or adjusting:\n\n${transcript}`,
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
      const prompt = `${built.text}\n\nIn plain, concise language (short paragraphs or a short bullet list, no headers, no markdown bold), identify: 1) recurring triggers or patterns, 2) signs of progress over time, 3) anything worth watching or adjusting. Base this only on what's in the notes. Keep it under 180 words.`;
      const text = await callAIProvider(aiConfig, prompt);
      setAiResult(text || "No insights could be generated from these notes.");
    } catch (e) {
      console.error("AI analysis failed:", e);
      setAiError(e.message || "Couldn't reach the AI provider. Check your API key and try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const notesEntries = rangedEntries.filter((e) => e.notes && e.notes.trim());
  const rangeOptions = [
    { key: "all", label: "All time" },
    { key: "week", label: "Last week" },
    { key: "month", label: "Last month" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <div>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18, marginTop: 4 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E4E6DA", borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 12, color: "#5B6459" }}>Sessions logged</div>
          <div style={{ fontSize: 22, fontWeight: 500, color: "#1E2B22" }}>{rangedEntries.length}</div>
        </div>
        <div style={{ background: "#FFFFFF", border: "1px solid #E4E6DA", borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 12, color: "#5B6459" }}>Covers</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#1E2B22", marginTop: 3 }}>
            {firstDate ? `${fmtDate(firstDate)} – ${fmtDate(lastDate)}` : "No entries in range"}
          </div>
        </div>
      </div>

      {staleCats.length > 0 && (
        <div style={{ background: accentLight, borderRadius: 12, padding: "12px 14px", marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: accent, marginBottom: 4 }}>Could use attention</div>
          <div style={{ fontSize: 13, color: "#1E2B22" }}>
            {staleCats
              .map((c) => {
                const catEntries = entries.filter((e) => e.categoryId === c.id);
                if (catEntries.length === 0) return `${c.name} (never logged)`;
                const last = catEntries.map((e) => e.date).sort().slice(-1)[0];
                return `${c.name} (${daysSince(last)}d ago)`;
              })
              .join(" · ")}
          </div>
        </div>
      )}

      <div style={{ fontSize: 15, fontWeight: 500, color: "#1E2B22", marginBottom: 10 }}>Trends</div>
      <div style={{ marginBottom: 20 }}>
        {scopedCategories.map((cat) => {
          const rows = cat.fields
            .filter((f) => f.type !== "text")
            .map((f) => ({ field: f, t: fieldTrend(rangedEntries, cat.id, f.id) }));
          const withTrend = rows.filter((r) => r.t);
          if (withTrend.length === 0) return null;
          return (
            <div key={cat.id} style={{ marginBottom: 18 }}>
              {scope === "all" && (
                <div style={{ fontSize: 13, fontWeight: 500, color: "#5B6459", marginBottom: 6 }}>{cat.name}</div>
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

      <div style={{ fontSize: 15, fontWeight: 500, color: "#1E2B22", marginBottom: 10 }}>Notes insights</div>

      {aiConfig?.apiKey ? (
        <React.Fragment>
          <button
            onClick={runAIAnalysis}
            disabled={aiLoading || notesEntries.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              width: "100%",
              padding: "11px",
              borderRadius: 10,
              border: "none",
              background: notesEntries.length === 0 ? "#EAEAE0" : accentLight,
              color: notesEntries.length === 0 ? "#A9AA9C" : accent,
              fontWeight: 500,
              fontSize: 14,
              cursor: notesEntries.length === 0 || aiLoading ? "default" : "pointer",
              marginBottom: 8,
            }}
          >
            {aiLoading && <span className="spin">⟳</span>}
            {aiLoading ? "Reading your notes…" : notesEntries.length === 0 ? "No notes in this range" : "✨ Analyze notes with AI"}
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

          <button
            onClick={onOpenAISettings}
            style={{ border: "none", background: "transparent", color: "#8B8F7F", fontSize: 12, textDecoration: "underline", cursor: "pointer", padding: 0, marginBottom: 14 }}
          >
            AI settings ({PROVIDER_LABELS[aiConfig.provider]})
          </button>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <p style={{ fontSize: 13, color: "#5B6459", marginBottom: 10 }}>
            Connect your own Claude, Gemini, or ChatGPT key to get patterns, triggers, and progress signals pulled
            from your notes automatically.
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
            ✨ Set up AI analysis
          </button>
        </React.Fragment>
      )}

      <p style={{ fontSize: 12, color: "#8B8F7F", marginBottom: 6 }}>Or just copy the notes and paste them anywhere yourself:</p>
      <button
        onClick={copyNotes}
        disabled={notesEntries.length === 0}
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
          color: notesEntries.length === 0 ? "#A9AA9C" : "#5B6459",
          fontWeight: 500,
          fontSize: 13,
          cursor: notesEntries.length === 0 ? "default" : "pointer",
        }}
      >
        {copied ? "Copied ✓" : notesEntries.length === 0 ? "No notes in this range" : `Copy ${notesEntries.length} note${notesEntries.length === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}
