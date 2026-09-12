// Add/rename/delete dogs. Opened from the "Manage dogs" link and the "+"
// button next to the dog tabs.

function ManageDogsModal({ dogs, onClose, onAdd, onRename, onDelete }) {
  const [newName, setNewName] = useState("");
  const [names, setNames] = useState(() => Object.fromEntries(dogs.map((d) => [d.id, d.name])));
  const [confirmingId, setConfirmingId] = useState(null);

  const addDog = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName("");
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
    </Modal>
  );
}
