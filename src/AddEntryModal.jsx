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
//
// Text fields (e.g. "Alone with") suggest previously typed values for that
// field on this training, most-used first, via a native <datalist> — click
// or start typing and the browser offers matches.

function AddEntryModal({ category, entry, categoryEntries = [], dogs = [], dogAccents = {}, allCategories = [], onClose, onSave }) {
  const hasSteps = category.steps && category.steps.length > 0;
  const [date, setDate] = useState(entry?.date || todayStr());
  const [time, setTime] = useState(entry ? entry.time || "" : nowTimeStr());
  const [editingWhen, setEditingWhen] = useState(false);
  const [values, setValues] = useState(entry?.values || {});
  const [notes, setNotes] = useState(entry?.notes || "");
  const [stepId, setStepId] = useState(entry?.stepId || (hasSteps ? category.steps[0].id : null));
  const [taskChecks, setTaskChecks] = useState(entry?.taskChecks || {});

  // Logging a new (not editing) session lets you fan it out to other dogs that
  // have a same-named training, so e.g. a walk done with two dogs together
  // only has to be entered once. Matched by name, since trainings are
  // separate per-dog records — see ensureCoreCategories in storage.js.
  const isNew = !entry;
  const otherDogOptions = isNew
    ? dogs
        .filter((d) => d.id !== category.dogId)
        .map((d) => ({
          dog: d,
          match: allCategories.find(
            (c) => c.dogId === d.id && c.name.trim().toLowerCase() === category.name.trim().toLowerCase()
          ),
        }))
    : [];
  const [selectedDogIds, setSelectedDogIds] = useState([category.dogId]);
  const toggleDog = (dogId) =>
    setSelectedDogIds((ids) => (ids.includes(dogId) ? ids.filter((id) => id !== dogId) : [...ids, dogId]));

  const setVal = (fieldId, v) => setValues((old) => ({ ...old, [fieldId]: v }));
  const suggestionsFor = (fieldId) => {
    const counts = new Map();
    categoryEntries.forEach((e) => {
      const v = e.values && e.values[fieldId];
      if (typeof v === "string" && v.trim()) counts.set(v, (counts.get(v) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);
  };
  const toggleTask = (taskId) => setTaskChecks((tc) => ({ ...tc, [taskId]: !tc[taskId] }));
  const save = () => {
    const payload = { date, time: normalizeTimeInput(time, ""), values, notes: notes.trim() };
    if (hasSteps) {
      payload.stepId = stepId;
      payload.taskChecks = taskChecks;
    }
    onSave(payload, isNew ? selectedDogIds : undefined);
  };

  const currentStep = hasSteps ? category.steps.find((s) => s.id === stepId) : null;
  const doneCount = currentStep ? currentStep.tasks.filter((t) => taskChecks[t.id]).length : 0;

  return (
    <Modal title={`${entry ? "Edit" : "Log"}: ${category.name}`} onClose={onClose}>
      {otherDogOptions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Dogs</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <DogChip dog={dogs.find((d) => d.id === category.dogId)} c={dogAccents[category.dogId]} selected locked />
            {otherDogOptions.map(({ dog, match }) => (
              <DogChip
                key={dog.id}
                dog={dog}
                c={dogAccents[dog.id]}
                selected={selectedDogIds.includes(dog.id)}
                disabled={!match}
                title={!match ? `${dog.name} has no "${category.name}" training yet` : undefined}
                onClick={() => match && toggleDog(dog.id)}
              />
            ))}
          </div>
          {selectedDogIds.length > 1 && (
            <div style={{ fontSize: 12, color: "#8B8F7F", marginTop: 6 }}>
              Logs this session for {selectedDogIds.length} dogs at once.
            </div>
          )}
        </div>
      )}

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

      {/* Archived fields (removed via "Edit training") stay on past entries but don't appear here. */}
      {category.fields.filter((f) => !f.archived).map((f) => (
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
            <React.Fragment>
              <input
                type="text"
                style={inputStyle}
                list={`suggestions-${f.id}`}
                value={values[f.id] ?? ""}
                onChange={(e) => setVal(f.id, e.target.value)}
              />
              <datalist id={`suggestions-${f.id}`}>
                {suggestionsFor(f.id).map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </React.Fragment>
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
        {entry
          ? "Save changes"
          : selectedDogIds.length > 1
          ? `Save for ${joinWithAnd(selectedDogIds.map((id) => dogs.find((d) => d.id === id)?.name).filter(Boolean))}`
          : "Save entry"}
      </button>
    </Modal>
  );
}

// A toggleable dog chip for the multi-dog picker, styled like the dog switcher
// pills on the main screen (see App.jsx) with a checkmark added so it doesn't
// read as the same single-select control.
function DogChip({ dog, c, selected, disabled, locked, title, onClick }) {
  if (!dog || !c) return null;
  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={disabled}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 999,
        border: selected ? `2px solid ${c.accent}` : "1px solid #D7DACB",
        background: disabled ? "#F4F5EF" : selected ? c.light : "#FFFFFF",
        color: disabled ? "#B9BFAE" : selected ? c.accent : "#5B6459",
        fontWeight: 500,
        fontSize: 14,
        whiteSpace: "nowrap",
        cursor: locked ? "default" : disabled ? "not-allowed" : "pointer",
      }}
    >
      {selected && !disabled && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
      {dog.photo && (
        <span
          style={{
            display: "inline-block",
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundImage: `url(${dog.photo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      {dog.name}
    </button>
  );
}
