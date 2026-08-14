# Carousel

A horizontal, scroll-snap carousel container that lays out its
`mdc-carousel-item` children in **large / medium / small** widths.

The carousel is not part of `@material/web`; it mirrors the **Jetpack Compose
Material 3** carousel (`HorizontalMultiBrowseCarousel` /
`HorizontalUncontainedCarousel`). For a horizontal carousel the three item
sizes differ **only in width and corner roundness** — every cell shares one
height and one interaction model.

## Elements

| Element             | Role                                             |
| ------------------- | ------------------------------------------------ |
| `mdc-carousel`      | The container — owns layout, scroll-snap, focus  |
| `mdc-carousel-item` | A sized cell; declares `size`, tracks `active`   |

## Usage

```html
<mdc-carousel>
    <mdc-carousel-item size="large">…</mdc-carousel-item>
    <mdc-carousel-item size="medium">…</mdc-carousel-item>
    <mdc-carousel-item size="small">…</mdc-carousel-item>
    <mdc-carousel-item size="large">…</mdc-carousel-item>
</mdc-carousel>
```

## Sizing

Item widths derive from `preferred-item-width` (default **186px**):

| Size     | Width                                              | Corner roundness |
| -------- | -------------------------------------------------- | ---------------- |
| `large`  | `min(preferred-item-width, container width)`       | 28px             |
| `medium` | `(large + small) / 2`                              | 20px             |
| `small`  | `clamp(large / 3, 40px, 56px)`                     | 12px             |

Every value is overridable through the `--mdc-carousel-*` CSS custom
properties below. Widths are recomputed when the container resizes.

## Variants

- **`multi-browse`** (default) — the row mixes large / medium / small items.
  Items snap to the leading keyline and the row clips at the container edge.
- **`uncontained`** — all items share one width and the row scrolls freely
  (no snap), with the trailing item peeking at the edge.

## Properties

### `mdc-carousel`

| Property              | Attribute             | Type                   | Default         |
| --------------------- | --------------------- | ---------------------- | --------------- |
| `variant`             | `variant`             | `'multi-browse' \| 'uncontained'` | `'multi-browse'` |
| `preferredItemWidth`  | `preferred-item-width`| `number`               | `186`           |
| `activeIndex`         | *(read only)*         | `number`               | `-1`            |

### `mdc-carousel-item`

| Property | Attribute | Type                          | Default   |
| -------- | --------- | ----------------------------- | --------- |
| `size`   | `size`    | `'large' \| 'medium' \| 'small'` | `'medium'` |
| `active` | `active`  | `boolean`                     | `false`   |
| `index`  | `index`   | `number`                      | `0`       |

## Events

| Event                       | Detail                          | Description                            |
| --------------------------- | ------------------------------- | -------------------------------------- |
| `carousel-active-change`    | `{ item, index }`               | Fired when the focal (leading) item changes. |

## Methods

- `scrollToItem(index)` — scrolls the item at `index` to the leading keyline
  (smooth). Also driven by `←` / `→` / `Home` / `End` when the carousel is
  focused (`tabindex="0"`).

## CSS custom properties

| Property | Default |
| -------- | ------- |
| `--mdc-carousel-large-item-width` | computed |
| `--mdc-carousel-medium-item-width` | computed |
| `--mdc-carousel-small-item-width` | computed |
| `--mdc-carousel-large-item-shape` | `28px` |
| `--mdc-carousel-medium-item-shape` | `20px` |
| `--mdc-carousel-small-item-shape` | `12px` |
| `--mdc-carousel-item-spacing` | `8px` |
| `--mdc-carousel-leading-padding` | `16px` |
| `--mdc-carousel-trailing-padding` | `16px` |
| `--mdc-carousel-top-padding` | `8px` |
| `--mdc-carousel-bottom-padding` | `8px` |
| `--mdc-carousel-item-height` | `auto` (stretched to tallest) |
