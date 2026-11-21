/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Visual style variants for `<mdc-accordion>` and `<mdc-expansion-panel>`:
 * - `outlined`: Hairline `1px` `OutlineVariant` border on `Surface` background (default).
 * - `elevated`: `SurfaceContainerLow` background with subtle Level 1 elevation shadow.
 * - `filled`: `SurfaceContainerLow` / `SurfaceContainer` tonal background without border.
 * - `flat`: Transparent/Surface background with bottom hairline divider (Android `ExpandableListView` / `Preference` style).
 */
export const AccordionVariant = {
    Outlined: 'outlined',
    Elevated: 'elevated',
    Filled: 'filled',
    Flat: 'flat',
} as const
export type AccordionVariant = (typeof AccordionVariant)[keyof typeof AccordionVariant]

/**
 * Expansion behavior mode for `<mdc-accordion>`:
 * - `multiple`: Multiple panels can be expanded simultaneously (AndroidX `PreferenceCategory` style).
 * - `single`: Expanding a panel automatically collapses any other expanded panel (classic Accordion).
 */
export const AccordionMode = {
    Multiple: 'multiple',
    Single: 'single',
} as const
export type AccordionMode = (typeof AccordionMode)[keyof typeof AccordionMode]

/**
 * Density / size scale for `<mdc-accordion>` and `<mdc-expansion-panel>` headers.
 */
export const AccordionSize = {
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
} as const
export type AccordionSize = (typeof AccordionSize)[keyof typeof AccordionSize]

/**
 * Corner shape axis for `<mdc-accordion>` and `<mdc-expansion-panel>`.
 */
export const AccordionShape = {
    Round: 'round',
    Square: 'square',
} as const
export type AccordionShape = (typeof AccordionShape)[keyof typeof AccordionShape]

export const ExpansionPanelToggleEvent = 'expansion-panel-toggle'
export const ExpansionPanelExpandingEvent = 'expansion-panel-expanding'
export const ExpansionPanelExpandedEvent = 'expansion-panel-expanded'
export const ExpansionPanelCollapsingEvent = 'expansion-panel-collapsing'
export const ExpansionPanelCollapsedEvent = 'expansion-panel-collapsed'
export const AccordionChangeEvent = 'accordion-change'

export interface IMDCExpansionPanelToggleDetail {
    /** The requested next expanded state. Call `event.preventDefault()` to cancel. */
    expanded: boolean
}

export interface IMDCAccordionChangeDetail {
    /** 0-based indices of all currently expanded panels in the accordion. */
    expandedIndices: number[]
    /** References to all currently expanded `<mdc-expansion-panel>` elements. */
    expandedPanels: IMDCExpansionPanel[]
    /** The panel whose state changed. */
    changedPanel: IMDCExpansionPanel
    /** The new expanded state of `changedPanel`. */
    expanded: boolean
}

export interface IMDCExpansionPanelAttributes {
    /** Whether the panel body is expanded. */
    expanded: boolean
    /** Whether user interaction with the panel header is disabled. */
    disabled: boolean
    /** Visual style variant (`'outlined'` | `'elevated'` | `'filled'` | `'flat'`). */
    variant: AccordionVariant
    /** Header density size (`'small'` | `'medium'` | `'large'`). */
    size: AccordionSize
    /** Corner shape (`'round'` | `'square'`). */
    shape: AccordionShape
    /** Primary header title text (overridden by `slot="headline"`). */
    headline: string
    /** Secondary header summary/description text (overridden by `slot="supporting-text"`). */
    supportingText: string
    /** Material Symbols icon name for the leading header icon (overridden by `slot="icon"`). */
    icon: string
    /** Material Symbols icon name for the expand/collapse indicator. Defaults to `'expand_more'`. */
    expandIcon: string
    /** Hides the trailing expand/collapse indicator icon. */
    hideIndicator: boolean
    /** Hides the `supporting-text` summary while the panel is expanded (Material ExpansionPanel behavior). */
    hideSummaryOnExpand: boolean
    /** Hides the bottom divider in `flat` variant or between body and `actions` slot. */
    noDivider: boolean
    /** Optional ARIA heading level (`1`–`6`) applied to the header wrapper; `0` (default) omits heading semantics. */
    headingLevel: number
    /** Disables expand/collapse animations. */
    quick: boolean
    /** Optional identifier value for this panel. */
    value: string
}

export interface IMDCExpansionPanelEvents {
    'expansion-panel-toggle': CustomEvent<IMDCExpansionPanelToggleDetail>
    'expansion-panel-expanding': CustomEvent<void>
    'expansion-panel-expanded': CustomEvent<void>
    'expansion-panel-collapsing': CustomEvent<void>
    'expansion-panel-collapsed': CustomEvent<void>
}

export interface IMDCExpansionPanel extends LitElement, IMDCExpansionPanelAttributes {
    /** Programmatically expands the panel. */
    expand(): Promise<void>
    /** Programmatically collapses the panel. */
    collapse(): Promise<void>
    /** Programmatically toggles the panel's expanded state. */
    toggle(): Promise<void>
    /** Moves keyboard focus to the panel's interactive header button. */
    focusHeader(): void
}

export interface IMDCAccordionAttributes {
    /** Expansion mode (`'multiple'` | `'single'`). Defaults to `'multiple'`. */
    mode: AccordionMode
    /**
     * In `'single'` mode, whether the currently expanded panel can be collapsed by clicking it.
     * When `false`, at least one panel remains open once expanded. Defaults to `true`.
     */
    collapsible: boolean
    /** Default visual variant propagated to child panels (`'outlined'` | `'elevated'` | `'filled'` | `'flat'`). */
    variant: AccordionVariant
    /** Default header size propagated to child panels (`'small'` | `'medium'` | `'large'`). */
    size: AccordionSize
    /** Default corner shape propagated to child panels (`'round'` | `'square'`). */
    shape: AccordionShape
    /** Joins child panels into a flush vertical stack instead of separated cards with gaps. */
    connected: boolean
    /** Disables expand/collapse animations on child panels. */
    quick: boolean
}

export interface IMDCAccordionEvents {
    'accordion-change': CustomEvent<IMDCAccordionChangeDetail>
}

export interface IMDCAccordion extends LitElement, IMDCAccordionAttributes {
    /** All child `<mdc-expansion-panel>` elements managed by this accordion. */
    readonly panels: IMDCExpansionPanel[]
    /** Currently expanded child `<mdc-expansion-panel>` elements. */
    readonly expandedPanels: IMDCExpansionPanel[]
    /** Expands all enabled panels (only applies in `'multiple'` mode). */
    expandAll(): void
    /** Collapses all enabled panels (in `'single'` mode with `collapsible: false`, keeps the active panel open). */
    collapseAll(): void
    /** Expands the panel at the given 0-based index. */
    expandAt(index: number): void
    /** Collapses the panel at the given 0-based index. */
    collapseAt(index: number): void
    /** Toggles the panel at the given 0-based index. */
    toggleAt(index: number): void
}
