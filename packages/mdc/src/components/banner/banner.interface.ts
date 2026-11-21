/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Visual color variant of `<mdc-banner>`.
 */
export const BannerVariant = {
    Surface           : 'surface',
    SurfaceContainer  : 'surface-container',
    PrimaryContainer  : 'primary-container',
    SecondaryContainer: 'secondary-container',
    TertiaryContainer : 'tertiary-container',
    ErrorContainer    : 'error-container',
    InverseSurface    : 'inverse-surface',
} as const
export type BannerVariant = (typeof BannerVariant)[keyof typeof BannerVariant]

/**
 * Layout arrangement of message and actions in `<mdc-banner>`.
 * - `auto`: single-line when there is at most one action and no headline; stacked when two actions, headline, or narrow container.
 * - `single-line`: keeps icon, message, and actions on one horizontal row.
 * - `stacked`: places actions on a separate right-aligned row below the message.
 */
export const BannerLayout = {
    Auto      : 'auto',
    SingleLine: 'single-line',
    Stacked   : 'stacked',
} as const
export type BannerLayout = (typeof BannerLayout)[keyof typeof BannerLayout]

/**
 * Reason reported when a banner closes.
 */
export const BannerCloseReason = {
    PrimaryAction  : 'primary-action',
    SecondaryAction: 'secondary-action',
    Dismiss        : 'dismiss',
} as const
export type BannerCloseReason = (typeof BannerCloseReason)[keyof typeof BannerCloseReason]

/**
 * Detail payload of `banner-closing` and `banner-closed` events.
 */
export interface IMDCBannerCloseEventDetail {
    reason: BannerCloseReason
}

/**
 * Input attributes for `<mdc-banner>`.
 */
export interface IMDCBannerAttributes {
    /** Controls whether the banner is expanded and visible in layout flow. */
    open: boolean
    /** Color variant of the banner. */
    variant: BannerVariant
    /** Layout arrangement of message and actions. */
    layout: BannerLayout
    /** Optional short headline displayed above the message. */
    headline: string
    /** Optional supporting text (alternative to default slot). */
    supportingText: string
    /** Optional leading Material Symbol icon name (alternative to `slot="icon"`). */
    icon: string
    /** Wraps the leading icon in a 40px circular tinted container. */
    iconContainer: boolean
    /** Optional label for the primary text action button (alternative to `slot="primary-action"`). */
    primaryAction: string
    /** Optional label for the secondary text action button (alternative to `slot="secondary-action"`). */
    secondaryAction: string
    /** Hides the 1px bottom hairline divider. */
    noDivider: boolean
    /** Automatically closes the banner when a built-in action button is clicked (unless prevented). */
    dismissOnAction: boolean
    /** Skips open/close expand-collapse animations. */
    quick: boolean
}

/**
 * DOM events dispatched by `<mdc-banner>`.
 */
export interface IMDCBannerEvents {
    'banner-opening'         : Event
    'banner-opened'          : Event
    'banner-closing'         : CustomEvent<IMDCBannerCloseEventDetail>
    'banner-closed'          : CustomEvent<IMDCBannerCloseEventDetail>
    'banner-primary-action'  : Event
    'banner-secondary-action': Event
}

/**
 * Material Design Banner component contract (`<mdc-banner>`).
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/banner/overview
 */
export interface IMDCBanner extends LitElement, IMDCBannerAttributes {
    /** Shows (expands) the banner. */
    show(): Promise<void>
    /** Hides (collapses) the banner with an optional close reason. */
    hide(reason?: BannerCloseReason): Promise<void>
}

/** Name of the event fired when the banner starts opening. */
export const BannerOpeningEvent = 'banner-opening'
/** Name of the event fired when the banner finishes opening. */
export const BannerOpenedEvent = 'banner-opened'
/** Name of the event fired when the banner starts closing. */
export const BannerClosingEvent = 'banner-closing'
/** Name of the event fired when the banner finishes closing. */
export const BannerClosedEvent = 'banner-closed'
/** Name of the event fired when the primary action button is clicked. */
export const BannerPrimaryActionEvent = 'banner-primary-action'
/** Name of the event fired when the secondary action button is clicked. */
export const BannerSecondaryActionEvent = 'banner-secondary-action'
