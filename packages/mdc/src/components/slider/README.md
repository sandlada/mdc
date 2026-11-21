# Slider (`<mdc-slider>`)

Material Design 3 `slider` component (`mdc-slider`).

## Variants & Options

- **`SliderSize`**: `extra-small`, `small`, `medium`, `large`, `extra-large`
- **`SliderType`**: `standard`, `centered`, `range`

## Usage

```html
<mdc-slider></mdc-slider>
```

## Properties

| Property | Type | Default |
| --- | --- | --- |
| `min` | `—` | `0` |
| `max` | `—` | `100` |
| `step` | `—` | `1` |
| `value` | `number` | `0` |
| `valueStart` | `number` | `0` |
| `valueEnd` | `number` | `100` |
| `minSeparation` | `number` | `0` |
| `values` | `[number, number]` | `[0, 100]` |
| `type` | `SliderType` | `SliderType.Standard` |
| `size` | `SliderSize` | `SliderSize.ExtraSmall` |
| `direction` | `SliderDirection` | `SliderDirection.Horizontal` |
| `reversed` | `—` | `false` |
| `ticks` | `—` | `false` |
| `labeled` | `—` | `false` |
| `icon` | `—` | `''` |
| `valueLabel` | `—` | `''` |
| `valueLabelStart` | `—` | `''` |
| `valueLabelEnd` | `—` | `''` |
| `valueFormatter` | `—` | `—` |
| `ariaLabelStart` | `—` | `''` |
| `ariaLabelEnd` | `—` | `''` |
| `ariaValueTextStart` | `—` | `''` |
| `ariaValueTextEnd` | `—` | `''` |

## Slots

- `icon`
