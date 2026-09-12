// A LinkedIn-style circular photo cropper: drag the image to reposition it,
// use the slider to zoom, then bake the visible circle into a fixed-size
// square image. It's stored and displayed as a square everywhere else in the
// app (the header avatar, dog chips, the profile photo) via CSS border-radius,
// so baking a literal circular alpha mask here isn't necessary.

const CROP_SIZE = 260;
const OUTPUT_SIZE = 480;

function ImageCropModal({ src, onCancel, onConfirm }) {
  const [natural, setNatural] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [loadError, setLoadError] = useState(false);
  const dragRef = useRef(null);
  const imgElRef = useRef(null);

  const clampPos = (p, scale) => {
    if (!natural) return p;
    const dispW = natural.width * scale;
    const dispH = natural.height * scale;
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
    const bs = Math.max(CROP_SIZE / width, CROP_SIZE / height);
    setNatural({ width, height });
    setPos({ x: (CROP_SIZE - width * bs) / 2, y: (CROP_SIZE - height * bs) / 2 });
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos(clampPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy }, scale));
  };
  const onPointerUp = () => {
    dragRef.current = null;
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
    onConfirm(canvas.toDataURL("image/jpeg", 0.85));
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
        {loadError ? "Couldn't load that image. Try another one." : "Drag to reposition, use the slider to zoom"}
      </p>

      {!loadError && (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
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
          min="1"
          max="3"
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
