# Accordion & Expansion Panel (`<mdc-accordion>` / `<mdc-expansion-panel>`)

A Material Design 3 Accordion & Expansion Panel component pair inspired by Android / AndroidX (`ExpandableListView`, `PreferenceCategory`, `MaterialCardView`, and Jetpack Compose `AnimatedVisibility`) patterns.

## Usage

```html
<mdc-accordion mode="single" variant="outlined">
    <mdc-expansion-panel headline="Personal details" supporting-text="Name, email, and phone" icon="person" expanded>
        <p>Update your personal information and contact preferences.</p>
        <mdc-button slot="actions" variant="text">Edit</mdc-button>
    </mdc-expansion-panel>
    <mdc-expansion-panel headline="Notifications" supporting-text="Email & push alerts" icon="notifications">
        <p>Choose which notifications you would like to receive.</p>
    </mdc-expansion-panel>
</mdc-accordion>
```

## `<mdc-accordion>` Attributes

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `mode` | `mode` | `'multiple' \| 'single'` | `'multiple'` | Whether multiple panels or only one panel can be open at a time. |
| `collapsible` | `collapsible` | `boolean` | `true` | In `'single'` mode, whether the active panel can be collapsed by clicking it. |
| `variant` | `variant` | `'outlined' \| 'elevated' \| 'filled' \| 'flat'` | `'outlined'` | Default visual style propagated to child panels. |
| `size` | `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Default header density propagated to child panels. |
| `shape` | `shape` | `'round' \| 'square'` | `'round'` | Default corner shape propagated to child panels. |
| `connected` | `connected` | `boolean` | `false` | Joins child panels into a flush vertical stack. |
| `quick` | `quick` | `boolean` | `false` | Disables expand/collapse animations on child panels. |

## `<mdc-expansion-panel>` Attributes

| Property | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `expanded` | `expanded` | `boolean` | `false` | Controls whether the panel body is expanded. |
| `disabled` | `disabled` | `boolean` | `false` | Disables user interaction. |
| `variant` | `variant` | `'outlined' \| 'elevated' \| 'filled' \| 'flat'` | `'outlined'` | Visual style variant. |
| `size` | `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Header density size. |
| `shape` | `shape` | `'round' \| 'square'` | `'round'` | Corner shape. |
| `headline` | `headline` | `string` | `''` | Header title text. |
| `supportingText` | `supporting-text` | `string` | `''` | Header summary/description text. |
| `icon` | `icon` | `string` | `''` | Leading Material Symbols icon name. |
| `expandIcon` | `expand-icon` | `string` | `'expand_more'` | Trailing expand/collapse icon name. |
| `hideIndicator` | `hide-indicator` | `boolean` | `false` | Hides the trailing expand indicator. |
| `hideSummaryOnExpand` | `hide-summary-on-expand` | `boolean` | `false` | Hides `supporting-text` while expanded. |
| `noDivider` | `no-divider` | `boolean` | `false` | Hides the bottom divider in `flat` variant or above `actions`. |
| `headingLevel` | `heading-level` | `number` | `0` | Optional ARIA heading level (`1`–`6`). |
| `quick` | `quick` | `boolean` | `false` | Disables expand/collapse animations. |

## Events

- `expansion-panel-toggle`: Cancelable event fired before toggling via user click (`detail: { expanded }`).
- `expansion-panel-expanding` / `expansion-panel-expanded`: Fired on expand start/end.
- `expansion-panel-collapsing` / `expansion-panel-collapsed`: Fired on collapse start/end.
- `accordion-change`: Fired on `<mdc-accordion>` when panel expansion changes (`detail: { expandedIndices, expandedPanels, changedPanel, expanded }`).
