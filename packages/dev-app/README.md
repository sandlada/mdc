# @sandlada/mdc-dev

Developer showcase / docs site for `@sandlada/mdc`. Consumes the library directly
from `packages/mdc/src/` via Vite alias — no pre-build step required.

## Quick start

From the workspace root (`E:\projects\sandlada\mdc`):

```bash
npm install          # install all workspaces
npm run dev          # vite dev server on http://localhost:5173
npm run build:dev    # production build into packages/dev-app/dist/
npm run preview:dev  # preview the production build
```

## Structure

```
packages/dev-app/
├── index.html                    # meta-refresh redirect to Styles Playground
├── components/
│   └── {component-name}/index.html   # one page per enabled component
├── shared/
│   ├── contexts/                 # one *-context module per context + index.ts barrel
│   │   ├── title-context.ts      # docsPageTitleContext (current page title)
│   │   └── index.ts
│   ├── docs-shell.ts             # <mdc-docs-shell> page chrome (Lit)
│   ├── docs-sidebar.ts           # <mdc-docs-sidebar> nav (Lit)
│   ├── docs-manifest.ts          # live component list from import.meta.glob
│   ├── docs-page.ts              # <mdc-docs-page> per-page wrapper (Lit)
│   ├── demo-loader.ts            # import.meta.glob('?raw') for *.demo.html
│   ├── theme.ts                  # MD3 token palette + GlobalMDCContextProvider
│   └── styles.css                # shared chrome styles
└── vite.config.ts                # MPA mode + @sandlada/mdc alias
```

## Adding a new component page

1. Add the component to `src/all.ts` (uncomment).
2. Remove the matching `!**/component-name/**` glob from `packages/mdc/rolldown.config.js`.
3. Remove the matching `./src/**/component-name/*` from `packages/mdc/tsconfig.json`.
4. Add `packages/dev-app/components/{component-name}/index.html`.

Demo snippets live next to the component in `packages/mdc/src/components/{name}/demo/*.demo.html`.

## Sidebar sections

The sidebar (`shared/docs-sidebar.ts`, grouped in `shared/docs-manifest.ts`) has
three sections in order: **Style Playground** (the `playground` page),
**Base Components** (`BASE_COMPONENT_ORDER`: divider, elevation, focus-ring,
ripple, badge, icon, typography), and **Components** (everything else).

## Page contexts

Cross-cutting page state lives in `shared/contexts/` — one module per context
(`*-context.ts`, re-exported via `index.ts`; add future contexts the same way).
`<mdc-docs-page>` publishes its `title` through `docsPageTitleContext`, and
`<mdc-docs-shell>` consumes it to render the current page title in the header.

## Dynamic detection (no server restart needed)

The sidebar and per-page demo sections are all derived from
`import.meta.glob` (via `shared/docs-manifest.ts` / `shared/demo-loader.ts`).
Vite re-transforms those glob modules when a matching file is added or removed,
so while the dev server is running:

- **New component page** — drop a folder under `components/{name}/index.html`;
  the matching sidebar section picks it up (page auto-reloads). No edits to
  `docs-sidebar.ts` or the root `index.html` (which redirects to the playground).
- **New demo file** — add `{name}.{prop}.demo.html` under the component's
  `demo/` folder; it appears on the component page automatically, appended
  after the curated `demo-files` list.

The `<mdc-docs-page component="..." title="...">` tag in each page declares the
component name and its sidebar label — keep both in sync with the folder name.