# MDC Navigation Rail

Material Design 3 Navigation Rail component (`<mdc-navigation-rail>`) built with Lit and Web Components.

The rail ships with two companion components: `<mdc-navigation-rail-section>`
groups the destinations of the rail, and `<mdc-navigation-rail-section-header>`
labels such a group.

- [Overview & Guidelines](https://m3.material.io/components/navigation-rail/overview)
- [Design Specs](https://m3.material.io/components/navigation-rail/specs)

---

## Features

- **4 Variants** expressed by a single `variant` property:
  - `collapsed` (default): docked, narrow rail, icon-above-label destinations.
  - `expanded-docked`: docked, wide rail, icon-next-to-label destinations.
  - `expanded-floating`: floating overlay above the content with a scrim backdrop, always wide.
  - `xr`: docked XR rail with XR destinations.
- **Collapsed Layout**: `collapsed-layout="vertical"` (icon on top, label underneath) or `collapsed-layout="round"` (icon only, inside a round container).
- **Navigation Scope Synchronization**: Integrates with `GlobalNavigationStateStore` and `<mdc-navigation-tab>` to sync active destinations across bars, rails, and drawers sharing the same `navigation-scope`.
- **Sections**: Destinations are grouped in `<mdc-navigation-rail-section>`. A section labels its group with an `<mdc-navigation-rail-section-header slot="header">`, which is an expanded-rail affordance — collapsed and XR rails group their destinations in headerless sections.
- **Inner Anatomy & Slots**:
  - `menu` slot: Menu button (typically toggles the rail).
  - `fab` slot: Floating action button pinned below the menu.
  - `header` slot: Optional rail header.
  - Default slot: Navigation destinations, grouped in `<mdc-navigation-rail-section>` (`<mdc-navigation-tab>`).
  - `end` slot: Trailing actions (e.g. settings).
  - `footer` slot: Bottom pinned actions.
  - Automatic top/bottom scroll dividers with intersection observer detection.
- **Morphing Choreography**: The destination label is hidden while the rail morphs between the collapsed and the expanded layout and revealed once the new layout settled.
- **CSS-driven Motion**: The floating rail slides in from the edge it is docked to and fades in; the exit motion is reversed and the rail stays painted until it finished. The motion is expressed in CSS (`@starting-style` + `transition`), enters from the correct edge under `dir="rtl"`, and is skipped by `quick` and `prefers-reduced-motion`.

---

## Installation & Import

```typescript
import '@sandlada/mdc/components/navigation-rail/index'
import '@sandlada/mdc/components/navigation-tab/index'
import '@sandlada/mdc/components/icon/index'
```

The navigation rail entry registers `<mdc-navigation-rail>` together with
`<mdc-navigation-rail-section>` and `<mdc-navigation-rail-section-header>`.

---

## Anatomy

```plaintext
|-----------------------
|
|   Menu Icon Button Slot
|
|   Fab Slot
|
|   |---------------| |
|   | SectionHeader | |
|   | Tab Slot 1    | |
|   |_______________| |
|                     | Scrollable
|   |---------------| |
|   | SectionHeader | |
|   | Tab Slot 2    | |
|   |_______________| |
|
|   End Slot
|_______________________
```

Every group of destinations lives in an `<mdc-navigation-rail-section>`. The
`SectionHeader` rows are `<mdc-navigation-rail-section-header>` elements
assigned to the `header` slot of their section.

---

## Usage

### Collapsed Rail

```html
<mdc-navigation-rail navigation-scope="main-nav">
    <mdc-icon-button slot="menu"><mdc-icon>menu</mdc-icon></mdc-icon-button>
    <mdc-navigation-rail-section>
        <mdc-navigation-tab name="rail" value="/home" checked label="Home">
            <mdc-icon slot="inactive-icon">home</mdc-icon>
            <mdc-icon slot="active-icon" filled>home</mdc-icon>
        </mdc-navigation-tab>
    </mdc-navigation-rail-section>
</mdc-navigation-rail>
```

### Expanded, Docked Rail

```html
<mdc-navigation-rail variant="expanded-docked" navigation-scope="main-nav">
    <mdc-icon-button slot="menu"><mdc-icon>menu_open</mdc-icon></mdc-icon-button>
    <mdc-navigation-rail-section>
        <mdc-navigation-tab name="rail" value="/home" checked label="Home">
            <mdc-icon slot="inactive-icon">home</mdc-icon>
            <mdc-icon slot="active-icon" filled>home</mdc-icon>
        </mdc-navigation-tab>
    </mdc-navigation-rail-section>
</mdc-navigation-rail>
```

### Sections

Destinations are grouped in `<mdc-navigation-rail-section>`. An expanded rail
labels every group with an `<mdc-navigation-rail-section-header slot="header">`.

```html
<mdc-navigation-rail variant="expanded-docked">
    <mdc-navigation-rail-section>
        <mdc-navigation-rail-section-header slot="header">Main</mdc-navigation-rail-section-header>
        <mdc-navigation-tab name="rail" value="/home" checked label="Home">
            <mdc-icon slot="inactive-icon">home</mdc-icon>
            <mdc-icon slot="active-icon" filled>home</mdc-icon>
        </mdc-navigation-tab>
    </mdc-navigation-rail-section>

    <mdc-navigation-rail-section>
        <mdc-navigation-rail-section-header slot="header">Library</mdc-navigation-rail-section-header>
        <mdc-navigation-tab name="rail" value="/inbox" label="Inbox">
            <mdc-icon slot="inactive-icon">inbox</mdc-icon>
            <mdc-icon slot="active-icon" filled>inbox</mdc-icon>
        </mdc-navigation-tab>
    </mdc-navigation-rail-section>
</mdc-navigation-rail>
```

The section header is optional — a section without one is a plain group of
destinations. Section headers label a group, so they are meant for the expanded
variants; a collapsed or XR rail groups its destinations in headerless sections.

### Floating Rail

```html
<mdc-button onclick="document.querySelector('#floating-rail').show()">Open Rail</mdc-button>

<mdc-navigation-rail id="floating-rail" variant="expanded-floating">
    <mdc-icon-button slot="menu" onclick="this.closest('mdc-navigation-rail').hide()">
        <mdc-icon>close</mdc-icon>
    </mdc-icon-button>
    <mdc-navigation-rail-section>
        <mdc-navigation-tab name="rail" value="/settings" checked label="Settings">
            <mdc-icon slot="inactive-icon">settings</mdc-icon>
            <mdc-icon slot="active-icon" filled>settings</mdc-icon>
        </mdc-navigation-tab>
    </mdc-navigation-rail-section>
</mdc-navigation-rail>
```

### XR Rail

```html
<mdc-navigation-rail variant="xr">
    <mdc-navigation-rail-section>
        <mdc-navigation-tab name="rail" value="/home" checked label="Home">
            <mdc-icon slot="inactive-icon">home</mdc-icon>
            <mdc-icon slot="active-icon" filled>home</mdc-icon>
        </mdc-navigation-tab>
    </mdc-navigation-rail-section>
</mdc-navigation-rail>
```

---

## API

### Properties

| Property          | Attribute          | Type                                                     | Default      | Description                                                                                              |
| ----------------- | ------------------ | -------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| `variant`         | `variant`          | `'collapsed' \| 'expanded-docked' \| 'expanded-floating' \| 'xr'` | `'collapsed'` | The visual state of the rail. Reflected so it can be targeted with CSS selectors.               |
| `collapsedLayout` | `collapsed-layout` | `'vertical' \| 'round'`                                  | `'vertical'`  | Destination layout while the rail is collapsed.                                                          |
| `open`            | `open`             | `boolean`                                                | `false`       | Shows the floating rail. Only meaningful for the `expanded-floating` variant.                             |
| `alignment`       | `alignment`        | `'top' \| 'center' \| 'bottom'`                          | `'top'`       | Vertical alignment of the destination items.                                                              |
| `quick`           | `quick`            | `boolean`                                                | `false`       | Skips all animations.                                                                                      |
| `returnValue`     | `return-value`     | `string`                                                 | `''`          | Return value of the floating rail.                                                                        |
| `noFocusTrap`     | `no-focus-trap`    | `boolean`                                                | `false`       | Disables the automatic focus trap of the floating rail.                                                   |
| `navigationScope` | `navigation-scope` | `string`                                                 | `'global'`    | Scope used to synchronize the active destination with other navigation containers.                        |

### Methods

| Method                        | Description                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `expand()`                    | Switches to the expanded variant. A floating rail stays floating, every other variant becomes `expanded-docked`. |
| `collapse(returnValue?)`      | Switches back to the `collapsed` variant. A floating rail is closed first.                                        |
| `show()`                      | Opens the floating rail. Forwarded to `expand()` on every other variant.                                           |
| `hide(returnValue?)`          | Closes the floating rail. Forwarded to `collapse()` on every other variant.                                       |
| `close(returnValue?)`         | Alias of `hide()`.                                                                                                 |
| `toggle()`                    | Toggles `open` for the floating variant, `collapsed` ⇄ `expanded-docked` for every other variant.                 |

### Events

| Event      | Cancelable | Description                                             |
| ---------- | ---------- | ------------------------------------------------------- |
| `expand`   | Yes        | Fires before the rail expands.                          |
| `expanded` | No         | Fires after the rail expanded.                           |
| `collapse` | Yes        | Fires before the rail collapses.                         |
| `collapsed`| No         | Fires after the rail collapsed.                          |
| `open`     | Yes        | Fires before the floating rail opens.                    |
| `opened`   | No         | Fires after the floating rail opened.                    |
| `close`    | Yes        | Fires before the floating rail closes.                   |
| `closed`   | No         | Fires after the floating rail closed.                    |
| `cancel`   | Yes        | Fires on backdrop click or Escape key (floating variant).|

### `<mdc-navigation-rail-section>`

A group of destinations inside the rail. It has no properties of its own — it
only structures the destinations it holds.

| Slot          | Description                                                                       |
| ------------- | --------------------------------------------------------------------------------- |
| Default slot  | The destinations of the section (`<mdc-navigation-tab>`).                          |
| `header` slot | The label of the section (`<mdc-navigation-rail-section-header>`). Optional.      |

### `<mdc-navigation-rail-section-header>`

The label of a section.

| Slot         | Description                     |
| ------------ | ------------------------------- |
| Default slot | The label text of the section.  |

| Property | Attribute | Type     | Default | Description                                                                                                                                                  |
| -------- | --------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `header` | `header`  | `string` | `null`  | Reserved for an attribute-driven label. The rendered label comes from the default slot, so this property has no effect yet.                                   |

---

## Design Tokens

All tokens are exposed as `--mdc-navigation-rail-*` custom properties and can be overridden per element.

The container tokens are defined once per variant, so every variant can be themed on its own. The variant is the prefix of the token name:

| Token family                            | Applies to          |
| --------------------------------------- | ------------------- |
| `collapsed-container-*`                 | `collapsed` variant |
| `collapsed-segments-*`                  | `collapsed` variant |
| `collapsed-menu-and-fab-*`              | `collapsed` variant |
| `expanded-docked-container-*`           | `expanded-docked` variant |
| `expanded-docked-segments-*`            | `expanded-docked` variant |
| `expanded-docked-menu-and-fab-*`        | `expanded-docked` variant |
| `expanded-floating-container-*`         | `expanded-floating` variant |
| `expanded-floating-segments-*`          | `expanded-floating` variant |
| `expanded-floating-menu-and-fab-*`      | `expanded-floating` variant |
| `xr-container-*`                        | `xr` variant        |
| `xr-segments-*`                         | `xr` variant        |
| `xr-menu-and-fab-*`                     | `xr` variant        |
| `scrim-color`                           | Shared              |
| `scrim-opacity`                         | Shared              |
| `divider-color`                         | Shared              |
| `container-shadow-color`                | Shared              |

The section and the section header expose their own token families:

| Token family                                                 | Applies to                            |
| ------------------------------------------------------------ | ------------------------------------- |
| `section-{variant}-item-between`                              | `<mdc-navigation-rail-section>`       |
| `section-{variant}-padding-*`                                 | `<mdc-navigation-rail-section>`       |
| `section-header-color`                                        | `<mdc-navigation-rail-section-header>` |
| `section-header-{font,size,leading,weight,tracking}`          | `<mdc-navigation-rail-section-header>` |
| `section-header-padding-*`                                    | `<mdc-navigation-rail-section-header>` |

The section tokens carry one value per rail variant, the variant being the
prefix of the token name (`collapsed`, `expandedDocked`, `expandedFloating`,
`xr`). The section header tokens are variant independent.

```css
mdc-navigation-rail-section-header {
    --mdc-navigation-rail-section-header-color: var(--md-sys-color-primary);
}
```

```css
mdc-navigation-rail[variant='expanded-floating'] {
    --mdc-navigation-rail-expanded-floating-container-width: 280px;
}
```
