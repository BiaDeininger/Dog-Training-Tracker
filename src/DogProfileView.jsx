// Per-dog profile: photo, name and birthday. Uploading a photo opens
// ImageCropModal so the user picks their own circular crop, LinkedIn-style,
// instead of an automatic center-crop.

function DogProfileView({ dog, accent, accentLight, onUpdateDog }) {
  const fileInputRef = useRef(null);
  const [cropSrc, setCropSrc] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
  };

  const closeCrop = () => {
    URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const age = ageFromBirthday(dog.birthday);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 26 }}>
        <div
          onClick={() => fileInputRef.current.click()}
          role="button"
          aria-label={dog.photo ? "Change photo" : "Add photo"}
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
            {dog.photo ? "Change photo" : "Add photo"}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          style={{ display: "none" }}
        />
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

      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          onCancel={closeCrop}
          onConfirm={(dataUrl) => {
            closeCrop();
            onUpdateDog({ photo: dataUrl });
          }}
        />
      )}
    </div>
  );
}
