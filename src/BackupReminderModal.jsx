// Periodic nudge to export a backup: shown after loading the app when it's
// been a while (or a bunch of sessions have been logged) since the last one.

function BackupReminderModal({ onExport, onDismiss }) {
  return (
    <Modal title="Back up your data?" onClose={onDismiss}>
      <p style={{ fontSize: 14, color: "#5B6459", lineHeight: 1.6, marginTop: 0 }}>
        It's been a while (or you've logged a bunch of new sessions) since your last backup. Your data only lives on
        this device — export a fresh copy now so you don't lose anything if you clear your browser's data or switch
        phones.
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          onClick={onExport}
          style={{ flex: 1, border: "none", background: "#1E2B22", color: "#FFFFFF", fontWeight: 500, fontSize: 14, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}
        >
          Export backup now
        </button>
        <button
          onClick={onDismiss}
          style={{ border: "1px solid #D7DACB", background: "transparent", color: "#5B6459", fontSize: 14, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}
        >
          Remind me later
        </button>
      </div>
    </Modal>
  );
}
