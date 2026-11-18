# Scaffold (`<mdc-scaffold>`)

Material Design 3 `scaffold` component (`mdc-scaffold`).

Web equivalent of Android Jetpack Compose Material 3 `Scaffold` plus
`NavigationSuiteScaffold` width and height window-size-class behaviour:
`https://developer.android.com/reference/kotlin/androidx/compose/material3/Scaffold`

## Variants & Options

- **`ScaffoldFabPosition`**: `start`, `center`, `end`, `end-overlay` (canonical Android `FabPosition`)
  - `start`: above bottom bar, inline-start 16dp (`FabPosition.Start`)
  - `center`: above bottom bar, centered (`FabPosition.Center`, RTL-safe)
  - `end`: above bottom bar, inline-end 16dp (`FabPosition.End`, default)
  - `end-overlay`: overlaying bottom bar, 16dp from bottom (`FabPosition.EndOverlay`)
- **`ScaffoldScrollMode`**: `body`, `window`
- **`ScaffoldRailLayout`**: `full-height`, `below-appbar`
- **`ScaffoldLayoutMode`**: `auto`, `compact`, `medium`, `expanded`, `large`, `extra-large`
  - Width breakpoints (`WIDTH_DP_*_LOWER_BOUND`): `<600`, `600-839`, `840-1199`, `1200-1599`, `1600+`
  - Height breakpoints (`HEIGHT_DP_*_LOWER_BOUND`): `<480` (`compact`), `480-899` (`medium`), `900+` (`expanded`)
- **`ScaffoldAdaptiveNavigation`**: `auto`, `off`, `none`, `navigation-bar`, `navigation-rail`, `navigation-drawer`
  - `auto` (default): mirrors `NavigationSuiteScaffoldDefaults.calculateFromAdaptiveInfo` across `navigation-bar`, `rail`/`start-rail`, and `drawer`/`start-drawer` (while keeping non-navigation `slot="bottom-bar"` visible).
- **`ScaffoldContentPaddingMode`**: `inset`, `docked`, `manual`
  - `inset` (default): body spans `1 / -1` behind `appbar` and `bottom-bar` with automatic `innerPadding` (`padding-block-start` / `padding-block-end` + `scroll-padding-*`), enabling translucent/blurred bars while keeping resting content unobscured.
  - `docked`: body occupies the `[body] 1fr` grid row between `appbar` and `bottom-bar`.
  - `manual`: body spans `1 / -1` with zero automatic padding; consume `--mdc-scaffold-inner-padding-*`, `getInnerPadding()`, or `scaffold-layout-change`.

## Usage

```html
<mdc-scaffold>
  <mdc-appbar slot="appbar" headline="Home"></mdc-appbar>
  <mdc-navigation-rail slot="rail"></mdc-navigation-rail>
  <mdc-navigation-bar slot="navigation-bar"></mdc-navigation-bar>
  <div>Body content</div>
  <mdc-fab slot="fab" icon="add"></mdc-fab>
  <mdc-snackbar-host slot="snackbar-host"></mdc-snackbar-host>
</mdc-scaffold>
```

## Properties

| Property | Type | Default |
| --- | --- | --- |
| `railLayout` | `ScaffoldRailLayout` | `'full-height'` |
| `fabPosition` | `ScaffoldFabPosition` | `'end'` |
| `scrollMode` | `ScaffoldScrollMode` | `'body'` |
| `layoutMode` | `ScaffoldLayoutMode` | `'auto'` |
| `adaptiveNavigation` | `ScaffoldAdaptiveNavigation` | `'auto'` |
| `contentPaddingMode` | `ScaffoldContentPaddingMode` | `'inset'` |
| `effectiveLayoutMode` | `Exclude<ScaffoldLayoutMode, 'auto'>` (readonly) | `'compact'` |
| `effectiveHeightMode` | `ScaffoldHeightMode` (readonly) | `'medium'` |
| `effectiveNavigationType` | `ScaffoldNavigationType` (readonly) | `'none'` |
| `avoidSafeArea` | `boolean` | `false` |

## Events

- `scaffold-layout-change`: Fired when `effectiveLayoutMode`, `effectiveHeightMode`, `effectiveNavigationType`, or `innerPadding` changes (`IMDCScaffoldLayoutChangeDetail`).

## Slots

- `appbar`
- `bottom-bar`
- `bottom-sheet`
- `default`
- `drawer`
- `end-drawer`
- `end-rail`
- `fab`
- `navigation-bar`
- `rail`
- `side-sheet`
- `snackbar-host`
- `start-drawer`
- `start-rail`
- `trailing-rail`
