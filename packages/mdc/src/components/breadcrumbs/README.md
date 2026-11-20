# Breadcrumbs (`<mdc-breadcrumbs>` / `<mdc-breadcrumb-item>`)

Material Design 3 hierarchical navigation trail component with path collapsing, overflow `<mdc-menu>`, customizable separators, and full WAI-ARIA `<nav>` + `<ol>` semantics.

## Usage

### Slotted items

```html
<mdc-breadcrumbs>
    <mdc-breadcrumb-item href="#home" icon="home">Home</mdc-breadcrumb-item>
    <mdc-breadcrumb-item href="#components">Components</mdc-breadcrumb-item>
    <mdc-breadcrumb-item href="#navigation">Navigation</mdc-breadcrumb-item>
    <mdc-breadcrumb-item>Breadcrumbs</mdc-breadcrumb-item>
</mdc-breadcrumbs>
```

### Collapsed overflow (`max-items`)

```html
<mdc-breadcrumbs max-items="4" items-before-collapse="1" items-after-collapse="2">
    <mdc-breadcrumb-item href="#root">Root</mdc-breadcrumb-item>
    <mdc-breadcrumb-item href="#org">Organization</mdc-breadcrumb-item>
    <mdc-breadcrumb-item href="#team">Design Systems</mdc-breadcrumb-item>
    <mdc-breadcrumb-item href="#tokens">Tokens</mdc-breadcrumb-item>
    <mdc-breadcrumb-item>Typography</mdc-breadcrumb-item>
</mdc-breadcrumbs>
```

## Properties

| Property | Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `variant` | `variant` | `'standard' \| 'tonal' \| 'outlined'` | `'standard'` | Visual style variant |
| `size` | `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Control size scale |
| `shape` | `shape` | `'round' \| 'square'` | `'round'` | Corner shape axis |
| `separator` | `separator` | `'chevron' \| 'slash' \| 'arrow' \| string` | `'chevron'` | Separator preset or custom text |
| `maxItems` | `max-items` | `number` | `0` | Max visible items before collapsing (`0` disables) |
| `itemsBeforeCollapse` | `items-before-collapse` | `number` | `1` | Leading items kept visible when collapsed |
| `itemsAfterCollapse` | `items-after-collapse` | `number` | `2` | Trailing items kept visible when collapsed |
| `collapseMode` | `collapse-mode` | `'menu' \| 'expand'` | `'menu'` | Behavior on ellipsis click |
| `items` | — | `IBreadcrumbDataItem[]` | `[]` | Optional programmatic data items |
