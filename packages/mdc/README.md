# @sandlada/mdc

![MDC Logo](https://raw.githubusercontent.com/sandlada/mdc/refs/heads/main/docs/mdc-cover.png)

![NPM Downloads](https://img.shields.io/npm/d18m/@sandlada/mdc?label=NPM%20Downloads)
![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/sandlada/mdc/total?label=Github%20Downloads)
![NPM Version](https://img.shields.io/npm/v/%40sandlada%2Fmdc?label=NPM%20Version)
![GitHub License](https://img.shields.io/github/license/sandlada/mdc?label=License)

`@sandlada/mdc` is an open source component library that follows the Material Design 3 design specifications.

Written by Lit Framework, relying on the cross-framework capabilities of Lit and Web Component, you can use this library on any framework (Vue, Angular, React, etc.).

## :zap: Highlights

- **Material Design 3 & Material Expressive** - tracks the MD3 / MD3E specs and is themed entirely through `--md-sys-*` design tokens.
- **Framework agnostic** - built with Lit and native Web Components, so the same `<mdc-*>` elements work in React, Vue, Angular, Svelte, Astro, or plain HTML.
- **Tree-shakable** - every component is its own entry point under `@sandlada/mdc/components/<name>/index`, so you import only the elements you use.
- **Accessible by default** - keyboard navigation, ARIA semantics and focus rings, with `forced-colors`, `prefers-contrast`, `reduced-motion` and `reduced-transparency` support (WCAG 2.2+).
- **Modern baseline, zero polyfills** - targets Baseline 2026 evergreen browsers with native CSS and no vendor prefixes or legacy fallbacks.
- **TypeScript ready** - ships `.d.ts` declarations alongside the ESM build.

## :eyes: Installation

```bash
npm i @sandlada/mdc
```

## Controller utility imports

Replace imports from `@sandlada/mdc/utils/controller` with the entry point for each behavior.

| Symbols | Package subpath |
| --- | --- |
| `AttachableController`, `IAttachable` | `@sandlada/mdc/utils/attachment` |
| `TriggerController`, `TriggerKinds` | `@sandlada/mdc/utils/trigger` |
| `OverlayController`, `OverlayTreeManager`, overlay placement and dismissal types | `@sandlada/mdc/utils/overlay` |
| `SelectionController` | `@sandlada/mdc/utils/selection` |
| `ExpansionController`, `ExpansionGroupController` | `@sandlada/mdc/utils/expansion` |
| `MeasuredDimensionController`, `OpacityTransitionController` | `@sandlada/mdc/utils/motion` |
| `EdgeSlideController`, `Placement` | `@sandlada/mdc/utils/edge-slide` |
| `setupFormSubmitter`, `FormSubmitter`, `FormSubmitterType` | `@sandlada/mdc/utils/form` |

- Replace `DefaultOverlayTree` with `getOverlayTree(element.ownerDocument)`. Use the manager's `snapshot`, `getOpenDescendantSurfaces()`, and `getDeepestActiveLeafId()` for tree queries. Coordinate validation now runs through `overlay.showAt(x, y)`.
- Update selection options through `controller.configure(options)`.
- Replace `MeasuredContentWidthController` with `MeasuredDimensionController` using the same target, dimension, duration, and easing. Create `OpacityTransitionController` with the same target, duration, and easing when the old `opacity` option was enabled or omitted.

## :ledger: Offcial Website & Documents

For more information about MDC, please visit [mdc.sandlada.com](https://mdc.sandlada.com).

## :telescope: Dev Preview

The component showcase (`packages/dev-app`) is deployed to [mdc-dev-app.bre97-web.workers.dev](https://mdc-dev-app.bre97-web.workers.dev) via Cloudflare Workers Builds. Every push gets a preview deployment, so the site always tracks the latest state of the repository.

## :ship: Example

Don't know how to use MDC? Explore MDC with simple examples from [Github Wiki - Examples](https://github.com/sandlada/mdc/wiki/Examples).

## :world_map: Roadmap

If you want to follow the latest progress of MDC, please jump to issue [Project Tracker](https://github.com/sandlada/mdc/issues/6).
