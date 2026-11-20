/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IMixinFocusRingAttributes } from '../focus-ring/focus-ring-options.mixin'
import type { IMixinRippleAttributes } from '../ripple/ripple-options.mixin'

/**
 * Size scale for `<mdc-avatar>`, aligned with Material Design 3 & Android specs:
 * - `extra-small`: 24px (chips, compact inline mentions)
 * - `small`: 32px (compact toolbars, table rows)
 * - `medium`: 40px (default — list items, app bars, card headers)
 * - `large`: 56px (detail headers, prominent tiles)
 * - `extra-large`: 96px (profile sheets, account dialogs)
 */
export const AvatarSize = {
    ExtraSmall: 'extra-small',
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
    ExtraLarge: 'extra-large',
} as const
export type AvatarSize = (typeof AvatarSize)[keyof typeof AvatarSize]

/**
 * Corner shape axis for `<mdc-avatar>`.
 */
export const AvatarShape = {
    Round: 'round',
    Square: 'square',
} as const
export type AvatarShape = (typeof AvatarShape)[keyof typeof AvatarShape]

/**
 * Surface & color variant for `<mdc-avatar>` when displaying monograms or fallback icons.
 */
export const AvatarVariant = {
    Tonal: 'tonal',
    Filled: 'filled',
    Outlined: 'outlined',
    Surface: 'surface',
} as const
export type AvatarVariant = (typeof AvatarVariant)[keyof typeof AvatarVariant]

/**
 * Anchor placement for the `badge` slot on `<mdc-avatar>`.
 */
export const AvatarBadgePlacement = {
    BottomEnd: 'bottom-end',
    TopEnd: 'top-end',
} as const
export type AvatarBadgePlacement = (typeof AvatarBadgePlacement)[keyof typeof AvatarBadgePlacement]

/**
 * Native image loading strategy.
 */
export const AvatarImageLoading = {
    Eager: 'eager',
    Lazy: 'lazy',
} as const
export type AvatarImageLoading = (typeof AvatarImageLoading)[keyof typeof AvatarImageLoading]

export const AvatarLoadEvent = 'avatar-load'
export const AvatarErrorEvent = 'avatar-error'
export const AvatarClickEvent = 'avatar-click'

export interface IMDCAvatarImageEventDetail {
    src: string
}

export interface IMDCAvatarClickEventDetail {
    avatar: IMDCAvatar
}

export interface IMDCAvatarAttributes {
    /** Visual size preset. Defaults to `'medium'` (40px). */
    size: AvatarSize
    /** Corner shape: `'round'` (default) | `'square'`. */
    shape: AvatarShape
    /** Surface variant when rendering initials or fallback icon. Defaults to `'tonal'`. */
    variant: AvatarVariant
    /** Image URL. Falls back gracefully to initials or icon while loading or on error. */
    src: string
    /** Alternative text for the avatar image / accessible label. */
    alt: string
    /** Full name used for `aria-label` fallback and automatic initials extraction. */
    name: string
    /** Explicit monogram initials overriding automatic extraction from `name`. */
    initials: string
    /** Maximum number of grapheme clusters extracted from `name` (1 or 2). Defaults to `2`. */
    maxInitials: number
    /** Optional Material Symbol name rendered as fallback when no image or initials exist. */
    icon: string
    /** When `true`, deterministically picks a tonal MD3 palette entry from `colorSeed || name`. */
    autoColor: boolean
    /** Optional seed string for `autoColor` hashing (falls back to `name` / `initials`). */
    colorSeed: string
    /** Makes a static avatar interactive (`<button>` with ripple and focus ring). */
    clickable: boolean
    /** Optional destination URL; renders an `<a>` root. */
    href: string
    /** Link target (e.g. `'_blank'`), used when `href` is set. */
    target: string
    /** Link relationship (`rel`), used when `href` is set. */
    rel: string
    /** Disables interaction when `clickable` or `href` is active. */
    disabled: boolean
    /** Native image loading behavior (`'eager'` | `'lazy'`). */
    loading: AvatarImageLoading
    /** Placement of the `badge` slot (`'bottom-end'` | `'top-end'`). */
    badgePlacement: AvatarBadgePlacement
}

export interface IMDCAvatarEvents {
    'avatar-load': CustomEvent<IMDCAvatarImageEventDetail>
    'avatar-error': CustomEvent<IMDCAvatarImageEventDetail>
    'avatar-click': CustomEvent<IMDCAvatarClickEventDetail>
}

export interface IMDCAvatar
    extends LitElement,
        IMDCAvatarAttributes,
        IMixinRippleAttributes,
        IMixinFocusRingAttributes {
    /** Computed monogram text (`initials` or extracted from `name`). */
    readonly resolvedInitials: string
    /** Deterministic palette index (`0..5`) when `autoColor` is enabled, or `null`. */
    readonly paletteIndex: number | null
}
