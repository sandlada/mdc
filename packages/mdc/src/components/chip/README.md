# Chip

Material Design 3 chip components (`mdc-chip` and `mdc-chip-set`) modeled after the **Material Design 3 Figma Design Kit**, **Jetpack Compose Material 3**, **MDC-Android**, and **Flutter Material 3**.

## Elements

| Element | Role |
| --- | --- |
| `mdc-chip` | Interactive chip element supporting `assist`, `filter`, `input`, and `suggestion` variants |
| `mdc-chip-set` | Grouping container with RTL-aware roving tabindex, `single-select`, `selection-required`, and `single-line` layout |

## Usage

```html
<mdc-chip-set aria-label="Travel options">
    <mdc-chip variant="assist" label="Add to calendar">
        <mdc-icon slot="icon">event</mdc-icon>
    </mdc-chip>

    <mdc-chip variant="filter" selected label="Nonstop"></mdc-chip>

    <mdc-chip variant="input" label="Alex Morgan">
        <span slot="avatar">A</span>
    </mdc-chip>

    <mdc-chip variant="suggestion" label="Flexible dates"></mdc-chip>
</mdc-chip-set>
```

## Variants

- **`assist`** (default) — smart or contextual action trigger (`chip-navigate`), supports `elevated`, `slot="icon"`, and `href`.
- **`filter`** — toggleable selection (`chip-toggle`, `role="checkbox"`), supports animated checkmark (replacing any `slot="icon"` when selected), `hide-checkmark`, `slot="selected-icon"`, `slot="trailing-icon"`, and `elevated`.
- **`input`** — discrete user-entered entity or tag (`chip-toggle`, `chip-close`), supports 24dp circular `slot="avatar"` (or `avatar` attribute with `slot="icon"`) with selected checkmark badge, trailing remove button (`no-remove` to omit, `remove-only` to make only close interactive), and `Delete`/`Backspace` removal.
- **`suggestion`** — dynamically generated recommendation (`chip-navigate`), supports `elevated`, `slot="icon"`, and `href`.

## Properties

### `mdc-chip`

| Property | Attribute | Type | Default |
| --- | --- | --- | --- |
| `variant` | `variant` | `'assist' \| 'filter' \| 'input' \| 'suggestion'` | `'assist'` |
| `selected` | `selected` | `boolean` | `false` |
| `disabled` | `disabled` | `boolean` | `false` |
| `softDisabled` | `soft-disabled` | `boolean` | `false` |
| `alwaysFocusable` | `always-focusable` | `boolean` | `false` |
| `elevated` | `elevated` | `boolean` | `false` |
| `href` | `href` | `string` | `''` |
| `target` | `target` | `string` | `''` |
| `label` | `label` | `string` | `''` |
| `value` | `value` | `string` | `''` |
| `avatar` | `avatar` | `boolean` | `false` |
| `ariaLabelRemove` | `aria-label-remove` | `string` | `''` |
| `removeOnly` | `remove-only` | `boolean` | `false` |
| `noRemove` | `no-remove` | `boolean` | `false` |
| `hideCheckmark` | `hide-checkmark` | `boolean` | `false` |

### `mdc-chip-set`

| Property | Attribute | Type | Default |
| --- | --- | --- | --- |
| `singleSelect` | `single-select` | `boolean` | `false` |
| `selectionRequired` | `selection-required` | `boolean` | `false` |
| `singleLine` | `single-line` | `boolean` | `false` |
| `chips` | *(read only)* | `IMDCChip[]` | `[]` |
| `selectedChips` | *(read only)* | `IMDCChip[]` | `[]` |
| `selectedValues` | *(read only)* | `string[]` | `[]` |
