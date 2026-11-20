# Snackbar (`<mdc-snackbar>`, `<mdc-snackbar-host>`)

Material Design 3 `snackbar` component (`mdc-snackbar`, `mdc-snackbar-host`).

## Usage

```html
<mdc-snackbar open has-close-icon>Message saved</mdc-snackbar>
```

## Properties

| Property | Type | Default |
| --- | --- | --- |
| `placement` (`mdc-snackbar-host`) | `SnackbarPlacement` | `'bottom-center'` |
| `scoped` (`mdc-snackbar-host`) | `boolean` | `false` |
| `maxVisible` (`mdc-snackbar-host`) | `number` | `1` |
| `open` | `boolean` | `false` |
| `duration` | `SnackbarDuration \| number` | `'short'` |
| `animationMode` | `SnackbarAnimationMode` | `'slide'` |
| `multiline` | `boolean` | `false` |
| `actionOnNewLine` | `boolean` | `false` |
| `swipeToDismiss` | `boolean` | `true` |
| `hasCloseIcon` | `boolean` | `false` |
| `variant` | `SnackbarVariant` | `'inverse-surface'` |

## Slots

- `action`
- `close-icon`
- `default`
- `icon`
