# `mdc-popover`

A Material Design 3 Popover container for rich, anchored floating content.

## Architecture (Low-Coupling Layers)

- **Data / State (`internal/popover-state.ts`)**: Pure, framework-agnostic functions for placement direction, coordinate validation, virtual anchor creation, motion offset vectors, and composed-path boundary checks.
- **Behavior (`internal/popover-behavior-controller.ts`)**: Reusable Lit `ReactiveController` managing `@floating-ui/dom` positioning (`offset`, `flip`, `shift`, `arrow`, `autoUpdate`), cancelable lifecycle events (`popover-showing`, `popover-opened`, `popover-hiding`, `popover-closed`), WAAPI motion (`quick` & `prefers-reduced-motion` aware), outside-click / `Escape` / scroll dismiss, and focus restoration.
- **UI (`popover.ts`, `popover.style.ts`, `popover.definition.ts`)**: Thin Lit presentation shell with `standard`, `outlined`, and `vibrant` variants, directional arrow, optional modal scrim, and WCAG 2.2+ accessibility (`forced-colors`, `prefers-contrast`, `prefers-reduced-transparency`).

## Usage

```html
<mdc-popover placement="bottom-start" arrow>
    <mdc-button slot="trigger">Open Popover</mdc-button>
    <span slot="header">Filter Options</span>
    <p>Rich interactive content inside the popover surface.</p>
</mdc-popover>
```
