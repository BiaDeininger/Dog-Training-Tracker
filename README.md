# Dog Training Tracker

A private, installable web app for logging and tracking dog training sessions — trends, notes, and optional AI-powered insights. No account, no server, no shared data between users.

---

## For friends: how to install it

1. **Open the app link** in your phone's browser (Safari on iPhone, Chrome on Android):
   [biadeininger.github.io/Dog-Training-Tracker](https://biadeininger.github.io/Dog-Training-Tracker/)

2. **Add it to your home screen:**
   - **iPhone (Safari):** tap the Share icon → **Add to Home Screen**
   - **Android (Chrome):** tap the menu (⋮) → **Add to Home Screen** / **Install app**

3. Open the new icon from your home screen — it launches full-screen, like a normal app.

4. **Add your dog:** tap **"Add your first dog"**, give it a name. Two starter trainings (*Loose leash walking*, *New places*) are added automatically — add as many more as you like with **"+ New training"**.

That's it. No sign-up, no login.

### Your data is private and local

Everything you log is saved only in your own phone's browser storage. It is not sent anywhere, not synced, and not visible to anyone else using this same app link — including whoever shared it with you. If you clear your browser's site data or switch phones, that data is gone unless you've exported a backup first.

### Backing up and restoring your data

Under **Manage dogs**, there's a **Backup your data** section:

- **Export backup** downloads a `.json` file with all your dogs, trainings and logged sessions.
- **Import backup** loads one of those files back in, replacing whatever is currently on the device.

The app will also pop up a reminder to back up every couple of weeks, or after every 10th session you log, if you haven't exported recently. There's still no cloud sync — you're responsible for keeping that exported file somewhere safe (email it to yourself, save it to cloud storage, etc.) and re-importing it after clearing data or setting up a new phone.

### Optional: AI notes analysis

In the **Insights** tab, under "Notes insights," you can connect your *own* free Google Gemini API key to get automatic pattern-spotting from your free-text notes. This is entirely optional — everything else works without it. Your key is stored only on your device and sent directly to Google, never through this app's code or repo.

Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — sign in with any Google account, click "Create API key," no credit card required. Each person using this app (e.g. you and a training partner) gets their own free key on their own device.

---

## For contributors: suggesting changes

Found a bug or have an improvement idea? Pull requests welcome.

1. **Branch or fork** this repository.
2. Make your changes — see "Project structure" below for where things live. It's plain HTML + React (JSX) with no build step — edit a file, open `index.html` in a browser, done.
3. Commit your changes and **open a Pull Request** back to this repo, describing what you changed and why.
4. The repo owner will review and merge if it looks good.

Once merged, the live app updates automatically — no need to reinstall or do anything on your phone. Since the app always loads fresh from the web (it doesn't cache an offline copy), you'll see the update the next time you open it with an internet connection.

If your change touches any file under `src/` or `style.css`, bump the `?v=N` number on every `<script>`/`<link>` tag in `index.html` that loads them. Without that, browsers (and GitHub Pages' own CDN) can keep serving an old cached copy of those files for a while after the new version is live.

### Project structure

```
index.html                 — page shell: loads style.css and the src/ files in order
style.css                  — all styling
manifest.json              — home-screen app metadata (name, icons, colors)
icon-192.png, icon-512.png — home screen icons

src/storage.js             — localStorage read/write, seed data for new dogs
src/ai.js                  — calls to the Gemini API for notes analysis
src/utils.js               — date/trend helpers, shared style constants
src/ui.jsx                 — small reusable bits: ScalePicker, Modal, MiniChart, TrendArrow
src/CategoryCard.jsx       — one training's card on the Log tab
src/AddCategoryModal.jsx   — "new training" form
src/AddEntryModal.jsx      — "log a session" form
src/AISettingsModal.jsx    — Gemini API key setup
src/ManageDogsModal.jsx    — add/rename/delete dogs, backup export/import
src/BackupReminderModal.jsx — periodic "back up your data" reminder popup
src/AboutModal.jsx         — "About this app" info panel (data storage, backup, repo link)
src/AnalysisView.jsx       — the Insights tab
src/App.jsx                — top-level app state and layout; mounts the app
```

Each `src/` file is loaded as its own `<script type="text/babel">` tag in `index.html`, in that order — no bundler, no `npm install`, just files a browser can run directly (a small library, Babel, turns the JSX into normal JavaScript at load time). Files later in the list can use anything defined in earlier ones.

No build tools, no dependencies to install, no backend. Data lives entirely in each visitor's own browser (`localStorage`), which is why there's no login and no multi-device sync.

---

## Known limitations

- **No cross-device sync** — data is tied to one browser on one device.
- **No automatic cloud backup** — clearing browser data or site storage loses your entries unless you've exported a backup file (see "Backing up and restoring your data" above) and re-import it.
- **AI notes analysis requires your own free Gemini API key** — this app doesn't provide one.
