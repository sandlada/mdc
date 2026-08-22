# MDC Navigation Drawer

Material Design 3 Navigation Drawer component (`<mdc-navigation-drawer>`) built with Lit and Web Components. Strictly conforms to Android 12+, Flutter, and Jetpack Compose MD3 navigation drawer specifications.

- [Overview & Guidelines](https://m3.material.io/components/navigation-drawer/overview)
- [Design Specs](https://m3.material.io/components/navigation-drawer/specs)

---

## Features

- **3 Variants**:
  - `modal` (default): Floating overlay above content with a scrim backdrop, smooth WAAPI entry/exit animations, and swipe-to-dismiss drag gestures.
  - `standard`: In-flow collapsible drawer sharing screen space with main content.
  - `permanent`: Persistent fixed side panel always visible in layout.
- **Docking Edges**: Supports `drawer-edge="start"` (default) and `drawer-edge="end"` with full RTL awareness (`dir="rtl"`).
- **Navigation Scope Synchronization**: Integrates with `GlobalNavigationStateStore` and `<mdc-navigation-tab>` to sync active destinations across bars, rails, and drawers sharing the same `navigation-scope`.
- **Inner Anatomy & Slots**:
  - `header` slot: Profile, avatar, account switcher, or logo.
  - `headline` property & slot: Drawer title/headline (e.g. "Mail", "Inbox") styled with MD3 TitleSmall typography.
  - Default slot: Navigation destinations (`<mdc-navigation-tab>` with `drawer` variant).
  - `footer` slot: Bottom pinned actions, settings, or user info.
  - Automatic top/bottom scroll dividers with intersection observer detection.

---

## Installation & Import

```typescript
import '@sandlada/mdc/components/navigation-drawer/navigation-drawer'
import '@sandlada/mdc/components/navigation-tab/navigation-tab'
import '@sandlada/mdc/components/icon/icon'
```

---

## Usage

### Modal Navigation Drawer

```html
<mdc-button onclick="document.querySelector('#drawer').show()">Open Drawer</mdc-button>

<mdc-navigation-drawer id="drawer" variant="modal" headline="Mail">
    <mdc-navigation-tab name="nav" value="/inbox" checked label="Inbox">
        <mdc-icon slot="inactive-icon">inbox</mdc-icon>
        <mdc-icon slot="active-icon" filled>inbox</mdc-icon>
    </mdc-navigation-tab>
    <mdc-navigation-tab name="nav" value="/outbox" label="Outbox">
        <mdc-icon slot="inactive-icon">send</mdc-icon>
        <mdc-icon slot="active-icon" filled>send</mdc-icon>
    </mdc-navigation-tab>
    <mdc-navigation-tab name="nav" value="/trash" label="Trash">
        <mdc-icon slot="inactive-icon">delete</mdc-icon>
        <mdc-icon slot="active-icon" filled>delete</mdc-icon>
    </mdc-navigation-tab>
</mdc-navigation-drawer>
```

### Standard Navigation Drawer

```html
<div style="display: flex; height: 100vh;">
    <mdc-navigation-drawer variant="standard" open headline="App Navigation">
        <mdc-navigation-tab name="std-nav" value="/home" checked label="Home">
            <mdc-icon slot="inactive-icon">home</mdc-icon>
            <mdc-icon slot="active-icon" filled>home</mdc-icon>
        </mdc-navigation-tab>
        <mdc-navigation-tab name="std-nav" value="/explore" label="Explore">
            <mdc-icon slot="inactive-icon">explore</mdc-icon>
            <mdc-icon slot="active-icon" filled>explore</mdc-icon>
        </mdc-navigation-tab>
    </mdc-navigation-drawer>

    <main style="flex: 1; padding: 24px;">
        <h1>Main Content</h1>
    </main>
</div>
```

---

## API Reference

### Properties & Attributes

| Property | Attribute | Type | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `variant` | `variant` | `'modal' \| 'standard' \| 'permanent'` | `'modal'` | Visual display variant. |
| `open` | `open` | `boolean` | `false` | Controls whether the drawer is open. (Always `true` in permanent mode). |
| `drawerEdge` | `drawer-edge` | `'start' \| 'end'` | `'start'` | Viewport edge to dock to. |
| `headline` | `headline` | `string` | `''` | Title string rendered at the top of the destinations list. |
| `quick` | `quick` | `boolean` | `false` | When true, skips all entry/exit animations. |
| `cancelable` | `cancelable` | `boolean` | `true` | When true (modal only), allows Esc key and scrim tap dismissal. |
| `draggable` | `draggable` | `boolean` | `true` | When true (modal only), enables swipe-to-dismiss gestures. |
| `noFocusTrap` | `no-focus-trap` | `boolean` | `false` | When true (modal only), disables automatic focus trap. |
| `returnValue` | `return-value` | `string` | `''` | Return value dispatched in close events. |
| `navigationScope` | `navigation-scope` | `string` | `'global'` | Scope ID for synchronizing active state with other navigation controls. |

### Methods

| Method | Returns | Description |
| :--- | :--- | :--- |
| `show()` | `Promise<void>` | Imperatively opens the drawer and resolves when entrance animation completes. |
| `hide(reason?, returnValue?)` | `Promise<void>` | Closes the drawer and resolves when exit animation completes. |
| `close(returnValue?)` | `Promise<void>` | Convenience method to close the drawer. |
| `toggle()` | `Promise<void>` | Toggles between open and closed states. |

### Events

| Event | Detail Payload | Description |
| :--- | :--- | :--- |
| `navigation-drawer-opening` | — | Fired when the drawer begins opening. |
| `navigation-drawer-opened` | — | Fired when the drawer has finished opening. |
| `navigation-drawer-closing` | — | Fired when the drawer begins closing. |
| `navigation-drawer-closed` | `{ reason: string, returnValue: string }` | Fired when the drawer has finished closing. |
| `navigation-drawer-cancel` | `{ reason: 'escape' \| 'scrim' }` | Fired on Esc or scrim click before closing. Cancelable via `event.preventDefault()`. |
| `navigation-drawer-drag-start` | `{ drawerEdge: string }` | Fired when swipe-to-dismiss drag engages. |
| `navigation-drawer-drag` | `{ dx: number, progress: number }` | Fired continuously during drag movement. |
| `navigation-drawer-drag-end` | `{ committed: boolean, target: string, dx: number }` | Fired when drag gesture is released. |
