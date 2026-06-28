# design-sync notes — myautospace-frontend

## Environment / upload
- **Uploaded 2026-06-27** to a fresh Claude Design project **"MyAutoSpace"**,
  `projectId 28565c40-9937-4343-9e36-c943a3a9263a` (pinned in config.json). Running
  `/design-login` in this terminal granted the design-system scopes the earlier run lacked.
- The project is now **non-empty + anchored** (`_ds_sync.json` uploaded), so future runs are
  **re-syncs on the atomic path** (build the final bundle, then upload in one pass at the end;
  fetch the remote `_ds_sync.json` → `.design-sync/.cache/remote-sync.json` and run `resync.mjs
  --remote …`). See the base skill "Re-syncs are one command".
- Prior history: the first build (also 2026-06-27) was **local-only** because that terminal had
  no design auth; it produced `ds-bundle/` but never uploaded. This run re-built + uploaded it.

## Repo shape
- This is a **Vite React application**, not a published component library: plain `.jsx`
  (no TypeScript, no `dist/` library entry, no `.d.ts` exports). The converter runs in
  **synth-entry mode** (scans `src/` for PascalCase exports). `.d.ts` contracts are weak by
  consequence — props interfaces are best-effort.
- Package manager: npm (`package-lock.json`).

## Scope (per user: exclude homepage, login, register)
- `srcDir` is pinned to `src/components/app` so the scan covers the reusable app components
  (the `ui.jsx` primitives, `VehicleCard`, and the shared widgets) and NOT the landing
  sections / pages / auth screens.
- `Brand` (`src/components/Brand.jsx`) and `Icon` (`src/lib/Icon.jsx`) are added via
  `componentSrcMap` since they live outside `srcDir`.
- Data/API-backed widgets (LocationPanel, MediaUpload/UploadButton/EntityGallery,
  ReviewsSection, ContactButton, AppNav) need live auth + the gateway API and cannot render
  statically — they ship in the bundle but as **floor cards** (functional, no rich preview).

## Provider
- `.design-sync/preview-provider.jsx` wraps previews in `MemoryRouter` (for `<Link>`) +
  `UIProvider` (for `useUI`: translations `t`, theme tokens). Exposed via `extraEntries` and
  pointed at by `cfg.provider.component = "DesignPreviewProvider"`.

## Styling
- The whole design system is one file: `src/index.css` ("liquid glass"). `cssEntry` points at it.
- Fonts load remotely from Google Fonts (Bricolage Grotesque, Hanken Grotesk, Plus Jakarta
  Sans, Sora) via `<link>` in `index.html` — expect `[FONT_REMOTE]`/runtime, not shipped woff2.

## Build / render setup (repro)
- Self-package junction is required so the converter resolves the package: create
  `node_modules/myautospace-frontend` → repo root (junction). Recreate per clone:
  `node -e "fs.symlinkSync(cwd, 'node_modules/myautospace-frontend','junction')"`.
- Render check uses **system Chrome** (no 200MB download): install only the playwright JS
  (`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i playwright` in `.ds-sync`) and run validate with
  `DS_CHROMIUM_PATH="/c/Program Files/Google/Chrome/Application/chrome.exe"`.
- Brand/Icon/UIProvider live outside `srcDir`; they're merged onto the global via
  `extraEntries` → `.design-sync/ds-extras.jsx` (importable, no preview cards).
- Fonts: `.design-sync/ds-fonts.css` (Google Fonts @import) is added via `tokensGlob`, and the
  4 families are declared in `cfg.runtimeFontPrefixes` so `[FONT_MISSING]` is suppressed (the
  app loads them remotely too).

## Known render warns (benign — re-syncs should not treat as new)
- `[RENDER_THIN] Stars` — Stars renders SVG star glyphs only (no text), so the text-based thin
  heuristic trips. Confirmed via `_screenshots/general__Stars.png` (5 / 3.5 / 2 stars render
  correctly). Benign.

## Status (2026-06-27 upload run)
- `package-build.mjs` + `package-validate.mjs` both exit 0. **18 components uploaded**: 12 with
  authored previews (all cells captured + graded `good` from `_screenshots/review/`), 5 auto-render
  their empty/loading state (ContactButton, EntityGallery, LocationPanel, ReviewsSection,
  UploadButton — they need a live session/API for a richer preview), and **1 true floor card**
  (`AppNav` — its root comes up empty without a live session). `render-check.json`: total 18,
  bad 0, thin 1 (Stars, benign — see below), floorCards 1.
- Grades live in `.design-sync/.cache/review/*.grade.json` (gitignored); durable carry-forward is
  the uploaded `_ds_sync.json` sourceKeys, so the next sync skips re-grading unchanged components.

## Re-sync risks
- Synth-entry mode is sensitive to where components export from; if files move, update
  `srcDir`/`ds-extras.jsx`/`previews/`.
- `AppNav` and the data widgets render empty/loading without a stubbed API/auth/session; richer
  previews need a mock data provider (deliberately deferred).
- `.design-sync/ds-fonts.css` pins a Google Fonts URL — if the app's font set changes, update it.
- `projectId` is pinned (see Environment) — re-syncs go to the same project on the atomic path.
  The 5 auto-render widgets + `AppNav` floor card are the standing offer for incremental authoring
  (write `previews/<Name>.tsx`) on any later sync; they'd need a mock UIProvider auth/session +
  stubbed gateway API to render meaningfully.
