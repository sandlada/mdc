# Navigation Tab (`<mdc-navigation-tab>`)

Material Design 3 `navigation-tab` component (`mdc-navigation-tab`).

## Variants & Options

- **`NavigationTabVariant`**: `bar-vertical`, `bar-horizontal`, `bar-xr-vertical`, `rail-vertical`, `rail-horizontal`, `rail-round`, `rail-xr-vertical`, `rail-xr-round`, `drawer`, `drawer-horizontal`

## Usage

```html
<mdc-navigation-tab></mdc-navigation-tab>
```

## Properties

| Property | Type | Default |
| --- | --- | --- |
| `label` | `string` | `''` |
| `badge` | `string` | `''` |
| `badgeDot` | `boolean` | `false` |
| `value` | `string` | `''` |
| `href` | `string \| null` | `null` |
| `target` | `string \| null` | `null` |
| `navigationScope` | `string` | `''` |
| `checked` | `boolean` | `false` |
| `defaultChecked` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `variant` | `NavigationTabVariant` | `'bar-vertical'` |

## Slots

- `active-icon`
- `badge`
- `icon`
- `inactive-icon`
