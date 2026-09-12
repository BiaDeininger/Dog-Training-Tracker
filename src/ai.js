// Talking to whichever AI provider the user connected their own key for.
// See AISettingsModal (src/modals.jsx) for how the key is collected and stored.

const DEFAULT_MODELS = {
  anthropic: "claude-haiku-4-5-20251001",
  gemini: "gemini-flash-latest",
  openai: "gpt-4o-mini",
};

const PROVIDER_LABELS = {
  anthropic: "Claude (Anthropic)",
  gemini: "Gemini (Google)",
  openai: "ChatGPT (OpenAI)",
};

const PROVIDER_KEY_URLS = {
  anthropic: "console.anthropic.com/settings/keys",
  gemini: "aistudio.google.com/apikey",
  openai: "platform.openai.com/api-keys",
};

// This app has no server, so there's nowhere else to keep the key: it lives in this
// browser's storage and every request goes straight from here to the provider.
// Anthropic blocks browser calls unless a request opts in with this header, which
// exists specifically for BYOK apps like this one — it's not a workaround.
async function callAIProvider({ provider, apiKey, model }, prompt) {
  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: 700,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || `Claude API error (${res.status})`);
    return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n\n");
  }

  if (provider === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || `Gemini API error (${res.status})`);
    return (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text).join("") || "";
  }

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || `OpenAI API error (${res.status})`);
    return data?.choices?.[0]?.message?.content || "";
  }

  throw new Error("Unknown provider");
}
