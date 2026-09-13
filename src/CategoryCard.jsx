// The collapsible card for one training (e.g. "Loose leash walking") on the
// Log tab: shows its history, a mini chart per numeric field, and lets you
// log a new session or delete the training. Reordering is a long-press drag
// on the "⠿" handle, driven by the parent (App owns the category order).

function CategoryCard({
  category,
  entries,
  accent,
  accentLight,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onDeleteCategory,
  onUpdateIcon,
  dragHandleProps,
}) {
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingEntryId, setConfirmingEntryId] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  const numericFields = category.fields.filter((f) => f.type !== "text");
  const lastEntry = sorted[sorted.length - 1];

  const stepIndex = lastEntry?.stepId && category.steps ? category.steps.findIndex((s) => s.id === lastEntry.stepId) : -1;
  const stepProgress = category.steps && stepIndex >= 0 ? `Day ${stepIndex + 1} of ${category.steps.length}` : null;

  let subtitle;
  if (sorted.length === 0) {
    subtitle = category.steps ? `${category.steps.length}-day plan · not started` : "No entries yet";
  } else {
    subtitle = `${sorted.length} entr${sorted.length === 1 ? "y" : "ies"} · last ${fmtDate(lastEntry.date)}`;
    if (stepProgress) subtitle += ` · ${stepProgress}`;
  }

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E4E6DA", borderRadius: 14, marginBottom: 14, overflow: "hidden" }}>
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 10px 10px 12px" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <button
            onClick={() => setShowIconPicker(true)}
            aria-label="Change training icon"
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: 10,
              background: accentLight,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              cursor: "pointer",
              padding: 0,
            }}
          >
            {category.icon || "📋"}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", padding: "4px 0" }}
          >
            <div style={{ fontWeight: 500, fontSize: 16, color: "#1E2B22" }}>{category.name}</div>
            <div style={{ fontSize: 13, color: "#5B6459", marginTop: 2 }}>{subtitle}</div>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 0, marginLeft: 6 }}>
          <button
            {...dragHandleProps}
            aria-label="Drag to reorder"
            style={{
              border: "none",
              background: "transparent",
              padding: "6px 8px",
              cursor: "grab",
              color: "#5B6459",
              fontSize: 18,
              touchAction: "none",
              lineHeight: 1,
            }}
          >
            ⠿
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle details"
            style={{ border: "none", background: "transparent", padding: 6, cursor: "pointer", color: "#5B6459", fontSize: 16 }}
          >
            {open ? "︿" : "﹀"}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          {category.description && (
            <div style={{ fontSize: 12.5, color: "#8B8F7F", lineHeight: 1.5, marginBottom: 16 }}>{category.description}</div>
          )}
          {numericFields.map((f) => {
            const chartData = sorted
              .filter((e) => e.values[f.id] !== undefined && e.values[f.id] !== "")
              .map((e) => ({ date: fmtDate(e.date), value: Number(e.values[f.id]) }));
            if (chartData.length < 2) return null;
            return (
              <div key={f.id} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 13, color: "#5B6459", marginBottom: 6, fontWeight: 500 }}>
                  {f.label}
                  {f.unit ? ` (${f.unit})` : ""}
                </div>
                <MiniChart data={chartData} color={accent} />
              </div>
            );
          })}

          <button
            onClick={onAddEntry}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              width: "100%",
              padding: "10px",
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
            + Log a session
          </button>

          {sorted.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sorted.slice().reverse().map((e) => {
                const step = e.stepId && category.steps ? category.steps.find((s) => s.id === e.stepId) : null;
                const stepDone = step ? step.tasks.filter((t) => e.taskChecks && e.taskChecks[t.id]).length : 0;
                return (
                <div
                  key={e.id}
                  onClick={() => onEditEntry(e)}
                  role="button"
                  aria-label="Edit entry"
                  style={{ border: "1px solid #EAEAE0", borderRadius: 10, padding: "10px 12px", fontSize: 13, cursor: "pointer" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 500, color: "#1E2B22" }}>{fmtDateTime(e.date, e.time)}</div>
                      {step && (
                        <div style={{ fontSize: 12, color: accent, marginTop: 2, fontWeight: 500 }}>
                          {step.label} · {stepDone}/{step.tasks.length} tasks
                        </div>
                      )}
                    </div>
                    {confirmingEntryId === e.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={(ev) => ev.stopPropagation()}>
                        <button
                          onClick={() => {
                            setConfirmingEntryId(null);
                            onDeleteEntry(e.id);
                          }}
                          style={{ border: "none", background: "#B5432E", color: "#FFFFFF", fontSize: 11, fontWeight: 500, borderRadius: 6, padding: "4px 8px", cursor: "pointer", whiteSpace: "nowrap" }}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmingEntryId(null)}
                          style={{ border: "none", background: "transparent", color: "#5B6459", fontSize: 11, cursor: "pointer", padding: "4px 2px" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setConfirmingEntryId(e.id);
                        }}
                        aria-label="Delete entry"
                        style={{ border: "none", background: "transparent", color: "#B5432E", cursor: "pointer", padding: 0, fontSize: 13 }}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                  <div style={{ color: "#5B6459", marginTop: 4, display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {category.fields.map((f) => {
                      const v = e.values[f.id];
                      if (v === undefined || v === "") return null;
                      return (
                        <span key={f.id}>
                          {f.label}:{" "}
                          <strong style={{ color: "#1E2B22", fontWeight: 500 }}>
                            {v}
                            {f.unit ? ` ${f.unit}` : ""}
                          </strong>
                        </span>
                      );
                    })}
                  </div>
                  {e.notes && <div style={{ color: "#5B6459", marginTop: 6, fontStyle: "italic" }}>{e.notes}</div>}
                </div>
                );
              })}
            </div>
          )}

          {confirmingDelete ? (
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#5B6459" }}>Delete this training and all its entries?</span>
              <button
                onClick={() => {
                  setConfirmingDelete(false);
                  onDeleteCategory();
                }}
                style={{ border: "none", background: "#B5432E", color: "#FFFFFF", fontSize: 12, fontWeight: 500, borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                style={{ border: "none", background: "transparent", color: "#5B6459", fontSize: 12, cursor: "pointer", padding: 0 }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              style={{ marginTop: 14, border: "none", background: "transparent", color: "#A9AA9C", fontSize: 12, cursor: "pointer", padding: 0 }}
            >
              Delete this training
            </button>
          )}
        </div>
      )}

      {showIconPicker && (
        <IconPickerModal
          title="Change icon"
          current={category.icon}
          onClose={() => setShowIconPicker(false)}
          onSelect={(icon) => {
            onUpdateIcon(icon);
            setShowIconPicker(false);
          }}
        />
      )}
    </div>
  );
}
