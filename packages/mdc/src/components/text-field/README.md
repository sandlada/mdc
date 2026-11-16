# Text Field (`<mdc-text-field>`)

Material Design 3 `text-field` component (`mdc-text-field`).

## Variants & Options

- **`TextFieldType`**: `email`, `number`, `password`, `search`, `tel`, `text`, `url`, `color`, `date`, `datetime-local`, `month`, `time`, `week`, `textarea`

## Usage

```html
<mdc-text-field></mdc-text-field>
```

## Properties

| Property | Type | Default |
| --- | --- | --- |
| `variant` | `FieldVariant` | `'filled'` |
| `value` | `string` | `''` |
| `type` | `TextFieldType` | `'text'` |
| `label` | `string` | `''` |
| `placeholder` | `string` | `''` |
| `supportingText` | `string` | `''` |
| `errorText` | `string` | `''` |
| `error` | `boolean` | `false` |
| `prefixText` | `string` | `''` |
| `suffixText` | `string` | `''` |
| `required` | `boolean` | `false` |
| `noAsterisk` | `boolean` | `false` |
| `readOnly` | `boolean` | `false` |
| `min` | `string` | `''` |
| `max` | `string` | `''` |
| `step` | `string` | `''` |
| `pattern` | `string` | `''` |
| `minLength` | `number` | `-1` |
| `maxLength` | `number` | `-1` |
| `autocomplete` | `string` | `''` |
| `override` | `—` | `—` |
| `rows` | `number` | `2` |
| `cols` | `number` | `20` |
| `clearable` | `boolean` | `false` |
| `counter` | `boolean` | `false` |
| `counterText` | `string` | `''` |
| `floatingLabelBehavior` | `FloatingLabelBehavior` | `'auto'` |
| `alignEnd` | `boolean` | `false` |
| `autoValidate` | `boolean` | `false` |

## Events

- `change`
- `input`

## Slots

- `counter`
- `leading-icon`
- `prefix`
- `supporting-text`
- `trailing-icon`
