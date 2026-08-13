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
├── index.html                    # landing page (component overview)
├── components/
│   └── {component-name}/index.html   # one page per enabled component
├── shared/
│   ├── docs-shell.ts             # <mdc-docs-shell> page chrome (Lit)
│   ├── docs-sidebar.ts           # <mdc-docs-sidebar> nav (Lit)
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