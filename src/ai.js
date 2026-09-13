// Talking to Google's Gemini API for the optional "AI notes analysis" feature.
// See AISettingsModal (src/AISettingsModal.jsx) for how the key is collected and stored.
// Gemini is the only provider offered here: it's the only major model API with a
// genuinely free tier (no credit card, no trial period that expires) — see
// aistudio.google.com/apikey. Claude and ChatGPT keys are paid from the first call,
// so they're not worth the setup for this app.

const DEFAULT_MODEL = "gemini-flash-latest";
const GEMINI_KEY_URL = "aistudio.google.com/apikey";

// This app has no server, so there's nowhere else to keep the key: it lives in this
// browser's storage and every request goes straight from here to Google.
// Key goes in a header, not the query string: URLs get written to browser history
// and server logs in a way that request headers don't. The model name is encoded
// because it comes from a free-text field, and a stray "?" or "#" in it would
// otherwise change what URL we actually request.
async function callAIProvider({ apiKey, model }, prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model || DEFAULT_MODEL)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Gemini API error (${res.status})`);
  return (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text).join("") || "";
}
