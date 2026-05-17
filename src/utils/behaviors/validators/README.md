# Validator Utilities

This directory contains the constraint-validation helpers used by MDC form-associated components.

The validators are internal utilities. They are not part of the public component API, but they define the validation behavior that component authors and maintainers should rely on when implementing or reviewing form-related components.

## Common Contract

All validators extend `Validator<State>` from [`validator.ts`](./validator.ts). A validator:

- stores a current state snapshot through a `getCurrentState` callback
- recomputes validity only when state changes
- returns both `ValidityStateFlags` and a `validationMessage`
- requires three subclass methods:
  - `computeValidity(state)` to derive validity from platform controls
  - `equals(prev, next)` to detect whether state changed
  - `copy(state)` to cache the last state safely

The base class strips platform `ValidityState` objects down to `ValidityStateFlags` before exposing the result.

## Validators

### CheckboxValidator

- **File:** [`checkbox-validator.ts`](./checkbox-validator.ts)
- **State:** `ICheckboxState`
  - `checked: boolean`
  - `required: boolean`
- **Used by:** `toggle-button`, `toggle-icon-button`, `switch`

This validator emulates `<input type="checkbox">` validation.

**Behavior**
- Lazily creates a detached checkbox input once.
- Copies `checked` and `required` to the platform input.
- Returns the platform input's `validity` and `validationMessage`.
- `equals()` compares `checked` and `required` directly.
- `copy()` returns a plain object snapshot.

**Notes**
- This is the simplest validator in the set and is a good reference for the expected validator pattern.
- Validation is entirely delegated to the platform control.

### RadioValidator

- **File:** [`radio-validator.ts`](./radio-validator.ts)
- **State:** `RadioGroupState`
  - tuple of one or more `RadioState` entries
  - each entry has `checked: boolean` and `required: boolean`
- **Used by:** `toggle-button`, `toggle-icon-button`, `radio-button`

This validator emulates grouped `<input type="radio">` validation.

**Behavior**
- Lazily creates a detached radio input once.
- Uses a fixed radio group name so the platform can provide localized validation messaging.
- Collapses the group into two booleans:
  - `isRequired` becomes true if any radio is required
  - `isChecked` becomes true if any radio is checked
- Returns `valueMissing` when the group is required and nothing is checked.
- `equals()` compares both length and per-item state.
- `copy()` clones each radio state into a new tuple-like array.

**Notes**
- The implementation intentionally avoids rendering a detached radio group because browser behavior is not consistent in that setup.
- The caller must ensure the tuple is never empty.

### SelectValidator

- **File:** [`select-validator.ts`](./select-validator.ts)
- **State:** `SelectState`
  - `value: string`
  - `required: boolean`
- **Used by:** no current component in `src/components`

This validator emulates `<select>` validation.

**Behavior**
- Lazily creates a detached select element once.
- Renders a single option with the current value using Lit's `render()` helper.
- Copies `value` and `required` to the platform select.
- Returns the platform select's `validity` and `validationMessage`.
- `equals()` compares `value` and `required`.
- `copy()` returns a plain object snapshot.

**Notes**
- The detached option render is part of the validation setup, not the public component DOM.
- This validator is currently available for future select-like components.

### TextFieldValidator

- **File:** [`text-field-validator.ts`](./text-field-validator.ts)
- **State:** `TextFieldState`
  - `state: InputState | TextAreaState`
  - `renderedControl: HTMLInputElement | HTMLTextAreaElement | null`
- **Used by:** no current component in `src/components`

This validator emulates `<input>` and `<textarea>` constraint validation.

**Behavior**
- Prefers the rendered control when available.
- Falls back to a cached detached `<input>` or `<textarea>` when the rendered control is not ready.
- Uses the rendered control to preserve the dirty flag behavior needed for `minlength` and `maxlength`.
- Synchronizes input-specific fields such as `type`, `pattern`, `min`, `max`, and `step`.
- Applies `minlength` and `maxlength` as attributes so state changes do not throw while the control is updating.
- `equals()` compares all shared fields and the input-specific fields when the state is an input.
- `copy()` clones the state and intentionally drops the rendered control reference.

**State types**
- `InputState` includes `type`, `pattern`, `min`, `max`, and `step`.
- `TextAreaState` uses `type: 'textarea'` and only carries the shared fields.

**Notes**
- This validator is the most sensitive to DOM timing because `minlength` and `maxlength` depend on the control being dirty.
- Keep the value write conditional so validation does not reset the dirty flag unexpectedly.

### SliderValidator

- **File:** [`slider-validator.ts`](./slider-validator.ts)
- **State:** `ISliderState`
  - `min: number`
  - `max: number`
  - `step: number`
  - `range: boolean`
  - `value?: number`
  - `valueStart?: number`
  - `valueEnd?: number`
- **Used by:** `base-slider`

This validator emulates `<input type="range">` validation for both single-value and range sliders.

**Behavior**
- Lazily creates a detached range input once.
- Syncs `min`, `max`, and `step` before checking values.
- In single-value mode, validates `value`.
- In range mode, validates `valueStart` first and then `valueEnd`.
- Uses `valueAsNumber` so the platform computes validity and localized messages.
- `equals()` compares every slider field.
- `copy()` returns a shallow state copy.

**Notes**
- In range mode, the validator short-circuits on the first invalid value it finds.
- `undefined` values are normalized to `min` before validation.
- The caller is responsible for keeping the slider state internally consistent.

## Implementation Guide

When adding a new validator in this directory:

1. Define a dedicated state interface or tuple type.
2. Keep the state small and explicit.
3. Implement `computeValidity()` by syncing a detached platform control or by deriving the appropriate `ValidityStateFlags`.
4. Make `equals()` cover every field that can affect validation.
5. Make `copy()` return a safe snapshot that does not retain live component references.
6. Add a README entry here and document the component(s) that consume the validator.

## Related Files

- [`constraint-validation.ts`](../constraint-validation.ts) wires validators into `ElementInternals` and `checkValidity()` / `reportValidity()`.
- [`button/toggle-button.ts`](../../../components/button/toggle-button.ts) uses checkbox and radio validation.
- [`icon-button/toggle-icon-button.ts`](../../../components/icon-button/toggle-icon-button.ts) uses checkbox and radio validation.
- [`radio-button/radio-button.ts`](../../../components/radio-button/radio-button.ts) uses radio validation.
- [`switch/switch.ts`](../../../components/switch/switch.ts) uses checkbox validation.
- [`slider/internal/base-slider.ts`](../../../components/slider/internal/base-slider.ts) uses slider validation.
