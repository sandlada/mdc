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
pnpm install          # install all workspaces
pnpm run dev:docs     # astro dev server
pnpm run build:docs   # production build into packages/docs/dist/
pnpm run preview:docs # preview the production build
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
    ├── components/         # Sidebar, DemoPreview, ComponentTabs
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

Icons use the `material-symbols` variable font, the same package as
`packages/dev-app`. It is loaded once in `src/layouts/Site.astro`:

```ts
import 'material-symbols/index.css'
```

`mdc-icon` already sets `font-family: 'Material Symbols Outlined'`, so write the
icon name as ligature text and use the element's attributes for the variable
axes:

```html
<mdc-icon>notifications</mdc-icon>
<mdc-icon filled>favorite</mdc-icon>
<mdc-icon weight="300" optical-size="20">menu</mdc-icon>
```

Shared component demos (`packages/mdc/src/components/*/demo/*.demo.html`) use
the same ligature form, so they render correctly in the docs preview without
any per-demo work.

## Deploy

Static output. Deploy with the standalone config:

```bash
pnpm run build:docs
wrangler deploy --config packages/docs/wrangler.toml
```
