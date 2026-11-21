# Shape (`<mdc-shape>`)

Material Design 3 Expressive Shape component and geometry library, ported 1:1 from Android `androidx.graphics.shapes` (`RoundedPolygon`, `Morph`, `Shapes.kt`) and Jetpack Compose `MaterialShapes` + `MotionScheme`.

## Features

- **All 35 `MaterialShapes`**: `circle`, `square`, `slanted`, `arch`, `fan`, `arrow`, `semi-circle`, `oval`, `pill`, `triangle`, `diamond`, `clam-shell`, `pentagon`, `gem`, `sunny`, `very-sunny`, `cookie-4-sided`, `cookie-6-sided`, `cookie-7-sided`, `cookie-9-sided`, `cookie-12-sided`, `ghostish`, `clover-4-leaf`, `clover-8-leaf`, `burst`, `soft-burst`, `boom`, `soft-boom`, `flower`, `puffy`, `puffy-diamond`, `pixel-circle`, `pixel-triangle`, `bun`, `heart`.
- **Parametric `Shapes.kt` Builders**: `polygon`, `star`, `rectangle`, `pill-star` plus custom `RoundedPolygon` / `vertices`.
- **Interruptible Spring Transitions**: Powered by Compose's analytic `SpringSimulation` and `MotionScheme` (`expressive` / `standard` × `fast` / `default` / `slow`). Reversing mid-flight preserves $C^1$ position and velocity continuity; switching to a third shape mid-flight snapshots the exact intermediate `RoundedPolygon` via `Morph.toPolygon()`.
- **State-Driven Morphing**: `hover-shape`, `focus-shape`, `pressed-shape`, `selected-shape`, and `disabled-shape` with priority `disabled > pressed > selected > focused > hovered > base`.
- **Content Clipping**: Slotted media, icons, and text are clipped to the live morphed outline via `clip-path: path(...)`.
- **Manual Scrubbing & Autoplay**: Use `morph-to` + `progress` to scrub any `Morph`, or `autoplay` + `sequence` to cycle shapes continuously.

## Usage

```html
<!-- State-driven interactive shape toggle -->
<mdc-shape
    interactive
    toggle
    shape="square"
    hover-shape="cookie-4-sided"
    pressed-shape="soft-burst"
    selected-shape="heart"
    motion-scheme="expressive"
    motion-speed="fast"
>
    <mdc-icon name="favorite"></mdc-icon>
</mdc-shape>

<!-- Scrubbed morph -->
<mdc-shape shape="circle" morph-to="sunny" progress="0.5"></mdc-shape>
```

```ts
import { MaterialShapes, Morph, MotionScheme } from '@sandlada/mdc/components/shape/index'

const morph = new Morph(MaterialShapes.Circle, MaterialShapes.Heart)
const cubics = morph.asCubics(0.5)
```
