/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IMixinElevationAttributes } from '../elevation/elevation-options.mixin'
import type { IMixinFocusRingAttributes } from '../focus-ring/focus-ring-options.mixin'
import type { IMixinRippleAttributes } from '../ripple/ripple-options.mixin'

/**
 * Chip variant axis per Material Design 3 specifications.
 *
 * - `assist`: Guides the user during a task with an optional leading icon.
 * - `filter`: Refines content from a set of options (selectable with checkmark).
 * - `input`: Represents discrete user-entered information (selectable, removable, optional avatar).
 * - `suggestion`: Presents dynamically generated recommendations.
 */
export const ChipVariant = {
    Assist: 'assist',
    Filter: 'filter',
    Input: 'input',
    Suggestion: 'suggestion',
} as const
export type ChipVariant = (typeof ChipVariant)[keyof typeof ChipVariant]

/** Name of the event fired when selection changes (`filter` / `input`). */
export const ChipToggleEvent = 'chip-toggle'

/** Name of the event fired when a non-selectable chip (`assist` / `suggestion`) activates. */
export const ChipNavigateEvent = 'chip-navigate'

/** Name of the event fired when a removable `input` chip's close action is triggered. */
export const ChipCloseEvent = 'chip-close'

/**
 * Detail payload of the `chip-toggle` event.
 */
export interface IMDCChipToggleEventDetail {
    selected: boolean
    chip: IMDCChip
}

/**
 * Detail payload of the `chip-navigate` event.
 */
export interface IMDCChipNavigateEventDetail {
    chip: IMDCChip
}

/**
 * Detail payload of the `chip-close` event.
 */
export interface IMDCChipCloseEventDetail {
    chip: IMDCChip
}

/**
 * Input attributes for `mdc-chip`.
 */
export interface IMDCChipAttributes {
    /** Visual & behavioral variant of the chip. */
    variant: ChipVariant
    /** Selection state (`filter` and `input` variants). */
    selected: boolean
    /** Whether the chip is disabled. */
    disabled: boolean
    /** Whether the chip is soft-disabled (disabled visuals, focusable, non-interactive). */
    softDisabled: boolean
    /** Keeps a disabled chip focusable in tab/roving order. */
    alwaysFocusable: boolean
    /** Renders an elevated tonal surface (`SurfaceContainerLow`) instead of flat outline. */
    elevated: boolean
    /** Optional destination URL; turns the primary surface into a link (`<a>`). */
    href: string
    /** Link target (e.g. `_blank`), used when `href` is set. */
    target: string
    /** Label text used as fallback when default slot is empty and for `aria-label` when icon-only. */
    label: string
    /** Optional semantic value exposed for form/chip-set selection queries. */
    value: string
    /** Formats the leading graphic as a 24px circular avatar (primarily `input` variant). */
    avatar: boolean
    /** Accessible label of the trailing remove button (`input` variant). */
    ariaLabelRemove: string
    /** When true on `input`, only the trailing remove button is interactive. */
    removeOnly: boolean
    /** Hides the default trailing remove button on `input` chips. */
    noRemove: boolean
    /** Omits the leading checkmark when a `filter` chip is selected. */
    hideCheckmark: boolean
    /** `tabindex` managed by `mdc-chip-set` roving tabindex. */
    chipTabIndex: number
}

/**
 * Custom events emitted by `mdc-chip`.
 */
export interface IMDCChipEvents {
    'chip-toggle': CustomEvent<IMDCChipToggleEventDetail>
    'chip-navigate': CustomEvent<IMDCChipNavigateEventDetail>
    'chip-close': CustomEvent<IMDCChipCloseEventDetail>
}

/**
 * Public interface for `mdc-chip`.
 */
export interface IMDCChip
    extends LitElement,
        IMDCChipAttributes,
        IMixinRippleAttributes,
        IMixinElevationAttributes,
        IMixinFocusRingAttributes {
    /** Whether a leading `icon` slot element is assigned. */
    readonly hasIcon: boolean
    /** Whether an `avatar` slot element or `avatar` flag is active. */
    readonly hasAvatar: boolean
    /** Whether a `trailing-icon` slot element is assigned or default input remove button is shown. */
    readonly hasTrailingIcon: boolean
    /** Whether a custom `selected-icon` slot element is assigned. */
    readonly hasSelectedIcon: boolean
    /** Whether the chip has visible label content (slotted or via `label`). */
    readonly hasLabel: boolean
    /** Returns the resolved label string (from `label` attribute or slotted text). */
    readonly effectiveLabel: string
    /** Resolves semantic value (`value` attribute, falling back to `effectiveLabel`). */
    readonly resolvedValue: string
    /** Requests closing/removing this chip by dispatching `chip-close`. */
    close(): void
}
