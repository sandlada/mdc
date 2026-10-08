# Loading Indicator

`mdc-loading-indicator` is the MD3 Expressive morphing-shape loading indicator.
Unlike a progress indicator, which communicates *how much* work remains, a
loading indicator expresses an **unspecified** wait time through motion: a soft
geometric shape continuously morphs into the next shape of a fixed sequence
while the whole sequence tumbles around the container center. It is intended
for short waits (under ~5 seconds).

The indeterminate form replays the MD3 Expressive choreography — the seven
Material shapes **SoftBurst → Cookie9Sided → Pentagon → Pill → Sunny →
Cookie4Sided → Oval** morph pairwise on a 4666/7 ms (≈666.57 ms) period, driven
by a continuous underdamped spring (stiffness `200`, damping ratio `0.6`), with
`450/7°` of constant plus `90°` of spring-driven rotation per shape (three full
turns per seamless loop).

## Components

- `mdc-loading-indicator`

## Status

| Component               | Ready to use |
| :---------------------- | -----------: |
| `mdc-loading-indicator` |          Yes |

## Usage

```html
<!-- Indeterminate: loops the shape sequence forever. -->
<mdc-loading-indicator indeterminate></mdc-loading-indicator>

<!-- Contained: draws the rounded container behind the shape. -->
<mdc-loading-indicator indeterminate contained></mdc-loading-indicator>

<!-- Determinate: tracks progress 0–1 (default when not indeterminate). -->
<mdc-loading-indicator progress="0.66"></mdc-loading-indicator>
```

```ts
import { MDCLoadingIndicator } from '@sandlada/mdc/components/loading-indicator/index'

const indicator = document.createElement('mdc-loading-indicator')
indicator.indeterminate = true
indicator.addEventListener('loading-indicator-complete', () => {
    /* determinate progress reached 1 */
})
```

## Properties

