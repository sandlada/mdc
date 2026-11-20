/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Geometric shape variant for `<mdc-skeleton>`.
 *
 * - `text`: Single or multi-line text placeholder (default).
 * - `rectangular`: Sharp-cornered media / banner block.
 * - `rounded`: MD3 medium-rounded card / surface block.
 * - `circular`: Avatar / icon / FAB circle (`aspect-ratio: 1`, full radius).
 * - `pill`: Chip / button / search bar pill (full radius).
 */
export const SkeletonVariant = {
    Text: 'text',
    Rectangular: 'rectangular',
    Rounded: 'rounded',
    Circular: 'circular',
    Pill: 'pill',
} as const
export type SkeletonVariant = (typeof SkeletonVariant)[keyof typeof SkeletonVariant]

/**
 * Motion style for `<mdc-skeleton>`.
 *
 * - `shimmer`: GPU-composited sweeping gradient sheen (default).
 * - `pulse`: Subtle opacity breathing animation.
 * - `none`: Static placeholder without animation.
 */
export const SkeletonAnimation = {
    Shimmer: 'shimmer',
    Pulse: 'pulse',
    None: 'none',
} as const
export type SkeletonAnimation = (typeof SkeletonAnimation)[keyof typeof SkeletonAnimation]

/**
 * Preset size scale for `<mdc-skeleton>`, aligned with MD3 component scales.
 */
export const SkeletonSize = {
    ExtraSmall: 'extra-small',
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
    ExtraLarge: 'extra-large',
} as const
export type SkeletonSize = (typeof SkeletonSize)[keyof typeof SkeletonSize]

export const SkeletonLoadedEvent = 'skeleton-loaded'

export interface IMDCSkeletonLoadedEventDetail {
    skeleton: IMDCSkeleton
}

export interface IMDCSkeletonAttributes {
    /** Geometric shape preset. Defaults to `'text'`. */
    variant: SkeletonVariant
    /** Animation style: `'shimmer'` (default) | `'pulse'` | `'none'`. */
    animation: SkeletonAnimation
    /** Preset size scale: `'extra-small'` ~ `'extra-large'`. Defaults to `'medium'`. */
    size: SkeletonSize
    /**
     * Controls loading state in wrapper mode or overrides standalone/group state.
     * Standalone `<mdc-skeleton>` (no slotted content) displays as loading by default.
     */
    loading: boolean
    /** Number of text lines to render when `variant="text"` (positive integer). Defaults to `1`. */
    lines: number
    /** Explicit width of the final line when `lines > 1` (e.g. `'60%'`, `'140px'`). */
    lastLineWidth: string
    /** Explicit CSS width overriding the variant/size preset. */
    width: string
    /** Explicit CSS height overriding the variant/size preset. */
    height: string
    /** Explicit CSS aspect-ratio (e.g. `'16 / 9'`, `'1'`). */
    aspectRatio: string
    /** Optional accessible status label. When omitted, the skeleton is decorative (`aria-hidden="true"`). */
    label: string
}

export interface IMDCSkeletonEvents {
    'skeleton-loaded': CustomEvent<IMDCSkeletonLoadedEventDetail>
}

export interface IMDCSkeleton extends LitElement, IMDCSkeletonAttributes {
    /** Whether non-whitespace slotted content is present (wrapper mode). */
    readonly hasSlottedContent: boolean
    /** Resolved loading state considering explicit property, group context, and standalone mode. */
    readonly isLoading: boolean
}
