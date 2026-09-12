# MDC Design System Tools

VS Code extension for `@sandlada/mdc` components and `@sandlada/styles` stylesheets:
IntelliSense, token auditing via CodeLens, hover info, go-to-definition, and a
compiled-CSS preview.

## Features

- `MDC: Inspect Tokens in Stylesheet` — browse private / child-bridge / unused tokens.
- `MDC: Show Compiled CSS for Stylesheet` — open the genuine compiled CSS beside the editor.
- Tree views: Schema, Selector Mapping, Component / Forwarded / Unused Tokens, MDC Explorer.
- Completions, hover, diagnostics and quick fixes for `*.style.ts` and `*.definition.ts`.

## Development

```sh
npm run build:vscode   # build dist/ from the repo root
```

Press `F5` (`Launch MDC Extension (F5)`) to open an Extension Development Host.

## Packaging

```sh
npm run package:vscode  # build + vsce package, outputs *.vsix
```

Install the resulting `.vsix` via `Extensions → … → Install from VSIX`.
