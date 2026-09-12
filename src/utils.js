// Small stand-alone helpers and shared style constants used across the app.
// No React here — just plain data/date logic and style objects.

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const todayStr = () => new Date().toISOString().slice(0, 10);

const FIELD_TYPES = {
  scale: { label: "Scale (1–5)" },
  number: { label: "Number" },
  text: { label: "Note only" },
};

function fmtDate(d) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function daysSince(dateStr) {
  const then = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function fieldTrend(entries, categoryId, fieldId) {
  const vals = entries
    .filter((e) => e.categoryId === categoryId && e.values[fieldId] !== undefined && e.values[fieldId] !== "")
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((e) => Number(e.values[fieldId]))
    .filter((n) => !Number.isNaN(n));
  if (vals.length < 2) return null;
  const mid = Math.ceil(vals.length / 2);
  const first = vals.slice(0, mid);
  const second = vals.slice(mid);
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const a1 = avg(first);
  const a2 = second.length ? avg(second) : a1;
  return { a1, a2, delta: a2 - a1, count: vals.length };
}

function inDateRange(dateStr, range, customStart, customEnd) {
  if (range === "all") return true;
  if (range === "week") {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return dateStr >= cutoff.toISOString().slice(0, 10);
  }
  if (range === "month") {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return dateStr >= cutoff.toISOString().slice(0, 10);
  }
  if (range === "custom") {
    if (customStart && dateStr < customStart) return false;
    if (customEnd && dateStr > customEnd) return false;
    return true;
  }
  return true;
}

const scaleColors = ["#C9CFC0", "#A9BB9C", "#87A874", "#639922", "#3B6D11"];

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #D7DACB",
  fontSize: 15,
  fontFamily: "'Work Sans', sans-serif",
  color: "#1E2B22",
  boxSizing: "border-box",
  background: "#FBFAF6",
};

const labelStyle = {
  fontSize: 13,
  color: "#5B6459",
  marginBottom: 6,
  display: "block",
  fontWeight: 500,
};
