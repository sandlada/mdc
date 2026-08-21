# App Bar (`<mdc-appbar>`)

Material Design 3 and MD3 Expressive App Bar component.

## Features

- **Variants**:
  - `small` (default): 64px standard top app bar
  - `center-aligned`: 64px top app bar with centered headline
  - `medium-flexible` (or `medium`): Multi-line flexible medium app bar that hugs content
  - `large-flexible` (or `large`): Multi-line flexible large app bar with prominent headline
  - `search`: Search app bar with embedded pill search container
- **Text Alignment**:
  - `start` (default): Leading edge alignment
  - `center`: Centered headline and subtitle
- **Subtitle Support**: Subtitle text automatically expands height flexibly in medium and large variants.
- **Scroll Behavior & States**:
  - Flat (resting) vs Scrolled state (`scrolled` attribute)
  - Surface color switching (Surface -> SurfaceContainer)
  - Auto-scroll detection with `scroll-target="window"` or `scroll-target="#container"`
  - Elevation tinting on scroll
- **Slots**:
  - `leading`: Navigation icon button or menu button
  - `headline`: Title text or custom element (e.g. logo / image)
  - `subtitle`: Subtitle text or supporting elements
  - `trailing` / default slot: Action icon buttons, avatar, overflow menu
  - `search`, `search-leading`, `search-input`, `search-trailing`: For search variant customization

## Usage

```html
<!-- Standard Small App Bar -->
<mdc-appbar headline="Inbox">
  <mdc-icon-button slot="leading"><mdc-icon>menu</mdc-icon></mdc-icon-button>
  <mdc-icon-button slot="trailing"><mdc-icon>search</mdc-icon></mdc-icon-button>
  <mdc-icon-button slot="trailing"><mdc-icon>more_vert</mdc-icon></mdc-icon-button>
</mdc-appbar>

<!-- Medium Flexible App Bar with Subtitle -->
<mdc-appbar
  variant="medium-flexible"
  headline="Daily activities"
  subtitle="Record new fitness goals"
>
  <mdc-icon-button slot="leading"><mdc-icon>arrow_back</mdc-icon></mdc-icon-button>
  <mdc-icon-button slot="trailing"><mdc-icon>add</mdc-icon></mdc-icon-button>
</mdc-appbar>

<!-- Search App Bar -->
<mdc-appbar variant="search" headline="Search product">
  <mdc-icon-button slot="leading"><mdc-icon>menu</mdc-icon></mdc-icon-button>
  <mdc-icon-button slot="trailing"><mdc-icon>account_circle</mdc-icon></mdc-icon-button>
</mdc-appbar>
```
