// Add/rename/delete dogs, plus the app-wide backup export/import. Opened
// from the "Manage dogs" link and the "+" button next to the dog tabs.

function ManageDogsModal({ dogs, onClose, onAdd, onRename, onDelete, lastBackupAt, onExport, onImport }) {
  const [newName, setNewName] = useState("");
  const [names, setNames] = useState(() => Object.fromEntries(dogs.map((d) => [d.id, d.name])));
  const [confirmingId, setConfirmingId] = useState(null);
  const [exportedJustNow, setExportedJustNow] = useState(false);
  const [importError, setImportError] = useState(null);
  const [pendingImport, setPendingImport] = useState(null); // { dogs, categories, entries }
  const fileInputRef = useRef(null);

  const addDog = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName("");
  };

  const handleExport = () => {
    onExport();
    setExportedJustNow(true);
  };

  const handleFileChosen = (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // allow re-choosing the same file later
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setPendingImport(parseBackupFile(reader.result));
      } catch (err) {
        setImportError(err.message);
      }
    };
    reader.onerror = () => setImportError("Couldn't read that file.");
    reader.readAsText(file);
  };

  const confirmImport = () => {
    onImport(pendingImport);
    setPendingImport(null);
    onClose();
  };

  return (
    <Modal title="Manage dogs" onClose={onClose}>
      {dogs.map((d) => (
        <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={names[d.id] ?? d.name}
            onChange={(e) => setNames((n) => ({ ...n, [d.id]: e.target.value }))}
            onBlur={() => {
              const trimmed = (names[d.id] ?? "").trim();
              if (trimmed && trimmed !== d.name) onRename(d.id, trimmed);
            }}
          />
          {confirmingId === d.id ? (
            <React.Fragment>
              <button
                onClick={() => {
                  onDelete(d.id);
                  setConfirmingId(null);
                }}
                style={{ border: "none", background: "#B5432E", color: "#FFFFFF", fontSize: 12, fontWeight: 500, borderRadius: 6, padding: "8px 10px", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmingId(null)}
                style={{ border: "none", background: "transparent", color: "#5B6459", fontSize: 12, cursor: "pointer", padding: "8px 4px" }}
              >
                Cancel
              </button>
            </React.Fragment>
          ) : (
            <button
              onClick={() => setConfirmingId(d.id)}
              aria-label="Delete dog"
              style={{ border: "none", background: "transparent", color: "#B5432E", cursor: "pointer", fontSize: 16, padding: "8px 4px" }}
            >
              🗑
            </button>
          )}
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          placeholder="New dog's name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addDog();
          }}
        />
        <button
          onClick={addDog}
          style={{ border: "none", background: "#1E2B22", color: "#FFFFFF", fontWeight: 500, fontSize: 14, borderRadius: 8, padding: "0 16px", cursor: "pointer" }}
        >
          Add
        </button>
      </div>

      <div style={{ marginTop: 26, paddingTop: 20, borderTop: "1px solid #E4E6DA" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1E2B22", margin: "0 0 4px" }}>Backup your data</h3>
        <p style={{ fontSize: 12, color: "#8B8F7F", margin: "0 0 12px", lineHeight: 1.5 }}>
          Everything is stored only on this device. Export a copy so you can restore it after clearing your browser's
          data or moving to a new phone.
          {lastBackupAt && (
            <React.Fragment>
              {" "}Last export: {new Date(lastBackupAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}.
            </React.Fragment>
          )}
        </p>

        {pendingImport ? (
          <div style={{ background: "#FBFAF6", border: "1px solid #D7DACB", borderRadius: 10, padding: 12 }}>
            <p style={{ fontSize: 13, color: "#1E2B22", margin: "0 0 10px", lineHeight: 1.5 }}>
              This file has <strong>{pendingImport.dogs.length}</strong> dog(s), <strong>{pendingImport.categories.length}</strong> training(s)
              and <strong>{pendingImport.entries.length}</strong> logged session(s). Importing will <strong>replace everything</strong>{" "}
              currently stored on this device.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={confirmImport}
                style={{ border: "none", background: "#B5432E", color: "#FFFFFF", fontWeight: 500, fontSize: 13, borderRadius: 8, padding: "9px 14px", cursor: "pointer" }}
              >
                Import &amp; replace
              </button>
              <button
                onClick={() => setPendingImport(null)}
                style={{ border: "1px solid #D7DACB", background: "transparent", color: "#5B6459", fontSize: 13, borderRadius: 8, padding: "9px 14px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleExport}
              style={{ flex: 1, border: "1px solid #D7DACB", background: "#FFFFFF", color: "#1E2B22", fontWeight: 500, fontSize: 13, borderRadius: 8, padding: "10px 12px", cursor: "pointer" }}
            >
              ⬇ Export backup
            </button>
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{ flex: 1, border: "1px solid #D7DACB", background: "#FFFFFF", color: "#1E2B22", fontWeight: 500, fontSize: 13, borderRadius: 8, padding: "10px 12px", cursor: "pointer" }}
            >
              ⬆ Import backup
            </button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChosen} style={{ display: "none" }} />
          </div>
        )}

        {exportedJustNow && !pendingImport && (
          <p style={{ color: "#4C6B4F", fontSize: 12, marginTop: 8 }}>Backup file downloaded.</p>
        )}
        {importError && <p style={{ color: "#B5432E", fontSize: 12, marginTop: 8 }}>{importError}</p>}
      </div>
    </Modal>
  );
}
