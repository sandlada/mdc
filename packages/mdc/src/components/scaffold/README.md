# Scaffold (`<mdc-scaffold>`)

Material Design 3 `scaffold` component (`mdc-scaffold`).

## Variants & Options

- **`ScaffoldFabPosition`**: `bottom-end`, `bottom-center`, `bottom-start`, `docked-end`, `docked-center`

## Usage

```html
<mdc-scaffold></mdc-scaffold>
```

## Properties

| Property | Type | Default |
| --- | --- | --- |
| `railLayout` | `ScaffoldRailLayout` | `'full-height'` |
| `fabPosition` | `ScaffoldFabPosition` | `'bottom-end'` |
| `scrollMode` | `ScaffoldScrollMode` | `'body'` |
| `layoutMode` | `ScaffoldLayoutMode` | `'auto'` |
| `avoidSafeArea` | `boolean` | `false` |

## Slots

- `appbar`
- `bottom-bar`
- `bottom-sheet`
- `default`
- `drawer`
- `end-drawer`
- `end-rail`
- `fab`
- `navigation-bar`
- `rail`
- `side-sheet`
- `snackbar-host`
- `start-drawer`
- `start-rail`
- `trailing-rail`
