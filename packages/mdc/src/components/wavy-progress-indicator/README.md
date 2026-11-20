# Wavy Progress Indicator (`<mdc-wavy-progress-indicator>`)

Material Design 3 Expressive wavy progress indicator component (`mdc-wavy-progress-indicator`), replicating Jetpack Compose's `LinearWavyProgressIndicator` and `CircularWavyProgressIndicator` animations, transitions, and full customization options.

## Usage

```html
<mdc-wavy-progress-indicator value="0.65"></mdc-wavy-progress-indicator>
<mdc-wavy-progress-indicator variant="circular" value="0.65"></mdc-wavy-progress-indicator>
<mdc-wavy-progress-indicator indeterminate></mdc-wavy-progress-indicator>
```

## Properties

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `variant` | `'linear' \| 'circular'` | `'linear'` | Layout variant |
| `value` | `value` | `number` | `0` | Determinate progress value (`0` – `max`) |
| `max` | `max` | `number` | `1` | Maximum progress value |
| `indeterminate` | `indeterminate` | `boolean` | `false` | Indeterminate wavy animation mode |
| `circularSize` | `circular-size` | `'extra-small' \| 'small' \| 'medium' \| 'large'` | `'medium'` | Circular size preset |
| `wavelength` | `wavelength` | `number \| null` | `null` | Wavelength override in px |
| `waveSpeed` | `wave-speed` | `number \| null` | `null` | Wave scroll speed in px/s (`0` static, `<0` reverse, `null` = `wavelength`) |
| `waveAmplitude` | `wave-amplitude` | `number \| null` | `null` | Max wave peak amplitude override in px |
| `amplitude` | — | `number \| ((progress: number) => number) \| null` | `null` | Normalized amplitude `[0, 1]` or Compose-style `(progress) => number` callback |
| `strokeWidth` | `stroke-width` | `number \| null` | `null` | Active indicator stroke thickness in px |
| `trackStrokeWidth` | `track-stroke-width` | `number \| null` | `null` | Track stroke thickness in px |
| `strokeCap` | `stroke-cap` | `'round' \| 'butt' \| 'square'` | `'round'` | Active indicator stroke cap |
| `trackStrokeCap` | `track-stroke-cap` | `'round' \| 'butt' \| 'square'` | `'round'` | Track stroke cap |
| `gapSize` | `gap-size` | `number \| null` | `null` | Visual gap between active indicator and track in px (`0` disables gap) |
| `stopSize` | `stop-size` | `number \| null` | `null` | Stop indicator diameter in px (`0` hides stop indicator) |
| `animated` | `animated` | `boolean` | `true` | Enables built-in spring & amplitude transitions |
