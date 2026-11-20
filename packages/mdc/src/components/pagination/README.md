# Pagination (`<mdc-pagination>`)

Material Design 3 Expressive pagination component supporting numbered pages, compact table footer, simple stepper, and Android `HorizontalPager`-style morphing dot indicators.

## Variants & Options

- **`PaginationVariant`**: `standard`, `compact`, `simple`, `dots`
- **`PaginationSize`**: `small`, `medium`, `large`
- **`PaginationShape`**: `round`, `square`

## Usage

```html
<mdc-pagination page="3" total-pages="20" show-edges></mdc-pagination>

<mdc-pagination variant="compact" total-items="200" page-size="10"></mdc-pagination>

<mdc-pagination variant="dots" total-pages="8" page="2"></mdc-pagination>
```
