# MDC Focus Ring

`mdc-focus-ring` is a decorative focus overlay for focusable controls. It is designed to sit on top of a relatively positioned host and follow the host's shape.

## Usage

Use it as a direct child when the ring belongs to the host element.

```html
<button class="my-button">
  Save
  <mdc-focus-ring></mdc-focus-ring>
</button>

<style>
  .my-button {
    position: relative;
  }
</style>
```

Use `for` when the ring should follow an external control instead of its parent.

```html
<div class="wrap">
  <mdc-focus-ring for="save-button"></mdc-focus-ring>
  <button id="save-button">Save</button>
</div>

<style>
  .wrap {
    position: relative;
  }
</style>
```

Use `attach(control)` and `detach()` when you need to control the target imperatively.

```html
<div class="wrap">
  <mdc-focus-ring id="ring"></mdc-focus-ring>
  <button id="target">Save</button>
</div>

<style>
  .wrap {
    position: relative;
  }
</style>

<script type="module">
  import { MDCFocusRing } from '@sandlada/mdc'

  const ring = document.querySelector('#ring')
  const target = document.querySelector('#target')

  ring.attach(target)

  // Later, switch back to a detached state.
  ring.detach()
</script>
```

## Attributes

- `inward`: renders the ring inside the control instead of outside. Default: `false`.
- `shape-inherit`: inherits the host's corner radius. Default: `true`.
- `animation-disabled`: disables the focus ring animation and transition. Default: `false`.
- `disabled`: turns the ring off. Default: `false`.
- `ignore-global-config`: opts the component out of global focus-ring configuration; when present the component will not inherit global focus-ring settings and will use local properties only. Default: `false`.
- `focused`: force-shows the focus ring (useful for host-driven forced focus or testing). Default: `false`.

Programmatic API:

- `htmlFor` / `for`: reflects the ID of the control the ring follows.
- `control`: the resolved `HTMLElement` the ring is attached to (or `null`).
- `attach(control)` / `detach()`: imperatively attach or detach the ring from a control. Note: `attach()` removes the `for` attribute (so the attached control is used), while `detach()` sets `for=""` to create an explicit detached state (control is `null`).

When a global `GlobalMDCContextProvider` is attached, `mdc-focus-ring` computes its effective disabled state like this: if `GlobalMDCContext.focusRing.disabled` is defined, that value is used; otherwise the component is disabled when `GlobalMDCContext.enableFocusRing` is `false` (i.e., it falls back to the inverse of `enableFocusRing`). A locally configured `disabled` value takes precedence over the global configuration. Setting `ignore-global-config` forces the component to ignore global settings and use local properties only.

## Notes

- The control that the ring follows (the "host") should be focusable (e.g., `tabindex` not `-1`). For standalone rings or when the ring is not a direct child, ensure the container uses `position: relative` so the overlay positions correctly.
- Calling `detach()` sets `for=""` to create an intentional detached state (the ring's `control` becomes `null`). Removing the `for` attribute returns control resolution to the ring's parent element.
- The component is exported from the package root, so the import shown above is the preferred entry point.
