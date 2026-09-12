// Everything about reading/writing this app's data to the browser's
// localStorage: the dogs/trainings/entries state, and the separate
// AI provider config (kept in its own key so clearing one never touches
// the other).

const STORAGE_KEY = "dog-tracker-v1";
const AI_STORAGE_KEY = "dog-tracker-ai-config";
const BACKUP_META_KEY = "dog-tracker-backup-meta";
const BACKUP_FILE_VERSION = 1;
const BACKUP_REMINDER_DAYS = 14;
const BACKUP_REMINDER_ENTRIES = 10;
const BACKUP_REPROMPT_HOURS = 20;

function loadAIConfig() {
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveAIConfig(cfg) {
  try {
    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(cfg));
    return true;
  } catch (e) {
    return false;
  }
}

function clearAIConfig() {
  try {
    localStorage.removeItem(AI_STORAGE_KEY);
  } catch (e) {}
}

function seedState() {
  return { dogs: [], categories: [], entries: [] };
}

function coreCategoryDefs() {
  const f = (label, type, unit) => ({ id: uid(), label, type, unit: unit || "" });
  return [
    {
      name: "Loose leash walking",
      fields: () => [f("Duration", "number", "min"), f("Place", "text"), f("Rating", "scale")],
    },
    {
      name: "New places",
      fields: () => [f("Duration", "number", "min"), f("Place", "text"), f("Rating", "scale")],
    },
  ];
}

function ensureCoreCategories(state) {
  let changed = false;
  const categories = [...state.categories];
  state.dogs.forEach((dog) => {
    coreCategoryDefs().forEach((def) => {
      const exists = categories.some(
        (c) => c.dogId === dog.id && c.name.trim().toLowerCase() === def.name.toLowerCase()
      );
      if (!exists) {
        categories.push({ id: uid(), dogId: dog.id, name: def.name, fields: def.fields() });
        changed = true;
      }
    });
  });
  return { state: { ...state, categories }, changed };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let data = raw ? JSON.parse(raw) : seedState();
    const { state: patched, changed } = ensureCoreCategories(data);
    if (changed || !raw) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(patched));
      } catch (e) {}
    }
    return patched;
  } catch (e) {
    console.error("Load failed, using fresh data:", e);
    const { state: seeded } = ensureCoreCategories(seedState());
    return seeded;
  }
}

function saveState(next) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch (e) {
    console.error("Save failed:", e);
    return false;
  }
}

// --- Backup export/import ---
// A backup file is all-or-nothing: the full dogs/categories/entries state,
// with no per-dog or per-category selection. AI provider config (which can
// hold an API key) is intentionally excluded from the file.

function buildBackupFile(state) {
  return {
    version: BACKUP_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    data: { dogs: state.dogs, categories: state.categories, entries: state.entries },
  };
}

function downloadBackupFile(state) {
  const json = JSON.stringify(buildBackupFile(state), null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dog-training-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function parseBackupFile(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error("That file isn't valid JSON.");
  }
  const data = parsed && parsed.data ? parsed.data : parsed;
  if (!data || !Array.isArray(data.dogs) || !Array.isArray(data.categories) || !Array.isArray(data.entries)) {
    throw new Error("That file doesn't look like a Dog Training Tracker backup.");
  }
  return { dogs: data.dogs, categories: data.categories, entries: data.entries };
}

// --- Backup reminder ---
// Tracked separately from app data so it survives independent of dogs/entries,
// and so we can nudge a fresh install (never yet backed up) after two weeks too.

function loadBackupMeta() {
  try {
    const raw = localStorage.getItem(BACKUP_META_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const fresh = { installedAt: new Date().toISOString(), lastBackupAt: null, entryCountAtBackup: 0, lastPromptedAt: null };
  try {
    localStorage.setItem(BACKUP_META_KEY, JSON.stringify(fresh));
  } catch (e) {}
  return fresh;
}

function saveBackupMeta(meta) {
  try {
    localStorage.setItem(BACKUP_META_KEY, JSON.stringify(meta));
  } catch (e) {}
}

function recordBackupExported(meta, entryCount) {
  const next = { ...meta, lastBackupAt: new Date().toISOString(), entryCountAtBackup: entryCount, lastPromptedAt: null };
  saveBackupMeta(next);
  return next;
}

function recordBackupPrompted(meta) {
  const next = { ...meta, lastPromptedAt: new Date().toISOString() };
  saveBackupMeta(next);
  return next;
}

function isBackupReminderDue(meta, entryCount) {
  const baseline = meta.lastBackupAt || meta.installedAt;
  const daysSinceBaseline = baseline ? (Date.now() - new Date(baseline).getTime()) / 86400000 : 0;
  const newEntries = entryCount - (meta.entryCountAtBackup || 0);
  const due = daysSinceBaseline >= BACKUP_REMINDER_DAYS || newEntries >= BACKUP_REMINDER_ENTRIES;
  if (!due) return false;
  if (meta.lastPromptedAt) {
    const hoursSincePrompt = (Date.now() - new Date(meta.lastPromptedAt).getTime()) / 3600000;
    if (hoursSincePrompt < BACKUP_REPROMPT_HOURS) return false;
  }
  return true;
}
