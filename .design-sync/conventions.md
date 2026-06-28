# MyAutoSpace design system

React + CSS design system for a **Tunisian vehicle marketplace** — "liquid glass" aesthetic, bilingual copy (French default, English), Dinar (DT) pricing. Components are imported from `window.MyAutoSpaceDS.*`.

## Roles — who uses which screens

The app has four JWT roles. Build role-appropriate screens and gate role-only UI on the role:

- **Buyer** — browse & search vehicles, vehicle detail, request a test-drive (for-sale) or rental (for-rent), wallet & payments, real-time messages, write reviews, profile.
- **Seller** — everything a Buyer has **plus** "My garage" (own listings), the create/edit listing form, incoming booking requests to confirm/decline, and responding to reviews.
- **ServiceProvider** — manage a provider profile (services, weekly availability, gallery) shown in the Providers directory; respond to reviews.
- **Admin** — back-office only: users, content moderation, payments overview, audit log, settings, reports. Hide this entirely from non-admins.

Show the "Sell" / "My garage" actions only for **Seller**, "My services" only for **ServiceProvider**, and "Admin" only for **Admin** (see `AppNav`).

## Wrapping & setup (required — components read context)

Wrap every screen in **`UIProvider`** (gives `useUI` → translations `t`, current language, and applies the theme via `data-theme` on `<html>`) **and a react-router Router** (`VehicleCard`, `Brand`, `AppNav` use `<Link>`/`useNavigate` and throw without one). `VehicleCard`, `AppNav`, `ReviewsSection`, `ContactButton`, `LocationPanel`, `UploadButton`, and `EntityGallery` all call `useUI` — outside `UIProvider` they error or render unstyled. `DesignPreviewProvider` bundles Router + `UIProvider` + auth context in one if you don't already have a Router.

```jsx
const { UIProvider, VehicleCard, PageHead } = window.MyAutoSpaceDS
<BrowserRouter><UIProvider>
  <PageHead title="Trouvez votre prochain véhicule" sub="Annonces vérifiées" />
  <div className="cards-grid">
    <VehicleCard vehicle={vehicle} />
  </div>
</UIProvider></BrowserRouter>
```

## Styling idiom: CSS classes + design tokens (NOT style props)

Components take **no style props** — style with the DS's own class vocabulary and `var(--*)` tokens. Read the bound **`styles.css`** (which `@import`s `_ds_bundle.css` — the whole system) before styling. Core classes:

| Family | Names |
|---|---|
| Buttons | `.btn` + `.btn-primary` / `.btn-ghost` / `.btn-danger`; sizes `.btn-sm` / `.btn-lg` |
| Surfaces | `.glass`, `.glass-card`, `.panel` |
| Forms | `.input`, `.field-row`, `.form-actions`, `.field-label` |
| Layout | `.cards-grid`, `.page-narrow`, `.spec-grid` |
| Chips / segmented | `.chip` (with `data-tone`), `.seg` |

Tokens (`var(--…)`): **`--accent`** (racing green `#1a6450` light / `#5cb692` dark — **reserved for meaning**: trust/verified, links, focus, selected states — never decoration), `--bg`, `--surface`, `--text`, `--dim`, `--faint`, `--ink`, `--btn-bg`, `--glass-border`, radii `--r-md` / `--r-lg`, `--font-display`. Dark mode is `data-theme="dark"` on `<html>` (`UIProvider` manages it). The palette is monochrome ink/porcelain — **no colored glows, gradient bands, or marquees**.

## Where the truth lives

- The bound `styles.css` + its `@import "_ds_bundle.css"` — the entire design system (tokens, classes, motion keyframes).
- Per-component `<Name>.prompt.md` and `<Name>.d.ts`. Note: this is plain JSX (no TypeScript), so the prop types are intentionally thin — **compose by example** (the preview cards) rather than trusting the `.d.ts`.