| Property        | Attribute       | Type                                                        | Default     | Description                                                              |
| :-------------- | :-------------- | :---------------------------------------------------------- | :---------- | :----------------------------------------------------------------------- |
| `indeterminate` | `indeterminate` | `boolean`                                                   | `false`     | Loops the morph sequence instead of tracking `progress`. Reflected.      |
| `progress`      | `progress`      | `number`                                                    | `0`         | Determinate progress, `0`–`1` (clamped). Mirrored by `aria-valuenow`.   |
| `variant`       | `variant`       | `'primary' \| 'secondary' \| 'tertiary' \| 'error' \| 'surface'` | `'primary'` | MD3 color-role scheme (see [Variants](#variants)). Reflected.       |
| `contained`     | `contained`     | `boolean`                                                   | `false`     | Draws the fully-rounded container behind the shape. Reflected.           |
| `speed`         | `speed`         | `number`                                                    | `1`         | Animation-rate multiplier for the indeterminate form (see [Motion](#motion)). Reflected. |

## Events

| Event                        | Detail              | Description                                                                                              |
| :--------------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| `loading-indicator-complete` | `{ value: number }` | Dispatched (bubbles, composed) when a determinate `progress` reaches `1`. Re-armed if progress drops below `1` and climbs back to `1`. Never fired while `indeterminate`. |

## Determinate progress

Without `indeterminate`, the element becomes a determinate indicator:

- `progress` (`0`–`1`, values outside the range are clamped) drives a single
  **circle → SoftBurst** morph, while the shape rotates counter-clockwise by
  `-progress × 180°` across the whole range.
- The last shape holds steady for the remainder once progress reaches `1`, and
  `loading-indicator-complete` is dispatched exactly once per ascent.
- Determinate tracking is **not** time-driven: `speed` does not affect it.

## Variants

`variant` selects the MD3 color-role scheme; `contained` toggles the 48dp
container behind the shape (uncontained, the default, has no background).

| variant   | uncontained indicator | contained container   | contained indicator    |
| :-------- | :-------------------- | :-------------------- | :--------------------- |
| primary   | `primary`             | `primary-container`   | `on-primary-container` |
| secondary | `secondary`           | `secondary-container` | `on-secondary-container` |
| tertiary  | `tertiary`            | `tertiary-container`  | `on-tertiary-container` |
| error     | `error`               | `error-container`     | `on-error-container`   |
| surface   | `surface`             | `surface-container`   | `on-surface`           |

The variant colors are applied through CSS classes on the render root (no
inline style). Each variant re-keys the color tokens through its own
`-{variant}` suffix, so overriding the base token only affects `primary`; use
the suffixed token (e.g.
`--mdc-loading-indicator-enabled-contained-container-color-secondary`) to
customize a specific variant.

## Motion

The indeterminate timeline is fixed and loops seamlessly; `speed` scales all of
it (spring, shape period, spring spin and constant rotation):

| Quantity                    | Value                                                       |
| :-------------------------- | :---------------------------------------------------------- |
| Shape period                | `4666 / 7` ms (≈`666.57 ms`)                                 |
| Morph spring                | stiffness `200`, damping ratio `0.6`                         |
| Rotation per shape          | `450/7°` constant + `90°` spring-driven (≈`154.29°`)         |
| Rotation per loop           | `3 × 360°` — the loop is seamless                            |
| Shape draw size             | `35px` inside the 38px active indicator size (≈73% of the 48px container) |

The morph factor is a continuous spring re-targeted one shape further every
period: the rendered shape index is the floor of the spring value and the morph
progress is its remainder, so the handoff between two consecutive morphs is
continuous (the spring briefly overshoots into the next shape). `speed = 2` runs
twice as fast, `0.5` half speed and `0` pauses the loop; negative values are
clamped to `0`.

## Accessibility

- The render root is a `role="progressbar"` with `aria-valuemin="0"` and
  `aria-valuemax="1"`; `aria-valuenow` reflects `progress` for the determinate
  form and is omitted while indeterminate.
- `aria-label` (or `aria-labelledby`) is delegated to the host so assistive
  technology sees a single labelled progress bar; the inner shape SVG is
  `aria-hidden`.
- Under `prefers-reduced-motion: reduce` the animation does not start and a
  static frame is held; the determinate form is unaffected.

## CSS custom properties

### Layout and shape

| Property                                             | Default           |
| :--------------------------------------------------- | :---------------- |
| `--mdc-loading-indicator-container-size`             | `48px`            |
| `--mdc-loading-indicator-indicator-size`             | `38px`            |
| `--mdc-loading-indicator-container-shape-start-start`| `full`            |
| `--mdc-loading-indicator-container-shape-start-end`  | `full`            |
| `--mdc-loading-indicator-container-shape-end-start`  | `full`            |
| `--mdc-loading-indicator-container-shape-end-end`    | `full`            |

### Colors

The defaults below are the `primary` scheme; every token also has a
`-{variant}` counterpart (`-secondary`, `-tertiary`, `-error`, `-surface`).

| Property                                                        | Default                |
| :-------------------------------------------------------------- | :--------------------- |
| `--mdc-loading-indicator-enabled-uncontained-container-color`   | `transparent`          |
| `--mdc-loading-indicator-enabled-uncontained-indicator-color`   | `primary`              |
| `--mdc-loading-indicator-enabled-contained-container-color`     | `primary-container`    |
| `--mdc-loading-indicator-enabled-contained-indicator-color`     | `on-primary-container` |

```css
/* A custom contained container color for the error variant. */
mdc-loading-indicator[variant='error'] {
    --mdc-loading-indicator-enabled-contained-container-color-error: #ffd8d6;
}
```

## Development

The whole morphing-shape engine lives in `internal/` and is a 1:1 TypeScript
port of the reference implementation:

| Module                  | Ported from                                                         |
| :---------------------- | :------------------------------------------------------------------ |
| `point.ts`, `cubic.ts`  | `androidx.graphics.shapes` point / cubic primitives                 |
| `rounded-polygon.ts`    | `androidx.graphics.shapes.RoundedPolygon` (rounding, normalization, bounds) |
| `feature.ts`, `measure.ts`, `feature-mapping.ts`, `morph.ts` | the `Morph` algorithm (feature mapping, curve cutting, per-curve interpolation) |
| `material-shapes.ts`    | the seven `MaterialShapes` definitions used by the loading indicator |
| `spring.ts`             | Compose `SpringSimulation` + `estimateAnimationDurationMillis`      |
| `animation.ts`          | the timeline: shape period, spring choreography and rotation law    |

Run the unit tests — geometry (normalization, morph continuity, scale, spring,
timeline) and component properties — with:

```sh
cd packages/mdc
npm test
```
