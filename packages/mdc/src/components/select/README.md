# Select (`mdc-select` & `mdc-select-option`)

Material Design 3 Exposed Dropdown Menu (`mdc-select`) and selectable option (`mdc-select-option`), modeled after the **Material 3 Figma Design Kit** and **Android Jetpack Compose `ExposedDropdownMenuBox` / MDC-Android `TextInputLayout`**.

## Usage

```html
<mdc-select label="Favorite fruit">
    <mdc-select-option value="apple">Apple</mdc-select-option>
    <mdc-select-option value="banana" selected>Banana</mdc-select-option>
    <mdc-select-option value="cherry">Cherry</mdc-select-option>
</mdc-select>

<mdc-select variant="outlined" label="Country" required>
    <mdc-select-option value="cn">China</mdc-select-option>
    <mdc-select-option value="jp">Japan</mdc-select-option>
    <mdc-select-option value="us">United States</mdc-select-option>
</mdc-select>
```

## Features

- **Variants**: `filled` (default) and `outlined`, backed by `mdc-field`.
- **Menu Surface**: Positioned with `@floating-ui/dom` (`offset`, `flip`, `shift`, `size`), supporting `standard` and `vibrant` menu color styles, `menu-placement`, and `clamp-menu-width`.
- **Keyboard & Accessibility**: WAI-ARIA `combobox` + `listbox` + `option` semantics, `ArrowUp`/`ArrowDown`/`Home`/`End`/`Enter`/`Space`/`Escape` navigation, and typeahead search.
- **Form Association**: Participates in `<form>` submission, `formResetCallback`, `formDisabledCallback`, and constraint validation (`required`, `checkValidity()`, `reportValidity()`).
