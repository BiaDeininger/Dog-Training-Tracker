// Everything about reading/writing this app's data to the browser's
// localStorage: the dogs/trainings/entries state, and the separate
// AI provider config (kept in its own key so clearing one never touches
// the other).

const STORAGE_KEY = "dog-tracker-v1";
const AI_STORAGE_KEY = "dog-tracker-ai-config";

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
