/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/** The four supported visual variants of `mdc-split-button`. */
export type SplitButtonVariant = 'filled' | 'filled-tonal' | 'elevated' | 'outlined'
/** The five supported sizes of `mdc-split-button`. */
export type SplitButtonSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'

/**
 * `mdc-split-button` — a two-segment control that presents a primary action
 * (the leading button) next to a related-action trigger (the trailing button).
 *
 * The two segments share the container height and a pill-shaped corner-radius
 * system — outer corners fully rounded, facing inner corners small — and are
 * joined across the small `between-space` seam, so they read as one unified
 * control. They remain two independent native buttons: each paints its own
 * background / outline and owns its own ripple, focus ring, elevation and
 * disabled state.
 *
 * Both segments accept a label, an icon, or both. The leading button uses the
 * default slot for its label and the `icon` slot for its leading icon; the
 * trailing button uses the `trailing-icon` slot for its graphic (typically a
 * chevron) and the `trailing-label` slot for an optional label.
 *
 * Mirrors the `SplitButtonLayout` + `LeadingButton` / `TrailingButton` API
 * shape of the Jetpack Compose Material 3 implementation.
 */
export interface ISplitButton extends LitElement {
    /** Visual variant: `'filled'` (default) | `'filled-tonal'` | `'elevated'` | `'outlined'`. */
    variant: SplitButtonVariant
    /** Size: `'extra-small'` | `'small'` (default) | `'medium'` | `'large'` | `'extra-large'`. */
    size: SplitButtonSize
    /** When `true` both buttons are non-interactive and dimmed. */
    disabled: boolean
    /** When `true` only the leading button is non-interactive and dimmed. */
    leadingDisabled: boolean
    /** When `true` only the trailing button is non-interactive and dimmed. */
    trailingDisabled: boolean
    /** When `true` the trailing button morphs to its expanded shape (menu-open state). */
    expanded: boolean
    /** When `true` the corner-radius morph on press is disabled. */
    disableMorph: boolean
    /** When `true` the ripple of both buttons is disabled. */
    disableRipple: boolean
    /** When `true` the elevation of both buttons is disabled. */
    disableElevation: boolean
    /** When `true` the focus ring of both buttons is disabled. */
    disableFocusRing: boolean
    /** Accessible name for the trailing button when it has no visible label. */
    trailingAriaLabel: string | null
    /** Set when the leading `icon` slot is populated. */
    hasLeadingIcon: boolean
    /** Set when the leading label slot is populated. */
    hasLeadingLabel: boolean
    /** Set when the `trailing-icon` slot is populated. */
    hasTrailingIcon: boolean
    /** Set when the `trailing-label` slot is populated. */
    hasTrailingLabel: boolean
    /** The leading button element. */
    readonly leadingButtonElement: HTMLButtonElement | null
    /** The trailing button element. */
    readonly trailingButtonElement: HTMLButtonElement | null
}

/** Name of the event dispatched when the leading button is activated. */
export const SPLIT_BUTTON_LEADING_INTERACTION_EVENT = 'leading-button-interaction'
/** Name of the event dispatched when the trailing button is activated. */
export const SPLIT_BUTTON_TRAILING_INTERACTION_EVENT = 'trailing-button-interaction'
