# Banner (`<mdc-banner>`)

A Material Design banner displays an important, succinct message in-flow (typically below a top app bar) and provides 1–2 actions for users to address or dismiss it. Unlike a snackbar, a banner is persistent and pushes page content rather than floating over it.

## Basic Usage

```html
<mdc-banner
    icon="wifi_off"
    primary-action="Turn on Wi-Fi"
    secondary-action="Dismiss"
    dismiss-on-action
>
    Your device is currently offline. Some features may be unavailable.
</mdc-banner>
```

## Properties

| Property | Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `open` | `open` | `boolean` | `true` | Controls whether the banner is expanded and visible in layout flow. |
| `variant` | `variant` | `'surface' \| 'surface-container' \| 'primary-container' \| 'secondary-container' \| 'tertiary-container' \| 'error-container' \| 'inverse-surface'` | `'surface'` | Color variant of the banner. |
| `layout` | `layout` | `'auto' \| 'single-line' \| 'stacked'` | `'auto'` | Arrangement of message and action buttons. |
| `headline` | `headline` | `string` | `''` | Optional short headline above the message. |
| `supportingText` | `supporting-text` | `string` | `''` | Optional supporting text (alternative to default slot). |
| `icon` | `icon` | `string` | `''` | Optional leading Material Symbol icon name. |
| `iconContainer` | `icon-container` | `boolean` | `false` | Wraps the leading icon in a 40px circular tinted container. |
| `primaryAction` | `primary-action` | `string` | `''` | Optional label for the built-in primary text action button. |
| `secondaryAction` | `secondary-action` | `string` | `''` | Optional label for the built-in secondary text action button. |
| `noDivider` | `no-divider` | `boolean` | `false` | Hides the 1px bottom hairline divider. |
| `dismissOnAction` | `dismiss-on-action` | `boolean` | `false` | Closes the banner automatically when a built-in action is clicked (unless prevented). |
| `quick` | `quick` | `boolean` | `false` | Skips open/close expand-collapse animations. |

## Slots

- *(default)*: Banner message / supporting text.
- `icon`: Custom leading icon or illustration.
- `headline`: Custom headline content above the message.
- `primary-action`: Custom primary action control (e.g. `<mdc-button>`).
- `secondary-action`: Custom secondary action control.
- `actions`: Arbitrary custom action controls.

## Events

- `banner-opening`: Fired when the banner starts opening.
- `banner-opened`: Fired when the banner finishes opening.
- `banner-closing`: Fired when the banner starts closing (`detail.reason`).
- `banner-closed`: Fired when the banner finishes closing (`detail.reason`).
- `banner-primary-action`: Fired when the built-in primary action button is clicked (cancelable).
- `banner-secondary-action`: Fired when the built-in secondary action button is clicked (cancelable).
