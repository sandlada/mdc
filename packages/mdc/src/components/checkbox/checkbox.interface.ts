/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IMixinRippleOptions } from '../ripple/ripple-options.mixin'
import type { IMixinFocusRingOption } from '../focus-ring/focus-ring-options.mixin'
import type { FormAssociated } from '../../utils/form/form-associated'

/**
 * `mdc-checkbox` — an MD3 checkbox with checked / unchecked / indeterminate
 * states and native form participation.
 *
 * The element is a form-associated custom element: when `checked` and not
 * `indeterminate` it submits its `value` (default `'on'`), participates in
 * `<form>` reset / session-restore, and is validated against `required`
 * (an unchecked required checkbox reports `valueMissing` and blocks submit).
 *
 * The three visual states are driven by two independent boolean properties —
 * `checked` and `indeterminate` — which mirror how a native checkbox exposes
 * the same tri-state. Setting `indeterminate` renders the horizontal dash; a
 * user click on an indeterminate box always selects it (native activation
 * behavior). When `tristate` is set, user toggling instead walks the full
 * Flutter cycle — unchecked → checked → indeterminate → unchecked.
 *
 * State transitions animate with MD3 Emphasized easings (350ms enter /
 * 150ms exit) driven by `prev-*` class markers, and the whole box flips with
 * a vertical 45° flip rather than a simple opacity cross-fade.
 *
 * @fires input {Event} — Dispatched when the user toggles the box (bubbles
 *     and is composed, mirroring the native checkbox). Also fires from the
 *     tri-state cycle.
 * @fires change {Event} — Dispatched after a user toggle completes (bubbles
 *     but is NOT composed, mirroring the native checkbox).
 *
 * @cssproperty --mdc-checkbox-container-size
 * @cssproperty --mdc-checkbox-icon-size
 * @cssproperty --mdc-checkbox-state-layer-size
 */
export interface ICheckbox extends LitElement, FormAssociated, IMixinRippleOptions, IMixinFocusRingOption {
    /**
     * Whether the box is selected. Reflects to the `checked` attribute so the
     * initial value can also be set declaratively with the `default-checked`
     * attribute, which seeds the state before form restoration.
     */
    checked: boolean
    /**
     * Whether the box shows the indeterminate dash. Reflects to the
     * `indeterminate` attribute so the state can be authored declaratively
     * (e.g. `<mdc-checkbox indeterminate>`).
     */
    indeterminate: boolean
    /**
     * Enables user-driven three-state cycling: unchecked → checked →
     * indeterminate → unchecked (the Flutter `tristate` model). Without it,
     * user toggles behave like a native checkbox — indeterminate collapses to
     * a selection on click. Programs can set `indeterminate` at any time.
     */
    tristate: boolean
    /** When set, an unchecked box makes the containing form report invalid. */
    required: boolean
    /** Submitted to the form when checked and not indeterminate. */
    value: string
}
