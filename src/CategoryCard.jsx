// The collapsible card for one training (e.g. "Loose leash walking") on the
// Log tab: shows its logged sessions (collapsed to date + rating, expand to
// see the rest) and lets you log a new session or delete the training.
// Trend charts live on the Insights tab instead. Reordering is a long-press
// drag on the "⠿" handle, driven by the parent (App owns the category order).

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
  const [expandedEntryId, setExpandedEntryId] = useState(null);
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  const ratingField = category.fields.find((f) => f.type === "scale");
  const lastEntry = sorted[sorted.length - 1];
  const currentStreak = computeStreak(entries).current;

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
            <div style={{ fontSize: 13, color: "#5B6459", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span>{subtitle}</span>
              {currentStreak >= 3 && (
                <span style={{ color: "#B5652E", fontWeight: 500, whiteSpace: "nowrap" }}>🔥 {currentStreak}</span>
              )}
            </div>
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
                const isExpanded = expandedEntryId === e.id;
                const ratingValue = ratingField ? e.values[ratingField.id] : undefined;
                const otherFields = category.fields.filter((f) => f.id !== ratingField?.id);
                return (
                <div
                  key={e.id}
                  style={{ border: "1px solid #EAEAE0", borderRadius: 10, fontSize: 13, overflow: "hidden" }}
                >
                  <button
                    onClick={() => setExpandedEntryId(isExpanded ? null : e.id)}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? "Collapse entry" : "Expand entry"}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      font: "inherit",
                    }}
                  >
                    <div style={{ fontWeight: 500, color: "#1E2B22", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {fmtDateTime(e.date, e.time)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {ratingValue !== undefined && ratingValue !== "" && (
                        <span style={{ color: accent, fontWeight: 500, whiteSpace: "nowrap" }}>
                          {ratingField.label}: {ratingValue}
                        </span>
                      )}
                      <span style={{ color: "#5B6459", fontSize: 12 }}>{isExpanded ? "︿" : "﹀"}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: "0 12px 12px" }}>
                      {step && (
                        <div style={{ fontSize: 12, color: accent, marginBottom: 6, fontWeight: 500 }}>
                          {step.label} · {stepDone}/{step.tasks.length} tasks
                        </div>
                      )}
                      <div style={{ color: "#5B6459", display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {otherFields.map((f) => {
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

                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
                        <button
                          onClick={() => onEditEntry(e)}
                          style={{ border: "none", background: "transparent", color: accent, fontSize: 12, fontWeight: 500, cursor: "pointer", padding: 0 }}
                        >
                          Edit
                        </button>
                        {confirmingEntryId === e.id ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                            onClick={() => setConfirmingEntryId(e.id)}
                            aria-label="Delete entry"
                            style={{ border: "none", background: "transparent", color: "#B5432E", cursor: "pointer", padding: 0, fontSize: 13 }}
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </div>
                  )}
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
