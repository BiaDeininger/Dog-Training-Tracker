// Top-level app: owns all state, wires the Log/Insights tabs together, and
// mounts everything into #root. Everything else in src/ is used from here.

function App() {
  const [state, setStateRaw] = useState(loadState);
  const [activeDogId, setActiveDogId] = useState(() => loadState().dogs[0]?.id || null);
  const [view, setView] = useState("log");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [entryModalCategory, setEntryModalCategory] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showManageDogs, setShowManageDogs] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [aiConfig, setAiConfig] = useState(loadAIConfig);
  const [showAISettings, setShowAISettings] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [backupMeta, setBackupMeta] = useState(loadBackupMeta);
  const [showBackupReminder, setShowBackupReminder] = useState(() => {
    const due = isBackupReminderDue(backupMeta, state.entries.length);
    if (due) recordBackupPrompted(backupMeta);
    return due;
  });
  const [drag, setDrag] = useState(null); // { id, order, startY, deltaY }
  const categoryRefs = useRef({});
  const pendingLongPress = useRef(null); // { catId, order, startX, startY, pointerId, el }
  const longPressTimer = useRef(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [celebration, setCelebration] = useState(null);
  const celebrationTimer = useRef(null);

  const showToast = (message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  const triggerCelebration = (c) => {
    clearTimeout(celebrationTimer.current);
    setCelebration(c);
    celebrationTimer.current = setTimeout(() => setCelebration(null), 3400);
  };

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
  const displayCategories = drag ? drag.order.map((id) => dogCategories.find((c) => c.id === id)) : dogCategories;

  const LONG_PRESS_MS = 450;
  const MOVE_CANCEL_PX = 8;

  const clearPendingLongPress = () => {
    clearTimeout(longPressTimer.current);
    pendingLongPress.current = null;
  };

  const onDragHandlePointerDown = (catId, e) => {
    e.preventDefault();
    pendingLongPress.current = {
      catId,
      order: dogCategories.map((c) => c.id),
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
      el: e.currentTarget,
    };
    longPressTimer.current = setTimeout(() => {
      const pending = pendingLongPress.current;
      if (!pending) return;
      try {
        pending.el.setPointerCapture(pending.pointerId);
      } catch (err) {
        // ignore — capture is a nice-to-have
      }
      if (navigator.vibrate) navigator.vibrate(12);
      setDrag({ id: pending.catId, order: pending.order, startY: pending.startY, deltaY: 0, pointerId: pending.pointerId });
      pendingLongPress.current = null;
    }, LONG_PRESS_MS);
  };

  const onDragHandlePointerMove = (e) => {
    if (drag) {
      if (e.pointerId !== undefined && drag.pointerId !== undefined && e.pointerId !== drag.pointerId) return;
      const deltaY = e.clientY - drag.startY;
      const order = drag.order;
      const idx = order.indexOf(drag.id);
      let newIdx = idx;

      if (deltaY > 0 && idx < order.length - 1) {
        const nextEl = categoryRefs.current[order[idx + 1]];
        const nextHeight = nextEl ? nextEl.offsetHeight : 60;
        if (deltaY > nextHeight / 2) newIdx = idx + 1;
      } else if (deltaY < 0 && idx > 0) {
        const prevEl = categoryRefs.current[order[idx - 1]];
        const prevHeight = prevEl ? prevEl.offsetHeight : 60;
        if (-deltaY > prevHeight / 2) newIdx = idx - 1;
      }

      if (newIdx !== idx) {
        const newOrder = [...order];
        newOrder.splice(idx, 1);
        newOrder.splice(newIdx, 0, drag.id);
        setDrag({ ...drag, order: newOrder, startY: e.clientY, deltaY: 0 });
      } else {
        setDrag({ ...drag, deltaY });
      }
      return;
    }

    const pending = pendingLongPress.current;
    if (!pending || pending.pointerId !== e.pointerId) return;
    const dx = e.clientX - pending.startX;
    const dy = e.clientY - pending.startY;
    if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) clearPendingLongPress();
  };

  const onDragHandlePointerUp = () => {
    clearPendingLongPress();
    if (!drag) return;
    reorderCategories(activeDog.id, drag.order);
    setDrag(null);
  };

  const addDog = (name) => {
    const newDog = { id: uid(), name, photo: null, birthday: null };
    const withDog = { ...state, dogs: [...state.dogs, newDog] };
    const { state: patched } = ensureCoreCategories(withDog);
    persist(patched);
    setActiveDogId(newDog.id);
  };

  const renameDog = (dogId, name) => {
    persist({ ...state, dogs: state.dogs.map((d) => (d.id === dogId ? { ...d, name } : d)) });
  };

  const updateDog = (dogId, patch) => {
    persist({ ...state, dogs: state.dogs.map((d) => (d.id === dogId ? { ...d, ...patch } : d)) });
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

  const addCategory = (payload) => {
    const newCat = { id: uid(), dogId: activeDog.id, ...payload };
    persist({ ...state, categories: [...state.categories, newCat] });
    setShowAddCategory(false);
  };

  const reorderCategories = (dogId, orderedIds) => {
    const reordered = orderedIds.map((id) => state.categories.find((c) => c.id === id));
    const otherCats = state.categories.filter((c) => c.dogId !== dogId);
    persist({ ...state, categories: [...otherCats, ...reordered] });
  };

  const updateCategory = (catId, patch) => {
    persist({ ...state, categories: state.categories.map((c) => (c.id === catId ? { ...c, ...patch } : c)) });
  };

  const deleteCategory = (catId) => {
    persist({
      ...state,
      categories: state.categories.filter((c) => c.id !== catId),
      entries: state.entries.filter((e) => e.categoryId !== catId),
    });
  };

  const addEntry = (categoryId, payload) => {
    const entry = { id: uid(), categoryId, ...payload };
    const category = state.categories.find((c) => c.id === categoryId);
    const priorEntries = state.entries.filter((e) => e.categoryId === categoryId);
    persist({ ...state, entries: [...state.entries, entry] });
    setEntryModalCategory(null);
    showToast("Session logged");
    const celebrationResult = category ? detectCelebration(category, priorEntries, entry) : null;
    if (celebrationResult) triggerCelebration(celebrationResult);
  };

  // Field/step/task ids are minted fresh per dog even for same-named trainings
  // (see coreCategoryDefs in storage.js and the templates in
  // trainingTemplates.js), so a payload built against one dog's category
  // can't be reused as-is for another dog's — its values/stepId/taskChecks
  // are keyed by ids the other dog's category doesn't have. Remap them by
  // matching label, the same way the category itself is matched by name.
  const remapPayloadForCategory = (sourceCategory, targetCategory, payload) => {
    if (targetCategory.id === sourceCategory.id) return payload;
    const sameLabel = (label) => (item) => item.label.trim().toLowerCase() === label.trim().toLowerCase();

    const values = {};
    Object.entries(payload.values || {}).forEach(([fieldId, v]) => {
      const sourceField = sourceCategory.fields.find((f) => f.id === fieldId);
      const targetField = sourceField && targetCategory.fields.find(sameLabel(sourceField.label));
      if (targetField) values[targetField.id] = v;
    });
    const next = { ...payload, values };

    if (payload.stepId) {
      const sourceStep = sourceCategory.steps?.find((s) => s.id === payload.stepId);
      const targetStep = sourceStep && targetCategory.steps?.find(sameLabel(sourceStep.label));
      if (targetStep) {
        next.stepId = targetStep.id;
        const taskChecks = {};
        Object.entries(payload.taskChecks || {}).forEach(([taskId, checked]) => {
          const sourceTask = sourceStep.tasks.find((t) => t.id === taskId);
          const targetTask = sourceTask && targetStep.tasks.find(sameLabel(sourceTask.label));
          if (targetTask) taskChecks[targetTask.id] = checked;
        });
        next.taskChecks = taskChecks;
      } else {
        delete next.stepId;
        delete next.taskChecks;
      }
    }

    return next;
  };

  // Logs the same session against several dogs at once (e.g. a walk done
  // with two dogs together), matching each other selected dog's training by
  // name since trainings are separate per-dog records. One persist() call so
  // a stale `state` closure can't drop one dog's entry when the other saves.
  const addEntryForDogs = (category, payload, dogIds) => {
    const targets = dogIds
      .map((dogId) =>
        dogId === category.dogId
          ? category
          : state.categories.find(
              (c) => c.dogId === dogId && c.name.trim().toLowerCase() === category.name.trim().toLowerCase()
            )
      )
      .filter(Boolean);

    const newEntries = targets.map((cat) => ({
      id: uid(),
      categoryId: cat.id,
      ...remapPayloadForCategory(category, cat, payload),
    }));
    persist({ ...state, entries: [...state.entries, ...newEntries] });
    setEntryModalCategory(null);

    const dogNames = targets.map((cat) => state.dogs.find((d) => d.id === cat.dogId)?.name).filter(Boolean);
    showToast(`Session logged for ${joinWithAnd(dogNames)}`);

    targets.forEach((cat, i) => {
      const priorEntries = state.entries.filter((e) => e.categoryId === cat.id);
      const celebrationResult = detectCelebration(cat, priorEntries, newEntries[i]);
      if (celebrationResult) triggerCelebration(celebrationResult);
    });
  };

  const updateEntry = (entryId, payload) => {
    persist({
      ...state,
      entries: state.entries.map((e) => (e.id === entryId ? { ...e, ...payload } : e)),
    });
    setEntryModalCategory(null);
    showToast("Changes saved");
  };

  const deleteEntry = (entryId) => {
    persist({ ...state, entries: state.entries.filter((e) => e.id !== entryId) });
  };

  const exportBackup = () => {
    downloadBackupFile(state);
    setBackupMeta(recordBackupExported(backupMeta, state.entries.length));
    setShowBackupReminder(false);
  };

  const importBackup = ({ dogs, categories, entries }) => {
    const next = { dogs, categories, entries };
    persist(next);
    setActiveDogId(next.dogs[0]?.id || null);
    setBackupMeta(recordBackupExported(backupMeta, entries.length));
    setShowBackupReminder(false);
  };

  return (
    <div
      style={{
        background: "#EEF0E7",
        minHeight: "100vh",
        padding: "18px 16px 40px",
        boxSizing: "border-box",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🐾</span>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, margin: 0, color: "#1E2B22" }}>
            Training tracker
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setShowAbout(true)}
            aria-label="About this app"
            style={{
              width: 30,
              height: 30,
              flexShrink: 0,
              padding: 0,
              borderRadius: "50%",
              border: "1px solid #D7DACB",
              background: "transparent",
              color: "#5B6459",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            ⓘ
          </button>
          {activeDog && (
            <button
              key={`avatar-${activeDog.id}-${activeDog.photo ? activeDog.photo.length : 0}`}
              onClick={() => setView("profile")}
              aria-label={`${activeDog.name}'s profile`}
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                padding: 0,
                borderRadius: "50%",
                border: `2px solid ${accent}`,
                backgroundColor: accentLight,
                backgroundImage: activeDog.photo ? `url(${activeDog.photo})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {!activeDog.photo && <span style={{ fontSize: 16 }}>🐾</span>}
            </button>
          )}
        </div>
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
                  {d.photo && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundImage: `url(${d.photo})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        marginRight: 7,
                        verticalAlign: "middle",
                      }}
                    />
                  )}
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

          {view === "profile" ? (
            activeDog && (
              <DogProfileView
                dog={activeDog}
                accent={accent}
                accentLight={accentLight}
                onUpdateDog={(patch) => updateDog(activeDog.id, patch)}
                categories={dogCategories}
                entries={state.entries.filter((e) => dogCategories.some((c) => c.id === e.categoryId))}
              />
            )
          ) : view === "log" ? (
            <React.Fragment>
              {dogCategories.length === 0 && (
                <p style={{ color: "#5B6459", fontSize: 14, marginBottom: 16 }}>
                  No trainings set up for {activeDog?.name} yet. Add one below to start logging sessions.
                </p>
              )}
              {displayCategories.map((cat) => (
                <div
                  key={cat.id}
                  ref={(el) => (categoryRefs.current[cat.id] = el)}
                  style={
                    drag && drag.id === cat.id
                      ? {
                          position: "relative",
                          zIndex: 10,
                          transform: `translateY(${drag.deltaY}px)`,
                          boxShadow: "0 8px 20px rgba(30,43,34,0.2)",
                          borderRadius: 14,
                        }
                      : undefined
                  }
                >
                  <CategoryCard
                    category={cat}
                    entries={state.entries.filter((e) => e.categoryId === cat.id)}
                    accent={accent}
                    accentLight={accentLight}
                    onAddEntry={() => {
                      setEntryModalCategory(cat);
                      setEditingEntry(null);
                    }}
                    onEditEntry={(entry) => {
                      setEntryModalCategory(cat);
                      setEditingEntry(entry);
                    }}
                    onDeleteEntry={deleteEntry}
                    onDeleteCategory={() => deleteCategory(cat.id)}
                    onEditCategory={() => setEditingCategory(cat)}
                    onUpdateIcon={(icon) => updateCategory(cat.id, { icon })}
                    dragHandleProps={{
                      onPointerDown: (e) => onDragHandlePointerDown(cat.id, e),
                      onPointerMove: onDragHandlePointerMove,
                      onPointerUp: onDragHandlePointerUp,
                      onPointerCancel: onDragHandlePointerUp,
                    }}
                  />
                </div>
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
                key={activeDog.id}
                dog={activeDog}
                categories={dogCategories}
                entries={state.entries.filter((e) => dogCategories.some((c) => c.id === e.categoryId))}
                accent={accent}
                accentLight={accentLight}
                aiConfig={aiConfig}
                onOpenAISettings={() => setShowAISettings(true)}
                onLogCategory={(cat) => {
                  setEntryModalCategory(cat);
                  setEditingEntry(null);
                }}
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

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          entries={state.entries.filter((e) => e.categoryId === editingCategory.id)}
          onClose={() => setEditingCategory(null)}
          onSave={(patch) => {
            updateCategory(editingCategory.id, patch);
            setEditingCategory(null);
            showToast("Training updated");
          }}
        />
      )}

      {entryModalCategory && (
        <AddEntryModal
          category={entryModalCategory}
          entry={editingEntry}
          categoryEntries={state.entries.filter((e) => e.categoryId === entryModalCategory.id)}
          dogs={state.dogs}
          dogAccents={dogAccents}
          allCategories={state.categories}
          onClose={() => {
            setEntryModalCategory(null);
            setEditingEntry(null);
          }}
          onSave={(payload, dogIds) => {
            if (editingEntry) updateEntry(editingEntry.id, payload);
            else if (dogIds && dogIds.length > 1) addEntryForDogs(entryModalCategory, payload, dogIds);
            else addEntry(entryModalCategory.id, payload);
            setEditingEntry(null);
          }}
        />
      )}

      {showManageDogs && (
        <ManageDogsModal
          dogs={state.dogs}
          onClose={() => setShowManageDogs(false)}
          onAdd={addDog}
          onRename={renameDog}
          onDelete={deleteDog}
          lastBackupAt={backupMeta.lastBackupAt}
          onExport={exportBackup}
          onImport={importBackup}
        />
      )}

      {showBackupReminder && <BackupReminderModal onExport={exportBackup} onDismiss={() => setShowBackupReminder(false)} />}

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

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

      <Celebration celebration={celebration} />

      {toast && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            background: "#1E2B22",
            color: "#FFFFFF",
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            zIndex: 60,
            pointerEvents: "none",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
document.getElementById("root").dataset.mounted = "true";
