# App Bar (`<mdc-appbar>`)

Material Design 3 and M3 Expressive App Bar component.

## Features

- **Variants**:
  - `small` (default): 64px standard top app bar
  - `center-aligned`: 64px top app bar with mathematically centered headline
  - `medium-flexible` (`medium`): Multi-line flexible medium app bar (112px min-height, collapses to 64px)
  - `large-flexible` (`large`): Multi-line flexible large app bar (120px min-height, collapses to 64px)
  - `search`: 64px search app bar with embedded 48px pill search container
- **Text Alignment**:
  - `start` (default): Leading edge alignment
  - `center`: Centered headline, subtitle, and search placeholder
- **Scroll Behavior & States**:
  - `scroll-behavior="pinned"` (default) or `"collapse"` (for `medium-flexible` / `large-flexible`)
  - `scrolled` & `collapsed` reflected attributes with `scroll-state-change` event
  - Auto-scroll detection with `scroll-target="window"` or `scroll-target="#container"`
- **Search Coordination**:
  - `for="<search-view-id>"` automatically opens a linked `<mdc-search-view>` on search box activation (`search-click` event)
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

<!-- Collapsible Medium Flexible App Bar with Subtitle -->
<mdc-appbar
  variant="medium-flexible"
  scroll-behavior="collapse"
  scroll-target="#scroll-body"
  headline="Daily activities"
  subtitle="Record new fitness goals"
>
  <mdc-icon-button slot="leading"><mdc-icon>arrow_back</mdc-icon></mdc-icon-button>
  <mdc-icon-button slot="trailing"><mdc-icon>add</mdc-icon></mdc-icon-button>
</mdc-appbar>

<!-- Search App Bar linked to SearchView -->
<mdc-appbar variant="search" headline="Search product" for="product-search">
  <mdc-icon-button slot="leading"><mdc-icon>menu</mdc-icon></mdc-icon-button>
  <mdc-icon-button slot="trailing"><mdc-icon>account_circle</mdc-icon></mdc-icon-button>
</mdc-appbar>
<mdc-search-view id="product-search" supporting-text="Search product"></mdc-search-view>
```
