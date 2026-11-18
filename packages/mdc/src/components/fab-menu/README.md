# FAB Menu (`<mdc-fab-menu>` & `<mdc-fab-menu-item>`)

Material Design 3 Expressive FAB menu component (`mdc-fab-menu` and `mdc-fab-menu-item`).

## Usage

```html
<mdc-fab-menu variant="primary">
    <mdc-fab-menu-item>
        <mdc-icon slot="icon" name="edit"></mdc-icon>
        Compose
    </mdc-fab-menu-item>
    <mdc-fab-menu-item>
        <mdc-icon slot="icon" name="share"></mdc-icon>
        Share
    </mdc-fab-menu-item>
</mdc-fab-menu>
```

## `<mdc-fab-menu>` Properties

| Property | Attribute | Type | Default |
| --- | --- | --- | --- |
| `variant` | `variant` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` |
| `size` | `size` | `'small' \| 'medium' \| 'large'` | `'small'` |
| `expanded` | `expanded` | `boolean` | `false` |
| `horizontalAlignment` | `horizontal-alignment` | `'start' \| 'center' \| 'end'` | `'end'` |
| `disabled` | `disabled` | `boolean` | `false` |
| `closeOnSelect` | `close-on-select` | `boolean` | `true` |
| `closeAriaLabel` | `close-aria-label` | `string \| null` | `null` |

## `<mdc-fab-menu-item>` Properties

| Property | Attribute | Type | Default |
| --- | --- | --- | --- |
| `variant` | `variant` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` (synced from parent) |
| `disabled` | `disabled` | `boolean` | `false` |
| `href` | `href` | `string \| null` | `null` |
| `target` | `target` | `string \| null` | `null` |
| `keepOpen` | `keep-open` | `boolean` | `false` |
