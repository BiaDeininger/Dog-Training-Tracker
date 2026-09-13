// Form for logging one training session against a category's fields, or
// editing one that was already logged (pass its entry in via `entry`). If
// the category has a step/task checklist (from a template — see
// src/trainingTemplates.js), also lets you pick which step you're on and
// check off its tasks.
//
// The "When" timestamp auto-fills to right now for a new entry and is shown
// collapsed as plain text; "Edit" reveals date/time inputs for backfilling.
// Entries logged before this feature shipped have no stored time, so their
// collapsed text just shows the date until someone edits in a time.

function AddEntryModal({ category, entry, onClose, onSave }) {
  const hasSteps = category.steps && category.steps.length > 0;
  const [date, setDate] = useState(entry?.date || todayStr());
  const [time, setTime] = useState(entry ? entry.time || "" : nowTimeStr());
  const [editingWhen, setEditingWhen] = useState(false);
  const [values, setValues] = useState(entry?.values || {});
  const [notes, setNotes] = useState(entry?.notes || "");
  const [stepId, setStepId] = useState(entry?.stepId || (hasSteps ? category.steps[0].id : null));
  const [taskChecks, setTaskChecks] = useState(entry?.taskChecks || {});

  const setVal = (fieldId, v) => setValues((old) => ({ ...old, [fieldId]: v }));
  const toggleTask = (taskId) => setTaskChecks((tc) => ({ ...tc, [taskId]: !tc[taskId] }));
  const save = () => {
    const payload = { date, time: normalizeTimeInput(time, ""), values, notes: notes.trim() };
    if (hasSteps) {
      payload.stepId = stepId;
      payload.taskChecks = taskChecks;
    }
    onSave(payload);
  };

  const currentStep = hasSteps ? category.steps.find((s) => s.id === stepId) : null;
  const doneCount = currentStep ? currentStep.tasks.filter((t) => taskChecks[t.id]).length : 0;

  return (
    <Modal title={`${entry ? "Edit" : "Log"}: ${category.name}`} onClose={onClose}>
      <label style={labelStyle}>When</label>
      {editingWhen ? (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="date"
            style={{ ...inputStyle, flex: 1 }}
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="HH:MM"
            style={{ ...inputStyle, flex: 1 }}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            onBlur={() => setTime((t) => normalizeTimeInput(t, ""))}
          />
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 15, color: "#1E2B22" }}>{fmtDateTime(date, time)}</span>
          <button
            type="button"
            onClick={() => setEditingWhen(true)}
            style={{ border: "none", background: "transparent", color: "#4C6B4F", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: 0 }}
          >
            Edit
          </button>
        </div>
      )}

      {hasSteps && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Which step are you training?</label>
          <select
            style={{ ...inputStyle, marginBottom: 10 }}
            value={stepId}
            onChange={(e) => {
              setStepId(e.target.value);
              setTaskChecks({});
            }}
          >
            {category.steps.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          {currentStep && (
            <React.Fragment>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#5B6459" }}>
                  {doneCount}/{currentStep.tasks.length} tasks checked
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const allDone = doneCount === currentStep.tasks.length;
                    const next = {};
                    currentStep.tasks.forEach((t) => {
                      next[t.id] = !allDone;
                    });
                    setTaskChecks(next);
                  }}
                  style={{ border: "none", background: "transparent", color: "#4C6B4F", fontSize: 12, fontWeight: 500, cursor: "pointer", padding: 0 }}
                >
                  {doneCount === currentStep.tasks.length ? "Clear all" : "Mark all done"}
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {currentStep.tasks.map((t) => (
                  <label
                    key={t.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      fontSize: 13.5,
                      color: "#1E2B22",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!taskChecks[t.id]}
                      onChange={() => toggleTask(t.id)}
                      style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, cursor: "pointer" }}
                    />
                    <span style={taskChecks[t.id] ? { color: "#8B8F7F", textDecoration: "line-through" } : undefined}>
                      {t.label}
                    </span>
                  </label>
                ))}
              </div>
            </React.Fragment>
          )}
        </div>
      )}

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
        {entry ? "Save changes" : "Save entry"}
      </button>
    </Modal>
  );
}
