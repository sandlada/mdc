# @sandlada/mdc-docs

Official documentation site for `@sandlada/mdc`, built with Astro.

It consumes the library **directly from `packages/mdc/src/`** (Vite alias) - no
pre-build step required - and mirrors the dev-app showcase's loading model:

- every component's `demo/*.demo.html` snippets are collected with
  `import.meta.glob(..., { query: '?raw' })`;
- each snippet is rendered live inside an isolated shadow root (`<mdc-demo>`),
  so a demo's own `<style>`/`<script>` cannot leak into the page;
- editing a demo file (or the library source) hot-reloads the page.

`packages/dev-app` is unaffected and remains the fast local dev showcase.

## Quick start

From the workspace root (`E:\projects\sandlada\mdc`):

```bash
npm install          # install all workspaces
npm run dev:docs     # astro dev server
npm run build:docs   # production build into packages/docs/dist/
npm run preview:docs # preview the production build
```

## Structure

```
packages/docs/
├── astro.config.mjs        # mdc alias + workspace fs.allow + watch plugin
├── wrangler.toml           # standalone Cloudflare project ("mdc-docs")
└── src/
    ├── lib/registry.ts     # live component list + raw demo/README registry
    ├── sessions/           # root session + sub-session providers (drawer/theme/breakpoint)
    ├── scripts/
    │   ├── base-imports.ts # side-effect import of every component barrel
    │   ├── theme.ts        # GlobalMDCContextProvider config
    │   └── demo-viewer.ts  # <mdc-demo> shadow-root renderer
    ├── components/         # Sidebar, DemoPreview
    ├── layouts/            # Site (shell), Docs (shell + sidebar)
    └── pages/
        ├── index.astro              # landing page
        ├── components/[name].astro  # one page per component
        └── playground.astro         # live markup editor
```

## Conventions

- **Never import a component in Astro frontmatter** - it would run Lit during
  SSR. Register components via `scripts/base-imports.ts` and use bare
  `<mdc-*>` tags in markup; they upgrade on the client.
- Component pages and the sidebar are generated from the library source, so
  adding a `demo/*.demo.html` file is enough to surface a new section.

## Icons

Icons are plain SVG from `@material-design-icons/svg` injected into
`<mdc-icon>` with `set:html` — **no icon font / CDN**. `mdc-icon` already
styles slotted SVGs (`::slotted(svg) { fill: currentColor }`), so they inherit
size and color.

```astro
---
import Icon from '../components/Icon.astro'
import { getIcon } from '../lib/icons'
---

<Icon name="notifications" />
<Icon name="favorite" style="filled" label="Favorite" />
<mdc-icon set:html={getIcon('menu')} />
```

`getIcon(name, style?)` (`src/lib/icons.ts`) reads from disk (server-only) and
supports `filled | outlined | round | sharp | two-tone`. `Icon.astro` is the
`set:html` wrapper.

> `mdc-icon`'s ligature form (`<mdc-icon>favorite</mdc-icon>`) requires the
> Material Symbols font; without the CDN it renders text. Use `Icon` / the
> `set:html` form instead.

## Deploy

Static output. Deploy with the standalone config:

```bash
npm run build:docs
wrangler deploy --config packages/docs/wrangler.toml
```
