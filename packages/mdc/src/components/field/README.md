# Field (`<mdc-field>`)

Material Design 3 `field` component (`mdc-field`).

## Variants & Options

- **`FieldVariant`**: `filled`, `outlined`

## Usage

```html
<mdc-field></mdc-field>
```

## Properties

| Property | Type | Default |
| --- | --- | --- |
| `variant` | `FieldVariant` | `'filled'` |
| `label` | `string` | `''` |
| `supportingText` | `string` | `''` |
| `errorText` | `string` | `''` |
| `prefixText` | `string` | `''` |
| `suffixText` | `string` | `''` |
| `counterText` | `string` | `''` |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `noAsterisk` | `boolean` | `false` |
| `populated` | `boolean` | `false` |
| `focused` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `floatingLabelBehavior` | `FloatingLabelBehavior` | `'auto'` |
| `alignEnd` | `boolean` | `false` |
| `multiline` | `boolean` | `false` |
| `resizable` | `boolean` | `false` |

## Slots

- `counter`
- `default`
- `error-text`
- `leading-icon`
- `prefix`
- `suffix`
- `supporting-text`
- `trailing-icon`
