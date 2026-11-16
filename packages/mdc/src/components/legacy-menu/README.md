# Legacy Menu (`<mdc-legacy-menu>`, `<mdc-legacy-menu-item>`, `<mdc-legacy-menu-submenu>`)

Material Design 3 `legacy-menu` component (`mdc-legacy-menu`, `mdc-legacy-menu-item`, `mdc-legacy-menu-submenu`).

## Usage

```html
<mdc-legacy-menu></mdc-legacy-menu>
```

## Properties

| Property | Type | Default |
| --- | --- | --- |
| `type` | `LegacyMenuItemType` | `'button'` |
| `disabled` | `—` | `false` |
| `href` | `—` | `''` |
| `target` | `—` | `''` |
| `selected` | `—` | `false` |
| `checkable` | `—` | `false` |
| `radio` | `—` | `false` |
| `value` | `—` | `''` |
| `shortcut` | `—` | `''` |
| `badge` | `string \| number \| null` | `null` |
| `listTabIndex` | `—` | `0` |
| `keepOpen` | `—` | `false` |
| `name` | `—` | `''` |
| `label` | `—` | `''` |
| `typeaheadText` | `—` | `''` |
| `placement` | `LegacyMenuPlacement` | `'right-start'` |
| `openDelay` | `—` | `120` |
| `closeDelay` | `—` | `220` |
| `open` | `—` | `false` |
| `quick` | `—` | `false` |
| `typeaheadDelay` | `—` | `500` |
| `colorStyle` | `LegacyMenuColorStyle` | `'standard'` |
| `layout` | `LegacyMenuLayout` | `'standard'` |
| `anchor` | `—` | `''` |
| `anchorElement` | `HTMLElement \| null` | `null` |
| `stayOpenOnOutsideClick` | `—` | `false` |
| `stayOpenOnFocusout` | `—` | `false` |
| `skipRestoreFocus` | `—` | `false` |
| `hasOverflow` | `—` | `false` |
| `xOffset` | `—` | `0` |
| `yOffset` | `—` | `0` |
| `defaultFocus` | `'first-item' \| 'last-item' \| 'none' \| 'root'` | `'first-item'` |
| `noHorizontalFlip` | `—` | `false` |
| `noVerticalFlip` | `—` | `false` |

## Events

- `closed`
- `opened`

## Slots

- `default`
- `leading`
- `section-label`
- `supporting`
- `surface`
- `trailing`
- `trigger`
