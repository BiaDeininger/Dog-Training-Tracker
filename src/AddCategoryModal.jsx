// Form for creating a new training (e.g. "Recall training"). Starts on a
// picker of built-in templates (see src/trainingTemplates.js) — each can be
// previewed (with its full step/task checklist, if it has one) and used
// as-is or renamed — with a "build your own" option that drops into the
// original custom-fields form.

function AddCategoryModal({ dogName, onClose, onSave }) {
  const [mode, setMode] = useState("picker"); // "picker" | "preview" | "custom"
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateName, setTemplateName] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([{ id: uid(), label: "", type: "number", unit: "" }]);
  const [error, setError] = useState("");

  const updateField = (id, patch) => setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const removeField = (id) => setFields((fs) => fs.filter((f) => f.id !== id));
  const addField = () => setFields((fs) => [...fs, { id: uid(), label: "", type: "number", unit: "" }]);

  const openPreview = (t) => {
    setSelectedTemplate(t);
    setTemplateName(t.name);
    setMode("preview");
  };

  const useTemplate = () => {
    if (!selectedTemplate) return;
    onSave({
      name: (templateName || selectedTemplate.name).trim() || selectedTemplate.name,
      icon: selectedTemplate.icon,
      fields: selectedTemplate.fields(),
      ...(selectedTemplate.steps ? { steps: selectedTemplate.steps() } : {}),
      description: selectedTemplate.description,
    });
  };

  const saveCustom = () => {
    if (!name.trim()) {
      setError("Give the training a name first.");
      return;
    }
    const cleanFields = fields.filter((f) => f.label.trim());
    if (cleanFields.length === 0) {
      setError("Add at least one thing you want to track.");
      return;
    }
    onSave({ name: name.trim(), fields: cleanFields, ...(description.trim() ? { description: description.trim() } : {}) });
  };

  const backButton = (
    <button
      onClick={() => setMode("picker")}
      style={{ border: "none", background: "transparent", color: "#5B6459", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 14 }}
    >
      ← Back to templates
    </button>
  );

  if (mode === "preview" && selectedTemplate) {
    return (
      <Modal title={selectedTemplate.name} onClose={onClose}>
        {backButton}

        {selectedTemplate.source && (
          <p style={{ fontSize: 12, color: "#8B8F7F", fontStyle: "italic", marginTop: -6, marginBottom: 10 }}>
            {selectedTemplate.source}
          </p>
        )}
        <p style={{ fontSize: 13, color: "#5B6459", marginBottom: 16, lineHeight: 1.5 }}>{selectedTemplate.description}</p>

        <label style={labelStyle}>Training name</label>
        <input
          style={{ ...inputStyle, marginBottom: 16 }}
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />

        {selectedTemplate.steps && (
          <React.Fragment>
            <label style={labelStyle}>Steps included ({selectedTemplate.steps().length})</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, maxHeight: 220, overflowY: "auto" }}>
              {selectedTemplate.steps().map((s) => (
                <div key={s.id} style={{ border: "1px solid #EAEAE0", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}>
                  <div style={{ color: "#1E2B22", fontWeight: 500 }}>{s.label}</div>
                  <div style={{ color: "#8B8F7F", fontSize: 12, marginTop: 2 }}>
                    {s.tasks.length} task{s.tasks.length === 1 ? "" : "s"}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#8B8F7F", marginBottom: 16 }}>
              When you log a session for this training, you'll pick which step you're on and check off its tasks.
            </p>
          </React.Fragment>
        )}

        <button
          onClick={useTemplate}
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
          Use this training
        </button>
      </Modal>
    );
  }

  if (mode === "custom") {
    return (
      <Modal title={`New training for ${dogName}`} onClose={onClose}>
        {backButton}

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

        <label style={labelStyle}>Description (optional)</label>
        <input
          style={{ ...inputStyle, marginBottom: 16 }}
          placeholder="A short note about what this training is for"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          onClick={saveCustom}
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

  return (
    <Modal title={`New training for ${dogName}`} onClose={onClose}>
      <label style={labelStyle}>Start from a template</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {TRAINING_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => openPreview(t)}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              textAlign: "left",
              border: "1px solid #EAEAE0",
              borderRadius: 12,
              padding: "12px 14px",
              background: "#FBFAF6",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontWeight: 500, fontSize: 15, color: "#1E2B22" }}>{t.name}</span>
              <span style={{ display: "block", fontSize: 12.5, color: "#5B6459", marginTop: 2, lineHeight: 1.4 }}>
                {t.description}
              </span>
              {t.steps && (
                <span style={{ display: "inline-block", fontSize: 11, color: "#4C6B4F", marginTop: 6, fontWeight: 500 }}>
                  {t.steps().length}-step checklist included
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => setMode("custom")}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          width: "100%",
          padding: "13px",
          borderRadius: 10,
          border: "1px dashed #B9BFAE",
          background: "transparent",
          color: "#1E2B22",
          fontWeight: 500,
          fontSize: 15,
          cursor: "pointer",
        }}
      >
        + Build your own training
      </button>
    </Modal>
  );
}
