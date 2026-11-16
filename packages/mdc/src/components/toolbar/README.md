# Toolbar (`<mdc-docked-toolbar>`, `<mdc-docked-toolbar-action>`, `<mdc-floating-toolbar>`)

Material Design 3 `toolbar` component (`mdc-docked-toolbar`, `mdc-docked-toolbar-action`, `mdc-floating-toolbar`).

## Usage

```html
<mdc-docked-toolbar></mdc-docked-toolbar>
```

## Properties

| Property | Type | Default |
| --- | --- | --- |
| `variant` | `ToolbarVariant` | `'standard'` |
| `selected` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `label` | `string` | `''` |
| `alignment` | `DockedToolbarAlignment` | `'space-between'` |
| `orientation` | `ToolbarOrientation` | `'horizontal'` |
| `expanded` | `boolean` | `true` |
| `fabPosition` | `FloatingToolbarFabPosition` | `'end'` |

## Slots

- `default`
- `fab`
- `icon`
- `leading`
- `trailing`
