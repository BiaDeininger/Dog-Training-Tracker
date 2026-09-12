# Dog Training Tracker

A private, installable web app for logging and tracking dog training sessions — trends, notes, and optional AI-powered insights. No account, no server, no shared data between users.

---

## For a friend: how to install it

1. **Open the app link** in your phone's browser (Safari on iPhone, Chrome on Android):
   'https://biadeininger.github.io/Dog-Training-Tracker/'

2. **Add it to your home screen:**
   - **iPhone (Safari):** tap the Share icon → **Add to Home Screen**
   - **Android (Chrome):** tap the menu (⋮) → **Add to Home Screen** / **Install app**

3. Open the new icon from your home screen — it launches full-screen, like a normal app.

4. **Add your dog:** tap **"Add your first dog"**, give it a name. Two starter trainings (*Loose leash walking*, *New places*) are added automatically — add as many more as you like with **"+ New training"**.

That's it. No sign-up, no login.

### Your data is private and local

Everything you log is saved only in your own phone's browser storage. It is not sent anywhere, not synced, and not visible to anyone else using this same app link — including whoever shared it with you. If you clear your browser's site data or switch phones, you'll need to export/re-enter your data (there's currently no cloud backup).

### Optional: AI notes analysis

In the **Insights** tab, under "Notes insights," you can connect your *own* API key from Claude, Gemini, or ChatGPT to get automatic pattern-spotting from your free-text notes. This is entirely optional — everything else works without it. Your key is stored only on your device and sent directly to that provider, never through this app's code or repo.

Get a key at:
- Claude: console.anthropic.com/settings/keys
- Gemini (has a free tier): aistudio.google.com/apikey
- ChatGPT: platform.openai.com/api-keys

---

## For contributors: suggesting changes

Found a bug or have an improvement idea? Pull requests welcome.

1. **Fork** this repository (top-right button on GitHub).
2. Make your changes — the whole app lives in `index.html` (plain HTML + React, no build step). `manifest.json` and the icon files rarely need touching.
3. Commit your changes and **open a Pull Request** back to this repo, describing what you changed and why.
4. The repo owner will review and merge if it looks good.

Once merged, the live app updates automatically — no need to reinstall or do anything on your phone. Since the app always loads fresh from the web (it doesn't cache an offline copy), you'll see the update the next time you open it with an internet connection.

### Project structure

```
index.html      — the entire app (UI, logic, storage) in one file
manifest.json   — home-screen app metadata (name, icons, colors)
icon-192.png    — home screen icon (small)
icon-512.png    — home screen icon (large)
```

No build tools, no dependencies to install, no backend. Data lives entirely in each visitor's own browser (`localStorage`), which is why there's no login and no multi-device sync.

---

## Known limitations

- **No cross-device sync** — data is tied to one browser on one device.
- **No cloud backup** — clearing browser data or site storage loses your entries.
- **AI notes analysis requires your own API key** — this app doesn't provide one.
