# @sandlada/styles

Framework-agnostic Material Design 3 style & token engine: schemas, state-aware stylesheet compilation (`@state` / `@variant` / `@when`), token expanders, a Lit adapter, and a rolldown pre-build plugin.

Part of the [sandlada/mdc](https://github.com/sandlada/mdc) monorepo. See the repository root for full documentation, contributing guide, and license terms.

## Entries

- `@sandlada/styles` — core engine (DOM-free, framework-agnostic).
- `@sandlada/styles/<subpath>` (`compiler`, `tokens`, `triggers`, `expand`, `style-engine`, …) — precise subpath loading, one barrel per folder.
- `@sandlada/styles/lit` — Lit adapter (`CSSResult` terminals for `static styles`).
- `@sandlada/styles/rolldown` — Node-only pre-build plugin `mdcStyles()` (triggered by `/* @mdc-style */`, must run before CSS-minifying plugins).

## License

MIT — see [LICENSE](./LICENSE).
