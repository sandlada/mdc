/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

export const FabMenuVariants = ['primary', 'secondary', 'tertiary'] as const
export type FabMenuVariants = (typeof FabMenuVariants)[number]

export const FabMenuSizes = ['small', 'medium', 'large'] as const
export type FabMenuSizes = (typeof FabMenuSizes)[number]

export const FabMenuHorizontalAlignments = ['start', 'center', 'end'] as const
export type FabMenuHorizontalAlignments = (typeof FabMenuHorizontalAlignments)[number]

export const FabMenuItemSelectEvent = 'fab-menu-item-select'
export const FabMenuExpandedChangeEvent = 'expanded-change'

export interface IMDCFabMenuAttributes {
    variant: FabMenuVariants
    size: FabMenuSizes
    expanded: boolean
    horizontalAlignment: FabMenuHorizontalAlignments
    disabled: boolean
    closeOnSelect: boolean
    closeAriaLabel: string | null
    disableRipple: boolean
    disableElevation: boolean
    focusRingDisabled: boolean
}

export interface IMDCFabMenuEvents {
    'open': Event
    'opened': Event
    'close': Event
    'closed': Event
    'expanded-change': CustomEvent<{ expanded: boolean }>
}

export interface IMDCFabMenu extends LitElement, IMDCFabMenuAttributes {
    show(): Promise<void>
    close(): Promise<void>
    toggle(): Promise<void>
}

export interface IMDCFabMenuItemAttributes {
    variant: FabMenuVariants
    disabled: boolean
    href: string | null
    target: string | null
    keepOpen: boolean
    disableRipple: boolean
    disableElevation: boolean
    focusRingDisabled: boolean
}

export interface IMDCFabMenuItemEvents {
    'fab-menu-item-select': CustomEvent<{ item: IMDCFabMenuItem }>
}

export interface IMDCFabMenuItem extends LitElement, IMDCFabMenuItemAttributes {}
