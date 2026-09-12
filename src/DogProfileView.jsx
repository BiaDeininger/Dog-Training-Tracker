// Per-dog profile: photo, name and birthday. Photos are downscaled client-side
// before being stored so they don't blow past localStorage's size limits.

const { useRef } = React;

const MAX_PHOTO_DIMENSION = 480;

function readAndResizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_PHOTO_DIMENSION) {
          height = Math.round((height * MAX_PHOTO_DIMENSION) / width);
          width = MAX_PHOTO_DIMENSION;
        } else if (height > MAX_PHOTO_DIMENSION) {
          width = Math.round((width * MAX_PHOTO_DIMENSION) / height);
          height = MAX_PHOTO_DIMENSION;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function DogProfileView({ dog, accent, accentLight, onUpdateDog }) {
  const fileInputRef = useRef(null);
  const [photoError, setPhotoError] = useState(false);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError(false);
    try {
      const dataUrl = await readAndResizeImage(file);
      onUpdateDog({ photo: dataUrl });
    } catch (err) {
      setPhotoError(true);
    }
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
        {photoError && (
          <p style={{ color: "#B5432E", fontSize: 12, marginTop: 2 }}>Couldn't read that image. Try another one.</p>
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
    </div>
  );
}
