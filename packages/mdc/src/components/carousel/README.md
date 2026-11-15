# Carousel

A Material Design 3 horizontal, keyline-morphing scroll-snap carousel container (`mdc-carousel`) and its items (`mdc-carousel-item`), modeled after **Jetpack Compose Material 3** (`androidx.compose.material3.carousel`) and the **Material 3 Figma Design Kit**.

## Elements

| Element | Role |
| --- | --- |
| `mdc-carousel` | The scroll-snap container — computes keylines, morphs item widths & shapes on scroll, and tracks `activeIndex` |
| `mdc-carousel-item` | A morphing cell; exposes `size` (`large` / `medium` / `small`), `active`, `index`, and `--mdc-carousel-item-ratio` (`0..1`), plus an optional `caption` slot |

## Usage

```html
<mdc-carousel variant="multi-browse">
    <mdc-carousel-item>
        <img src="photo-1.jpg" alt="Alpine ridge" />
        <span slot="caption">Alpine Ridge</span>
    </mdc-carousel-item>
    <mdc-carousel-item>
        <img src="photo-2.jpg" alt="Emerald valley" />
        <span slot="caption">Emerald Valley</span>
    </mdc-carousel-item>
    <mdc-carousel-item>
        <img src="photo-3.jpg" alt="Rose canyon" />
        <span slot="caption">Rose Canyon</span>
    </mdc-carousel-item>
</mdc-carousel>
```

## Variants

- **`multi-browse`** (default) — fills the container edge-to-edge with large, medium, and small items. As you scroll, items dynamically morph between keylines and snap cleanly.
- **`hero`** — start-aligned large focal item paired with a small peeking item.
- **`centered-hero`** — centered large focal item flanked by small items on both sides, shifting smoothly to start/end alignment at the list bounds.
- **`uncontained`** — uniform item width (`preferred-item-width`), free scrolling without snap.
- **`full-screen`** — single edge-to-edge large item per snap.

## Properties

### `mdc-carousel`

| Property | Attribute | Type | Default |
| --- | --- | --- | --- |
| `variant` | `variant` | `'multi-browse' \| 'hero' \| 'centered-hero' \| 'uncontained' \| 'full-screen'` | `'multi-browse'` |
| `preferredItemWidth` | `preferred-item-width` | `number` | `186` |
| `minSmallItemWidth` | `min-small-item-width` | `number` | `40` |
| `maxSmallItemWidth` | `max-small-item-width` | `number` | `56` |
| `activeIndex` | *(read only)* | `number` | `-1` |

### `mdc-carousel-item`

| Property | Attribute | Type | Default |
| --- | --- | --- | --- |
| `size` | `size` | `'large' \| 'medium' \| 'small'` | `'medium'` |
| `active` | `active` | `boolean` | `false` |
| `index` | `index` | `number` | `0` |

## Events & Methods

- `carousel-active-change` (`{ item, index }`) — dispatched when the focal item changes.
- `scrollToItem(index)` — scrolls the item at `index` to its focal keyline. Also driven by `←` / `→` (RTL-aware), `Home`, `End`, and mouse drag.

## CSS Custom Properties

| Property | Default |
| --- | --- |
| `--mdc-carousel-small-item-shape-*` | `12px` (`Shape.Medium`) |
| `--mdc-carousel-medium-item-shape-*` | `20px` (`Shape.LargeIncreased`) |
| `--mdc-carousel-large-item-shape-*` | `28px` (`Shape.ExtraLarge`) |
| `--mdc-carousel-item-spacing` | `8px` |
| `--mdc-carousel-item-height` | `auto` |
| `--mdc-carousel-container-padding-*` | `8px 16px` |
| `--mdc-carousel-caption-color` | `#ffffff` |
| `--mdc-carousel-caption-scrim-color` | `rgba(0, 0, 0, 0.65)` |
| `--mdc-carousel-caption-padding-*` | `16px` |
