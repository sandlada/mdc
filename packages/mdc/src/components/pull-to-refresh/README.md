# Pull to Refresh (`<mdc-pull-to-refresh>`)

Material Design 3 Expressive pull-to-refresh container modeled after Android Jetpack Compose `PullToRefreshBox` and Flutter `RefreshIndicator`.

## Usage

```html
<mdc-pull-to-refresh indicator="expressive" style="height: 360px;">
    <mdc-list>
        <mdc-list-item headline="Item 1"></mdc-list-item>
        <mdc-list-item headline="Item 2"></mdc-list-item>
    </mdc-list>
</mdc-pull-to-refresh>
```

```js
const ptr = document.querySelector('mdc-pull-to-refresh')
ptr.addEventListener('refresh', async () => {
    await fetchLatest()
    ptr.complete()
})
```

## Properties

| Property | Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `refreshing` | `refreshing` | `boolean` | `false` | Active refreshing state |
| `disabled` | `disabled` | `boolean` | `false` | Disables pull gesture |
| `indicator` | `indicator` | `'expressive' \| 'circular'` | `'expressive'` | MD3E morphing indicator or classic circular spinner |
| `variant` | `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'surface'` | `'primary'` | Color role |
| `mode` | `mode` | `'overlay' \| 'push'` | `'overlay'` | Floating overlay or content-pushing layout |
| `threshold` | `threshold` | `number` | `80` | Pull distance (px) required to trigger refresh |
| `maxPullDistance` | `max-pull-distance` | `number` | `144` | Max damped pull distance (px) |
| `dragMultiplier` | `drag-multiplier` | `number` | `0.5` | Drag resistance multiplier before threshold |
