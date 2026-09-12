// Form for logging one training session against a category's fields.

function AddEntryModal({ category, onClose, onSave }) {
  const [date, setDate] = useState(todayStr());
  const [values, setValues] = useState({});
  const [notes, setNotes] = useState("");

  const setVal = (fieldId, v) => setValues((old) => ({ ...old, [fieldId]: v }));
  const save = () => onSave({ date, values, notes: notes.trim() });

  return (
    <Modal title={`Log: ${category.name}`} onClose={onClose}>
      <label style={labelStyle}>Date</label>
      <input
        type="date"
        style={{ ...inputStyle, marginBottom: 16 }}
        value={date}
        max={todayStr()}
        onChange={(e) => setDate(e.target.value)}
      />

      {category.fields.map((f) => (
        <div key={f.id} style={{ marginBottom: 16 }}>
          <label style={labelStyle}>
            {f.label}
            {f.unit ? ` (${f.unit})` : ""}
          </label>
          {f.type === "scale" && <ScalePicker value={values[f.id]} onChange={(v) => setVal(f.id, v)} />}
          {f.type === "number" && (
            <input
              type="number"
              inputMode="decimal"
              style={inputStyle}
              value={values[f.id] ?? ""}
              onChange={(e) => setVal(f.id, e.target.value)}
            />
          )}
          {f.type === "text" && (
            <input
              type="text"
              style={inputStyle}
              value={values[f.id] ?? ""}
              onChange={(e) => setVal(f.id, e.target.value)}
            />
          )}
        </div>
      ))}

      <label style={labelStyle}>Notes</label>
      <textarea
        style={{ ...inputStyle, minHeight: 70, marginBottom: 18, resize: "vertical" }}
        placeholder="Anything worth remembering about this session"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

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
        Save entry
      </button>
    </Modal>
  );
}
