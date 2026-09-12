// Short "what is this app" explainer: where data lives, how to back it up,
// and a link back to the GitHub repo. Opened from the ⓘ button in the header.

function AboutModal({ onClose }) {
  return (
    <Modal title="About this app" onClose={onClose}>
      <p style={{ fontSize: 14, color: "#5B6459", lineHeight: 1.6, marginTop: 0 }}>
        Your dogs, trainings, and every session you log are stored only in <strong>this browser, on this device</strong>.
        Nothing is sent to a server, and no one else using this app can see it.
      </p>
      <p style={{ fontSize: 14, color: "#5B6459", lineHeight: 1.6 }}>
        That also means clearing your browser's data, or switching to a different phone or browser, will erase it —
        unless you've exported a backup first. You can do that anytime under <strong>Manage dogs → Backup your data</strong>.
      </p>
      <p style={{ fontSize: 14, color: "#5B6459", lineHeight: 1.6, marginBottom: 0 }}>
        Source code & install link:
        <br />
        <a
          href="https://github.com/BiaDeininger/Dog-Training-Tracker"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#1E2B22", fontWeight: 500 }}
        >
          github.com/BiaDeininger/Dog-Training-Tracker
        </a>
      </p>
    </Modal>
  );
}
