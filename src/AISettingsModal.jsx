// Where a user pastes their own free Google Gemini API key for the optional
// "AI notes analysis" feature (see src/ai.js for the actual API call).
// Saving is gated behind reading a warning and checking the box, since the
// key is stored in this browser and sent straight from it — there's no
// backend to keep it behind.

function AISettingsModal({ config, onClose, onSave, onRemove }) {
  const [apiKey, setApiKey] = useState(config?.apiKey || "");
  const [model, setModel] = useState(config?.model || DEFAULT_MODEL);
  const [acknowledged, setAcknowledged] = useState(false);

  const canSave = Boolean(apiKey.trim()) && acknowledged;

  const save = () => {
    if (!canSave) return;
    onSave({ apiKey: apiKey.trim(), model: model.trim() || DEFAULT_MODEL });
  };

  return (
    <Modal title="AI notes analysis" onClose={onClose}>
      {config?.apiKey && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#EAF3EC",
            border: "1px solid #BFE0C9",
            borderRadius: 10,
            padding: "9px 12px",
            marginBottom: 14,
            fontSize: 13,
            fontWeight: 500,
            color: "#22643B",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3F8F5F", display: "inline-block", flexShrink: 0 }} />
          Gemini is connected
        </div>
      )}

      <div
        style={{
          background: "#EEF5E9",
          border: "1px solid #CFE3BE",
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 16,
          fontSize: 12.5,
          color: "#365B25",
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Free — no credit card needed</div>
        Notes analysis runs on Google's Gemini API, which has a free tier. To get a key:
        <ol style={{ margin: "6px 0 0", paddingLeft: 18 }}>
          <li>Go to <strong>{GEMINI_KEY_URL}</strong></li>
          <li>Sign in with any Google account</li>
          <li>Click "Create API key" and copy it</li>
        </ol>
      </div>

      <p style={{ fontSize: 13, color: "#5B6459", marginBottom: 14 }}>
        Paste your key below. It's saved only in this browser's storage and sent directly from your device to
        Google when you analyze notes — never through us, never in the GitHub repo.
      </p>

      <label style={labelStyle}>API key</label>
      <input
        type="password"
        style={{ ...inputStyle, marginBottom: 14 }}
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Paste your key here"
        autoComplete="off"
      />

      <label style={labelStyle}>Model (default is fine, only change if needed)</label>
      <input
        type="text"
        style={{ ...inputStyle, marginBottom: 18 }}
        value={model}
        onChange={(e) => setModel(e.target.value)}
      />

      <div
        style={{
          background: "#FBF3E7",
          border: "1px solid #E0C3A6",
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 14,
          fontSize: 12.5,
          color: "#5B4530",
          lineHeight: 1.5,
        }}
      >
        ⚠️ This key will be stored in this browser's local storage and sent directly to Google from your device
        every time you use AI analysis. Anyone with access to this browser or device could read it. Don't paste a
        key here on a shared or public computer.
      </div>

      <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 18, fontSize: 13, color: "#1E2B22", cursor: "pointer" }}>
        <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} style={{ marginTop: 2 }} />
        I understand
      </label>

      <button
        onClick={save}
        disabled={!canSave}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 10,
          border: "none",
          background: canSave ? "#1E2B22" : "#D7DACB",
          color: "#FFFFFF",
          fontWeight: 500,
          fontSize: 15,
          cursor: canSave ? "pointer" : "default",
        }}
      >
        Save
      </button>

      {config?.apiKey && (
        <button
          onClick={onRemove}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "10px",
            borderRadius: 10,
            border: "1px solid #E0C3A6",
            background: "transparent",
            color: "#8A4A1F",
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Remove saved key
        </button>
      )}
    </Modal>
  );
}
