# Dialog (`<mdc-basic-dialog>`, `<mdc-fullscreen-dialog>`)

Material Design 3 `dialog` components (`mdc-basic-dialog` and `mdc-fullscreen-dialog`).

## Usage

```html
<mdc-basic-dialog>
    <span slot="headline">Dialog title</span>
    <p slot="content">Supporting text</p>
    <mdc-button slot="actions" variant="text"><span>OK</span></mdc-button>
</mdc-basic-dialog>

<mdc-fullscreen-dialog>
    <span slot="headline">Full-screen title</span>
    <mdc-button slot="actions" variant="text"><span>Save</span></mdc-button>
    <div slot="content">Form or complex content</div>
</mdc-fullscreen-dialog>
```

## Properties

| Property | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | `false` |
| `quick` | `boolean` | `false` |
| `returnValue` | `string` | `''` |
| `type` | `'alert' \| ''` | `''` |
| `noFocusTrap` | `boolean` | `false` |
| `dismissOnClickOutside` | `boolean` | `true` |
| `dismissOnEscape` | `boolean` | `true` |
| `closeLabel` (`mdc-fullscreen-dialog`) | `string` | `'Close'` |

## Events

- `cancel`
- `close`
- `closed`
- `open`
- `opened`

## Slots

### `mdc-basic-dialog`
- `icon`
- `headline`
- `content`
- `actions`

### `mdc-fullscreen-dialog`
- `close`
- `headline`
- `actions`
- `content`
