# Menu (`<mdc-menu>`, `<mdc-menu-group>`, `<mdc-menu-item>`, `<mdc-menu-submenu>`)

Material Design 3 `menu` component (`mdc-menu`, `mdc-menu-group`, `mdc-menu-item`, `mdc-menu-submenu`).

## Variants & Options

- **`MenuItemType`**: `text`, `button`, `link`

## Usage

```html
<mdc-menu></mdc-menu>
```

## Properties

| Property | Type | Default |
| --- | --- | --- |
| `label` | `string \| null` | `null` |
| `variant` | `MenuColorStyle` | `'standard'` |
| `type` | `MenuItemType` | `'button'` |
| `disabled` | `—` | `false` |
| `href` | `—` | `''` |
| `target` | `—` | `''` |
| `selected` | `—` | `false` |
| `checkable` | `—` | `false` |
| `radio` | `—` | `false` |
| `value` | `—` | `''` |
| `shortcut` | `string \| null` | `null` |
| `badge` | `string \| number \| null` | `null` |
| `listTabIndex` | `—` | `0` |
| `placement` | `MenuPlacement` | `'right-start'` |
| `open` | `—` | `false` |
| `quick` | `—` | `false` |
| `openDelay` | `—` | `120` |
| `closeDelay` | `—` | `220` |
| `colorStyle` | `MenuColorStyle` | `'standard'` |
| `layout` | `MenuLayout` | `'standard'` |

## Events

- `menu-group-slotchange`

## Slots

- `default`
- `label`
- `leading`
- `section-label`
- `supporting`
- `surface`
- `trailing`
- `trigger`
