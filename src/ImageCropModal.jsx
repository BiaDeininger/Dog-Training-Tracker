// A LinkedIn-style circular photo cropper: drag the image to reposition it,
// pinch with two fingers (or use the slider) to zoom, then bake the visible
// circle into a fixed-size square image. It's stored and displayed as a
// square everywhere else in the app (the header avatar, dog chips, the
// profile photo) via CSS border-radius, so baking a literal circular alpha
// mask here isn't necessary.
//
// `initialZoom`/`initialPos` let a caller reopen this on a photo that was
// already cropped once, showing the same selection instead of resetting it,
// so re-adjusting doesn't require re-uploading the file.

const CROP_SIZE = 260;
const OUTPUT_SIZE = 480;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

function ImageCropModal({ src, initialZoom, initialPos, onCancel, onConfirm }) {
  const [natural, setNatural] = useState(null);
  const [zoom, setZoom] = useState(initialZoom || 1);
  const [pos, setPos] = useState(initialPos || { x: 0, y: 0 });
  const [loadError, setLoadError] = useState(false);
  const containerRef = useRef(null);
  const imgElRef = useRef(null);
  const pointersRef = useRef(new Map());
  const gestureRef = useRef(null);

  const clampPos = (p, s) => {
    if (!natural) return p;
    const dispW = natural.width * s;
    const dispH = natural.height * s;
    return {
      x: Math.min(0, Math.max(CROP_SIZE - dispW, p.x)),
      y: Math.min(0, Math.max(CROP_SIZE - dispH, p.y)),
    };
  };

  const baseScale = natural ? Math.max(CROP_SIZE / natural.width, CROP_SIZE / natural.height) : 1;
  const scale = baseScale * zoom;

  const handleImgLoad = (e) => {
    const width = e.target.naturalWidth;
    const height = e.target.naturalHeight;
    setNatural({ width, height });
    if (!initialPos) {
      const bs = Math.max(CROP_SIZE / width, CROP_SIZE / height);
      setPos({ x: (CROP_SIZE - width * bs) / 2, y: (CROP_SIZE - height * bs) / 2 });
    }
  };

  const toLocal = (clientX, clientY) => {
    const r = containerRef.current.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const beginGesture = () => {
    const pts = Array.from(pointersRef.current.values());
    if (pts.length === 1) {
      gestureRef.current = { mode: "drag", start: pts[0], origPos: pos };
    } else if (pts.length === 2) {
      const [a, b] = pts;
      gestureRef.current = {
        mode: "pinch",
        startDist: Math.hypot(b.x - a.x, b.y - a.y) || 1,
        startMid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        origZoom: zoom,
        origPos: pos,
      };
    } else {
      gestureRef.current = null;
    }
  };

  const onPointerDown = (e) => {
    if (!natural) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore — capture is a nice-to-have, not required for tracking
    }
    pointersRef.current.set(e.pointerId, toLocal(e.clientX, e.clientY));
    beginGesture();
  };

  const onPointerMove = (e) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, toLocal(e.clientX, e.clientY));
    const g = gestureRef.current;
    if (!g) return;

    if (g.mode === "drag") {
      const p = pointersRef.current.get(e.pointerId);
      const dx = p.x - g.start.x;
      const dy = p.y - g.start.y;
      setPos(clampPos({ x: g.origPos.x + dx, y: g.origPos.y + dy }, scale));
    } else if (g.mode === "pinch") {
      const pts = Array.from(pointersRef.current.values());
      if (pts.length < 2) return;
      const [a, b] = pts;
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, g.origZoom * (dist / g.startDist)));
      const newScale = baseScale * newZoom;
      const origScale = baseScale * g.origZoom;
      // Keep whatever image point was under the fingers at gesture start
      // anchored under them as zoom/position change together.
      const imgPoint = {
        x: (g.startMid.x - g.origPos.x) / origScale,
        y: (g.startMid.y - g.origPos.y) / origScale,
      };
      setZoom(newZoom);
      setPos(clampPos({ x: mid.x - imgPoint.x * newScale, y: mid.y - imgPoint.y * newScale }, newScale));
    }
  };

  const endPointer = (e) => {
    pointersRef.current.delete(e.pointerId);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
      // already released
    }
    beginGesture();
  };

  const handleZoomChange = (next) => {
    setZoom(next);
    setPos((p) => clampPos(p, baseScale * next));
  };

  const handleConfirm = () => {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const sourceSize = CROP_SIZE / scale;
    canvas
      .getContext("2d")
      .drawImage(imgElRef.current, -pos.x / scale, -pos.y / scale, sourceSize, sourceSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    onConfirm(canvas.toDataURL("image/jpeg", 0.85), { zoom, pos });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,26,18,0.88)",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <p style={{ color: "#FFFFFF", fontSize: 14, marginBottom: 16, fontWeight: 500, textAlign: "center" }}>
        {loadError ? "Couldn't load that image. Try another one." : "Drag to reposition, pinch or use the slider to zoom"}
      </p>

      {!loadError && (
        <div
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          style={{
            width: CROP_SIZE,
            height: CROP_SIZE,
            borderRadius: "50%",
            overflow: "hidden",
            position: "relative",
            touchAction: "none",
            cursor: "grab",
            background: "#1E2B22",
            boxShadow: "0 0 0 3000px rgba(0,0,0,0.65)",
          }}
        >
          <img
            ref={imgElRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={handleImgLoad}
            onError={() => setLoadError(true)}
            style={
              natural
                ? {
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    width: natural.width * scale,
                    height: natural.height * scale,
                    maxWidth: "none",
                    userSelect: "none",
                    pointerEvents: "none",
                  }
                : { display: "none" }
            }
          />
        </div>
      )}

      {natural && !loadError && (
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step="0.01"
          value={zoom}
          onChange={(e) => handleZoomChange(Number(e.target.value))}
          style={{ width: CROP_SIZE, marginTop: 22 }}
          aria-label="Zoom"
        />
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        <button
          onClick={onCancel}
          style={{
            border: "1px solid #FFFFFF",
            background: "transparent",
            color: "#FFFFFF",
            fontWeight: 500,
            fontSize: 14,
            borderRadius: 8,
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        {!loadError && (
          <button
            onClick={handleConfirm}
            disabled={!natural}
            style={{
              border: "none",
              background: "#FFFFFF",
              color: "#1E2B22",
              fontWeight: 500,
              fontSize: 14,
              borderRadius: 8,
              padding: "10px 18px",
              cursor: natural ? "pointer" : "default",
              opacity: natural ? 1 : 0.6,
            }}
          >
            Use photo
          </button>
        )}
      </div>
    </div>
  );
}
