// Per-dog profile: photo, name and birthday. Uploading a photo downscales it
// to a stable "original" and opens ImageCropModal for a manual circular crop,
// LinkedIn-style. Both the downscaled original and the chosen zoom/position
// are kept (not just the baked circular crop), so tapping the photo again
// reopens the cropper showing the exact same selection — no re-upload needed
// to nudge or re-zoom it. Dogs whose photo predates this (no photoOriginal
// saved) just fall back to picking a file, same as before.

const ORIGINAL_MAX_DIMENSION = 1200;

function resizeImageFile(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function DogProfileView({ dog, accent, accentLight, onUpdateDog }) {
  const fileInputRef = useRef(null);
  const [cropSession, setCropSession] = useState(null);
  const [resizeError, setResizeError] = useState(false);

  const canAdjustCrop = !!(dog.photo && dog.photoOriginal);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setResizeError(false);
    try {
      const dataUrl = await resizeImageFile(file, ORIGINAL_MAX_DIMENSION, 0.88);
      setCropSession({ src: dataUrl });
    } catch (err) {
      setResizeError(true);
    }
  };

  const openPhoto = () => {
    if (!canAdjustCrop) {
      fileInputRef.current.click();
      return;
    }
    setCropSession({ src: dog.photoOriginal, initialZoom: dog.photoCrop?.zoom, initialPos: dog.photoCrop?.pos });
  };

  const closeCrop = () => setCropSession(null);

  const age = ageFromBirthday(dog.birthday);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 26 }}>
        <div
          onClick={openPhoto}
          role="button"
          aria-label={dog.photo ? (canAdjustCrop ? "Adjust photo crop" : "Change photo") : "Add photo"}
          style={{
            width: 148,
            height: 148,
            borderRadius: "50%",
            background: dog.photo ? `url(${dog.photo})` : accentLight,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: `3px solid ${accent}`,
            cursor: "pointer",
            marginBottom: 10,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!dog.photo && <span style={{ fontSize: 46 }}>🐾</span>}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(30,43,34,0.65)",
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: 500,
              textAlign: "center",
              padding: "5px 0",
            }}
          >
            {dog.photo ? (canAdjustCrop ? "Adjust crop" : "Change photo") : "Add photo"}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          style={{ display: "none" }}
        />
        {resizeError && (
          <p style={{ color: "#B5432E", fontSize: 12, marginTop: 2 }}>Couldn't read that image. Try another one.</p>
        )}
        {canAdjustCrop && (
          <button
            onClick={() => fileInputRef.current.click()}
            style={{
              border: "none",
              background: "transparent",
              color: "#8B8F7F",
              fontSize: 12,
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
              marginTop: 8,
            }}
          >
            Use a different photo
          </button>
        )}

        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, margin: "6px 0 2px", color: "#1E2B22" }}>
          {dog.name}
        </h2>
        {age && <p style={{ color: "#5B6459", fontSize: 14, margin: 0 }}>{age}</p>}
      </div>

      <label style={labelStyle}>Birthday</label>
      <input
        type="date"
        style={inputStyle}
        value={dog.birthday || ""}
        max={todayStr()}
        onChange={(e) => onUpdateDog({ birthday: e.target.value || null })}
      />
      {!dog.birthday && (
        <p style={{ color: "#8B8F7F", fontSize: 12, marginTop: 6 }}>
          Add a birthday to see {dog.name}'s age here.
        </p>
      )}

      {cropSession && (
        <ImageCropModal
          src={cropSession.src}
          initialZoom={cropSession.initialZoom}
          initialPos={cropSession.initialPos}
          onCancel={closeCrop}
          onConfirm={(croppedDataUrl, transform) => {
            closeCrop();
            onUpdateDog({ photo: croppedDataUrl, photoOriginal: cropSession.src, photoCrop: transform });
          }}
        />
      )}
    </div>
  );
}
