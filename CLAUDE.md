# Dog Training Tracker

Static, no-build web app. React + Babel Standalone loaded straight in
`index.html` via CDN `<script>` tags — no `package.json`, no `npm install`,
no bundler. Data lives in the browser's `localStorage`; there is no backend.

## Before opening a pull request

Every PR must be manually verified working in a browser before it's opened,
not just written and assumed correct — this app has no automated test
suite, so this is the only check that happens before a human reviews it.

1. Serve the app locally (e.g. `python3 -m http.server` in the repo root)
   and open it in a real or headless browser (the `run` skill can drive
   this). A syntax check or a read-through of the diff is not sufficient.
2. Actually exercise the specific feature or fix the PR changes — click
   through the golden path, not just load the page.
3. Check at least one adjacent flow that touches the same file(s), since a
   change to a shared component (`App.jsx`, `storage.js`, `ui.jsx`, etc.)
   can silently break something the PR wasn't about.
4. Check the browser console for errors during that walkthrough.
5. If something can't be tested this way (e.g. it needs a real iOS PWA
   install), say so explicitly in the PR description instead of claiming
   it was tested.

## Working alongside other sessions

Multiple Claude Code sessions may be working in this repo at once, each on
its own branch. Two branches touching unrelated files can merge in any
order with no issue. If a PR is behind `main` when you're about to open or
update it, or another PR you know is in flight touches the same files,
update against `main` first and resolve any conflict rather than leaving
it for the human to sort out at merge time.

## No paid dependencies

Keep this project's tooling free. Don't add a service, API, or GitHub
Action that requires a paid API key (e.g. the Anthropic API) without
asking first — CI/testing changes should run on GitHub's free Actions
minutes only.
