// Form for creating a new training (e.g. "Recall training") and picking
// what to track for it (scale / number / note-only fields).

function AddCategoryModal({ dogName, onClose, onSave }) {
  const [name, setName] = useState("");
  const [fields, setFields] = useState([{ id: uid(), label: "", type: "number", unit: "" }]);
  const [error, setError] = useState("");

  const updateField = (id, patch) => setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const removeField = (id) => setFields((fs) => fs.filter((f) => f.id !== id));
  const addField = () => setFields((fs) => [...fs, { id: uid(), label: "", type: "number", unit: "" }]);

  const save = () => {
    if (!name.trim()) {
      setError("Give the training a name first.");
      return;
    }
    const cleanFields = fields.filter((f) => f.label.trim());
    if (cleanFields.length === 0) {
      setError("Add at least one thing you want to track.");
      return;
    }
    onSave({ name: name.trim(), fields: cleanFields });
  };

  return (
    <Modal title={`New training for ${dogName}`} onClose={onClose}>
      <label style={labelStyle}>Training name</label>
      <input
        style={{ ...inputStyle, marginBottom: 16 }}
        placeholder="Recall training"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
      />

      <label style={labelStyle}>What do you want to track?</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {fields.map((f) => (
          <div key={f.id} style={{ border: "1px solid #EAEAE0", borderRadius: 10, padding: 10 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="e.g. Recall speed, Distraction level"
                value={f.label}
                onChange={(e) => updateField(f.id, { label: e.target.value })}
              />
              {fields.length > 1 && (
                <button
                  onClick={() => removeField(f.id)}
                  aria-label="Remove field"
                  style={{ border: "none", background: "transparent", color: "#B5432E", cursor: "pointer", fontSize: 16 }}
                >
                  🗑
                </button>
              )}
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
          </div>
        ))}
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
        Create training
      </button>
    </Modal>
  );
}
