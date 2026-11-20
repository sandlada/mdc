# Avatar (`<mdc-avatar>` & `<mdc-avatar-group>`)

Material Design 3 Expressive avatar and overlapping avatar stack components.

## Variants & Options

- **`AvatarSize`**: `extra-small` (24px), `small` (32px), `medium` (40px), `large` (56px), `extra-large` (96px)
- **`AvatarShape`**: `round`, `square`
- **`AvatarVariant`**: `tonal`, `filled`, `outlined`, `surface`
- **`AvatarGroupStackOrder`**: `start-on-top`, `end-on-top`

## Usage

```html
<mdc-avatar name="Kai Orion" auto-color></mdc-avatar>

<mdc-avatar-group max="3" hover-expand>
    <mdc-avatar name="Alice"></mdc-avatar>
    <mdc-avatar name="Bob"></mdc-avatar>
    <mdc-avatar name="Charlie"></mdc-avatar>
    <mdc-avatar name="Dana"></mdc-avatar>
</mdc-avatar-group>
```
