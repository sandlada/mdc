/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

/**
 * Visual style variants for `<mdc-breadcrumbs>`:
 * - `standard`: Clean text/link trail with pill hover state layer.
 * - `tonal`: Breadcrumb items rendered inside a subtle tonal container pill.
 * - `outlined`: Breadcrumb items or bar with hairline outline border.
 */
export const BreadcrumbsVariant = {
    Standard: 'standard',
    Tonal: 'tonal',
    Outlined: 'outlined',
} as const
export type BreadcrumbsVariant = (typeof BreadcrumbsVariant)[keyof typeof BreadcrumbsVariant]

/**
 * Size scale for `<mdc-breadcrumbs>` items and separators.
 */
export const BreadcrumbsSize = {
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
} as const
export type BreadcrumbsSize = (typeof BreadcrumbsSize)[keyof typeof BreadcrumbsSize]

/**
 * Corner shape axis for `<mdc-breadcrumbs>` item pills and overflow button.
 */
export const BreadcrumbsShape = {
    Round: 'round',
    Square: 'square',
} as const
export type BreadcrumbsShape = (typeof BreadcrumbsShape)[keyof typeof BreadcrumbsShape]

/**
 * Behavior when the collapsed ellipsis (`...`) button is activated:
 * - `menu`: Opens an `<mdc-menu>` listing all hidden ancestor items.
 * - `expand`: Expands all collapsed items inline.
 */
export const BreadcrumbsCollapseMode = {
    Menu: 'menu',
    Expand: 'expand',
} as const
export type BreadcrumbsCollapseMode = (typeof BreadcrumbsCollapseMode)[keyof typeof BreadcrumbsCollapseMode]

/**
 * Built-in separator presets for `<mdc-breadcrumbs>`.
 */
export const BreadcrumbsSeparator = {
    Chevron: 'chevron',
    Slash: 'slash',
    Arrow: 'arrow',
} as const
export type BreadcrumbsSeparator = (typeof BreadcrumbsSeparator)[keyof typeof BreadcrumbsSeparator]

/**
 * Data item descriptor for programmatic `items` rendering on `<mdc-breadcrumbs>`.
 */
export interface IBreadcrumbDataItem {
    /** Visible text label of the breadcrumb item. */
    label: string
    /** Optional navigation URL. */
    href?: string
    /** Optional link target (e.g. `_blank`, `_self`). */
    target?: string
    /** Optional Material Symbols icon name rendered before the label. */
    icon?: string
    /** Whether this item is disabled. */
    disabled?: boolean
    /** Optional value identifier associated with the item. */
    value?: string
}

export const BreadcrumbSelectEvent = 'breadcrumb-select'
export const BreadcrumbsExpandEvent = 'breadcrumbs-expand'

export interface IMDCBreadcrumbSelectDetail {
    /** Index of the selected item in the full breadcrumb trail (0-based). */
    index: number
    /** Visible label of the selected item. */
    label: string
    /** Optional href of the selected item. */
    href: string | null
    /** Optional value of the selected item. */
    value: string | null
    /** Underlying `<mdc-breadcrumb-item>` element when slotted, or `null` for data items. */
    item: IMDCBreadcrumbItem | null
}

export interface IMDCBreadcrumbsExpandDetail {
    /** Number of previously collapsed items revealed. */
    expandedCount: number
}

export interface IMDCBreadcrumbsAttributes {
    /** Visual style variant (`'standard'` | `'tonal'` | `'outlined'`). */
    variant: BreadcrumbsVariant
    /** Control size (`'small'` | `'medium'` | `'large'`). */
    size: BreadcrumbsSize
    /** Corner shape (`'round'` | `'square'`). */
    shape: BreadcrumbsShape
    /** Built-in separator preset (`'chevron'` | `'slash'` | `'arrow'`) or custom string. */
    separator: BreadcrumbsSeparator | (string & {})
    /**
     * Maximum number of visible breadcrumb items before middle items collapse.
     * `0` (default) disables collapsing.
     */
    maxItems: number
    /** Number of leading items kept visible when collapsed. Defaults to `1`. */
    itemsBeforeCollapse: number
    /** Number of trailing items kept visible when collapsed. Defaults to `2`. */
    itemsAfterCollapse: number
    /**
     * Interaction when clicking the collapsed ellipsis button (`'menu'` | `'expand'`).
     * Defaults to `'menu'`.
     */
    collapseMode: BreadcrumbsCollapseMode
    /** Accessible `aria-label` on the `<nav>` landmark. Defaults to `'Breadcrumb'`. */
    label: string
    /** Accessible `aria-label` on the collapsed ellipsis button. */
    expandLabel: string
    /** Optional programmatic items array; when non-empty, takes precedence over slotted children. */
    items: IBreadcrumbDataItem[]
}

export interface IMDCBreadcrumbsEvents {
    'breadcrumb-select': CustomEvent<IMDCBreadcrumbSelectDetail>
    'breadcrumbs-expand': CustomEvent<IMDCBreadcrumbsExpandDetail>
}

export interface IMDCBreadcrumbs extends LitElement, IMDCBreadcrumbsAttributes {
    /** Whether the collapsed trail has been expanded inline. */
    readonly expanded: boolean
    /** Programmatically expands a collapsed trail inline. */
    expand(): void
    /** Programmatically resets inline expansion back to collapsed state. */
    collapse(): void
}

export interface IMDCBreadcrumbItemAttributes {
    /** Navigation URL; when set, renders an `<a>` root. */
    href: string | null
    /** Link target attribute (e.g. `'_blank'`). */
    target: string | null
    /** Link rel attribute. */
    rel: string | null
    /** Optional Material Symbols icon name. */
    icon: string | null
    /** Optional value identifier. */
    value: string | null
    /** Marks this item as the current page (`aria-current="page"`). */
    current: boolean
    /** Disables interaction on this item (ignored when `current` is true). */
    disabled: boolean
}

export interface IMDCBreadcrumbItem extends LitElement, IMDCBreadcrumbItemAttributes {
    /** Visual style inherited from parent `<mdc-breadcrumbs>`. */
    variant: BreadcrumbsVariant
    /** Size inherited from parent `<mdc-breadcrumbs>`. */
    size: BreadcrumbsSize
    /** Shape inherited from parent `<mdc-breadcrumbs>`. */
    shape: BreadcrumbsShape
}
