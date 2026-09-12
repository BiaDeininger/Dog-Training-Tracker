// Top-level app: owns all state, wires the Log/Insights tabs together, and
// mounts everything into #root. Everything else in src/ is used from here.

function App() {
  const [state, setStateRaw] = useState(loadState);
  const [activeDogId, setActiveDogId] = useState(() => loadState().dogs[0]?.id || null);
  const [view, setView] = useState("log");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [entryModalCategory, setEntryModalCategory] = useState(null);
  const [showManageDogs, setShowManageDogs] = useState(false);
  const [aiConfig, setAiConfig] = useState(loadAIConfig);
  const [showAISettings, setShowAISettings] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const persist = (next) => {
    setStateRaw(next);
    const ok = saveState(next);
    setSaveFailed(!ok);
  };

  const dogAccents = {};
  const palette = [
    { accent: "#4C6B4F", light: "#E3EADD" },
    { accent: "#3E6690", light: "#DFE9F1" },
    { accent: "#B5652E", light: "#F3E3D5" },
    { accent: "#8B5A9E", light: "#EBE0F0" },
  ];
  state.dogs.forEach((d, i) => (dogAccents[d.id] = palette[i % palette.length]));

  const activeDog = state.dogs.find((d) => d.id === activeDogId) || state.dogs[0];
  const accent = dogAccents[activeDog?.id]?.accent || "#4C6B4F";
  const accentLight = dogAccents[activeDog?.id]?.light || "#E3EADD";
  const dogCategories = state.categories.filter((c) => c.dogId === activeDog?.id);

  const addDog = (name) => {
    const newDog = { id: uid(), name };
    const withDog = { ...state, dogs: [...state.dogs, newDog] };
    const { state: patched } = ensureCoreCategories(withDog);
    persist(patched);
    setActiveDogId(newDog.id);
  };

  const renameDog = (dogId, name) => {
    persist({ ...state, dogs: state.dogs.map((d) => (d.id === dogId ? { ...d, name } : d)) });
  };

  const deleteDog = (dogId) => {
    const catIds = new Set(state.categories.filter((c) => c.dogId === dogId).map((c) => c.id));
    const nextDogs = state.dogs.filter((d) => d.id !== dogId);
    persist({
      ...state,
      dogs: nextDogs,
      categories: state.categories.filter((c) => c.dogId !== dogId),
      entries: state.entries.filter((e) => !catIds.has(e.categoryId)),
    });
    if (activeDogId === dogId) setActiveDogId(nextDogs[0]?.id || null);
  };

  const addCategory = ({ name, fields }) => {
    const newCat = { id: uid(), dogId: activeDog.id, name, fields };
    persist({ ...state, categories: [...state.categories, newCat] });
    setShowAddCategory(false);
  };

  const moveCategory = (catId, direction) => {
    const cats = [...state.categories];
    const dogId = cats.find((c) => c.id === catId)?.dogId;
    const dogCats = cats.filter((c) => c.dogId === dogId);
    const idx = dogCats.findIndex((c) => c.id === catId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= dogCats.length) return;
    const a = dogCats[idx], b = dogCats[swapIdx];
    const fullIdxA = cats.findIndex((c) => c.id === a.id);
    const fullIdxB = cats.findIndex((c) => c.id === b.id);
    [cats[fullIdxA], cats[fullIdxB]] = [cats[fullIdxB], cats[fullIdxA]];
    persist({ ...state, categories: cats });
  };

  const deleteCategory = (catId) => {
    persist({
      ...state,
      categories: state.categories.filter((c) => c.id !== catId),
      entries: state.entries.filter((e) => e.categoryId !== catId),
    });
  };

  const addEntry = (categoryId, { date, values, notes }) => {
    const entry = { id: uid(), categoryId, date, values, notes };
    persist({ ...state, entries: [...state.entries, entry] });
    setEntryModalCategory(null);
  };

  const deleteEntry = (entryId) => {
    persist({ ...state, entries: state.entries.filter((e) => e.id !== entryId) });
  };

  return (
    <div style={{ background: "#EEF0E7", minHeight: "100vh", padding: "18px 16px 40px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <span style={{ fontSize: 20 }}>🐾</span>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, margin: 0, color: "#1E2B22" }}>
          Training tracker
        </h1>
      </div>

      {state.dogs.length === 0 ? (
        <div style={{ background: "#FFFFFF", border: "1px solid #E4E6DA", borderRadius: 14, padding: "28px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🐾</div>
          <p style={{ color: "#5B6459", fontSize: 14, marginBottom: 16 }}>Add your dog to start tracking training sessions.</p>
          <button
            onClick={() => setShowManageDogs(true)}
            style={{ border: "none", background: "#1E2B22", color: "#FFFFFF", fontWeight: 500, fontSize: 15, borderRadius: 10, padding: "12px 20px", cursor: "pointer" }}
          >
            + Add your first dog
          </button>
        </div>
      ) : (
        <React.Fragment>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, overflowX: "auto", paddingBottom: 2 }}>
            {state.dogs.map((d) => {
              const isActive = d.id === activeDog?.id;
              const c = dogAccents[d.id];
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDogId(d.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: isActive ? `2px solid ${c.accent}` : "1px solid #D7DACB",
                    background: isActive ? c.light : "#FFFFFF",
                    color: isActive ? c.accent : "#5B6459",
                    fontWeight: 500,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  {d.name}
                </button>
              );
            })}
            <button
              onClick={() => setShowManageDogs(true)}
              aria-label="Add dog"
              style={{ padding: "8px 14px", borderRadius: 999, border: "1px dashed #B9BFAE", background: "transparent", color: "#5B6459", fontWeight: 500, fontSize: 14, whiteSpace: "nowrap", cursor: "pointer" }}
            >
              +
            </button>
          </div>

          <button
            onClick={() => setShowManageDogs(true)}
            style={{ border: "none", background: "transparent", color: "#8B8F7F", fontSize: 12, textDecoration: "underline", cursor: "pointer", padding: 0, marginBottom: 18 }}
          >
            Manage dogs
          </button>

          <div style={{ display: "flex", gap: 4, marginBottom: 18, background: "#E4E6DA", borderRadius: 10, padding: 3 }}>
            {[{ key: "log", label: "Log" }, { key: "insights", label: "Insights" }].map((t) => (
              <button
                key={t.key}
                onClick={() => setView(t.key)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 8,
                  border: "none",
                  background: view === t.key ? "#FFFFFF" : "transparent",
                  color: view === t.key ? "#1E2B22" : "#5B6459",
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {view === "log" ? (
            <React.Fragment>
              {dogCategories.length === 0 && (
                <p style={{ color: "#5B6459", fontSize: 14, marginBottom: 16 }}>
                  No trainings set up for {activeDog?.name} yet. Add one below to start logging sessions.
                </p>
              )}
              {dogCategories.map((cat, idx) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  entries={state.entries.filter((e) => e.categoryId === cat.id)}
                  accent={accent}
                  accentLight={accentLight}
                  onAddEntry={() => setEntryModalCategory(cat)}
                  onDeleteEntry={deleteEntry}
                  onDeleteCategory={() => deleteCategory(cat.id)}
                  onMoveUp={() => moveCategory(cat.id, "up")}
                  onMoveDown={() => moveCategory(cat.id, "down")}
                  isFirst={idx === 0}
                  isLast={idx === dogCategories.length - 1}
                />
              ))}
              <button
                onClick={() => setShowAddCategory(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  width: "100%",
                  padding: "13px",
                  borderRadius: 12,
                  border: "1px dashed #B9BFAE",
                  background: "transparent",
                  color: "#1E2B22",
                  fontWeight: 500,
                  fontSize: 15,
                  cursor: "pointer",
                  marginTop: 6,
                }}
              >
                + New training for {activeDog?.name}
              </button>
            </React.Fragment>
          ) : (
            activeDog && (
              <AnalysisView
                dog={activeDog}
                categories={dogCategories}
                entries={state.entries.filter((e) => dogCategories.some((c) => c.id === e.categoryId))}
                accent={accent}
                accentLight={accentLight}
                aiConfig={aiConfig}
                onOpenAISettings={() => setShowAISettings(true)}
              />
            )
          )}
        </React.Fragment>
      )}

      {saveFailed && (
        <p style={{ color: "#B5432E", fontSize: 13, marginTop: 12 }}>
          Couldn't save to this device's storage (it may be full or in private browsing mode). Your changes are
          showing but may not survive closing the app.
        </p>
      )}

      {showAddCategory && (
        <AddCategoryModal dogName={activeDog?.name} onClose={() => setShowAddCategory(false)} onSave={addCategory} />
      )}

      {entryModalCategory && (
        <AddEntryModal
          category={entryModalCategory}
          onClose={() => setEntryModalCategory(null)}
          onSave={(payload) => addEntry(entryModalCategory.id, payload)}
        />
      )}

      {showManageDogs && (
        <ManageDogsModal dogs={state.dogs} onClose={() => setShowManageDogs(false)} onAdd={addDog} onRename={renameDog} onDelete={deleteDog} />
      )}

      {showAISettings && (
        <AISettingsModal
          config={aiConfig}
          onClose={() => setShowAISettings(false)}
          onSave={(cfg) => {
            saveAIConfig(cfg);
            setAiConfig(cfg);
            setShowAISettings(false);
          }}
          onRemove={() => {
            clearAIConfig();
            setAiConfig(null);
            setShowAISettings(false);
          }}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
document.getElementById("root").dataset.mounted = "true";
