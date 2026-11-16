# Tabs (`<mdc-tab>`, `<mdc-tabs>`)

Material Design 3 `tabs` component (`mdc-tab`, `mdc-tabs`).

## Variants & Options

- **`TabVariant`**: `primary`, `secondary`, `floating`

## Usage

```html
<mdc-tab></mdc-tab>
```

## Properties

| Property | Type | Default |
| --- | --- | --- |
| `readonly` | `—` | `—` |
| `active` | `—` | `false` |
| `disabled` | `—` | `false` |
| `alwaysFocusable` | `—` | `false` |
| `variant` | `TabVariant` | `TabVariant.Primary` |
| `index` | `—` | `0` |
| `hasIcon` | `—` | `false` |
| `iconOnly` | `—` | `false` |
| `hasBadge` | `—` | `false` |
| `label` | `—` | `''` |
| `activeTabIndex` | `—` | `0` |
| `autoActivate` | `—` | `true` |
| `mode` | `TabsMode` | `TabsMode.Fixed` |
| `noDivider` | `—` | `false` |

## Events

- `change`

## Slots

- `badge`
- `default`
- `icon`
