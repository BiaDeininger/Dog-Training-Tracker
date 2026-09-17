// Lets you belatedly change an existing training: rename it, edit its
// description, and add/remove the things it tracks — e.g. dropping a field
// that turned out not to matter, or adding one you only thought to track
// later. Removing a field that already has logged sessions doesn't delete
// that data; it's archived (kept on past entries, hidden from new ones,
// restorable) rather than wiped, since this app has no undo.

function EditCategoryModal({ category, entries, onClose, onSave }) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || "");
  const [icon, setIcon] = useState(category.icon || "📋");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [fields, setFields] = useState(category.fields.map((f) => ({ ...f })));
  const [error, setError] = useState("");

  const loggedCountFor = (fieldId) =>
    entries.filter((e) => e.values && e.values[fieldId] !== undefined && e.values[fieldId] !== "").length;

  const updateField = (id, patch) => setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const addField = () => setFields((fs) => [...fs, { id: uid(), label: "", type: "number", unit: "" }]);

  // A field nobody has logged yet can just be removed outright. One that has
  // history is archived instead, so past sessions keep showing it.
  const removeField = (id) =>
    loggedCountFor(id) > 0 ? updateField(id, { archived: true }) : setFields((fs) => fs.filter((f) => f.id !== id));
  const restoreField = (id) => updateField(id, { archived: false });

  const activeFields = fields.filter((f) => !f.archived);
  const archivedFields = fields.filter((f) => f.archived);

  const save = () => {
    if (!name.trim()) {
      setError("Give the training a name first.");
      return;
    }
    const cleanActive = activeFields.filter((f) => f.label.trim());
    if (cleanActive.length === 0) {
      setError("Keep at least one thing you're tracking.");
      return;
    }
    onSave({
      name: name.trim(),
      icon,
      description: description.trim(),
      fields: [...cleanActive, ...archivedFields],
    });
  };

  return (
    <Modal title={`Update ${category.name}`} onClose={onClose}>
      <label style={labelStyle}>Icon</label>
      <button
        onClick={() => setShowIconPicker(true)}
        type="button"
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          border: "1px solid #D7DACB",
          background: "#FBFAF6",
          fontSize: 20,
          cursor: "pointer",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </button>

      <label style={labelStyle}>Training name</label>
      <input
        style={{ ...inputStyle, marginBottom: 16 }}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
      />

      <label style={labelStyle}>Description (optional)</label>
      <input
        style={{ ...inputStyle, marginBottom: 16 }}
        placeholder="A short note about what this training is for"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label style={labelStyle}>Tracked fields</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {activeFields.map((f) => {
          const loggedCount = loggedCountFor(f.id);
          return (
            <div key={f.id} style={{ border: "1px solid #EAEAE0", borderRadius: 10, padding: 10 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="e.g. Recall speed, Distraction level"
                  value={f.label}
                  onChange={(e) => updateField(f.id, { label: e.target.value })}
                />
                <button
                  onClick={() => removeField(f.id)}
                  aria-label="Remove field"
                  style={{ border: "none", background: "transparent", color: "#B5432E", cursor: "pointer", fontSize: 16 }}
                >
                  🗑
                </button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  style={{ ...inputStyle, flex: 1 }}
                  value={f.type}
                  onChange={(e) => updateField(f.id, { type: e.target.value })}
                >
                  {Object.entries(FIELD_TYPES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
                {f.type === "number" && (
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="unit (sec, m, %) - optional"
                    value={f.unit}
                    onChange={(e) => updateField(f.id, { unit: e.target.value })}
                  />
                )}
              </div>
              {loggedCount > 0 && (
                <div style={{ fontSize: 11.5, color: "#8B8F7F", marginTop: 6 }}>
                  Logged in {loggedCount} session{loggedCount === 1 ? "" : "s"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={addField}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "transparent",
          border: "1px dashed #B9BFAE",
          borderRadius: 8,
          padding: "8px 12px",
          color: "#4C6B4F",
          fontWeight: 500,
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        + Add another thing to track
      </button>

      {archivedFields.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Not tracked anymore</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 6 }}>
            {archivedFields.map((f) => (
              <div
                key={f.id}
                style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #EAEAE0", borderRadius: 10, padding: "8px 10px" }}
              >
                <div style={{ flex: 1, fontSize: 13, color: "#8B8F7F" }}>
                  {f.label}
                  {f.unit ? ` (${f.unit})` : ""}
                </div>
                <button
                  onClick={() => restoreField(f.id)}
                  style={{ border: "none", background: "transparent", color: "#4C6B4F", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                >
                  Track again
                </button>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: "#8B8F7F", lineHeight: 1.5 }}>
            Past sessions keep everything already logged for these — they just won't show up on new ones.
          </p>
        </div>
      )}

      {error && <p style={{ color: "#B5432E", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      <button
        onClick={save}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 10,
          border: "none",
          background: "#1E2B22",
          color: "#FFFFFF",
          fontWeight: 500,
          fontSize: 15,
          cursor: "pointer",
        }}
      >
        Save changes
      </button>

      {showIconPicker && (
        <IconPickerModal
          current={icon}
          onClose={() => setShowIconPicker(false)}
          onSelect={(picked) => {
            setIcon(picked);
            setShowIconPicker(false);
          }}
        />
      )}
    </Modal>
  );
}
