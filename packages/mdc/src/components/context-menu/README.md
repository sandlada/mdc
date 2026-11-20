# `mdc-context-menu`

A Material Design 3 Expressive Context Menu component, modeled primarily after **Android** (right-click, touch/pen long-press with 8px touch-slop cancellation, and `Shift+F10` / `ContextMenu` keyboard trigger) and **Flutter** (`ContextMenuController` global exclusivity).

## Architecture (Low-Coupling Layers)

- **Data / State (`internal/context-menu-state.ts`)**: Pure, framework-agnostic functions for roving focus navigation, typeahead matching, immutable checkbox/radio group toggling, and keyboard anchor coordinate calculation.
- **Behavior (`internal/context-trigger-controller.ts` + `PopoverBehaviorController`)**: Decoupled Android-first trigger controller (`contextmenu`, touch `long-press`, keyboard) paired with the shared floating surface behavior controller (`exclusiveGroup: 'mdc-context-menu'`).
- **UI (`context-menu.ts`, `context-menu.style.ts`, `context-menu.definition.ts`)**: Dual-mode renderer supporting declarative `items` (`item`, `checkbox`, `radio`, `divider`, `label`, `submenu`, `destructive`) or custom `<slot name="menu">` content.

## Usage

```html
<mdc-context-menu id="ctx">
    <div style="padding: 32px; border: 1px dashed currentColor;">
        Right-click or long-press here
    </div>
</mdc-context-menu>
```
