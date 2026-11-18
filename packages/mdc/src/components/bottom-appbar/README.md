# Bottom App Bar (`<mdc-bottom-appbar>`)

Material Design 3 `bottom-appbar` component (`mdc-bottom-appbar`).

Web equivalent of Android Jetpack Compose Material 3 `BottomAppBar`:
`https://m3.material.io/components/bottom-app-bar/overview`

## Usage

```html
<mdc-bottom-appbar>
  <mdc-icon-button aria-label="Check"><mdc-icon>check</mdc-icon></mdc-icon-button>
  <mdc-icon-button aria-label="Edit"><mdc-icon>edit</mdc-icon></mdc-icon-button>
  <mdc-fab slot="fab" open variant="tonal-secondary">
    <mdc-icon slot="icon">add</mdc-icon>
  </mdc-fab>
</mdc-bottom-appbar>
```

## Properties

| Property | Type | Default |
| --- | --- | --- |
| `scrollBehavior` | `'pinned' \| 'exit-always'` | `'pinned'` |
| `hidden` | `boolean` | `false` |
| `scrollTarget` | `HTMLElement \| Window \| string \| null` | `null` |
| `label` | `string` | `'Bottom app bar'` |

## Slots

- `default`: Start-aligned action icon buttons (`<mdc-icon-button>`).
- `fab`: Optional trailing embedded FAB (`<mdc-fab>`).
