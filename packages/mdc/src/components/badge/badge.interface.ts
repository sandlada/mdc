/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

export type BadgeSize = 'large' | 'small'
export const BadgeSize = {
    Large: 'large',
    Small: 'small',
} as const satisfies Record<string, BadgeSize>

export interface IMDCBadgeAttributes {
    size          : BadgeSize
    value         : string | number | null
    label         : string | null
    max           : number | null
    autoSizeOnZero: boolean
    hasLabel      : boolean
}

export interface IMDCBadgeValueChangeDetail {
    value   : string | number | null
    oldValue: string | number | null
}

export interface IMDCBadgeSizeChangeDetail {
    size   : BadgeSize
    oldSize: BadgeSize
}

export interface IMDCBadgeOverflowChangeDetail {
    isOverflow   : boolean
    oldIsOverflow: boolean
    displayText  : string
}

export interface IMDCBadgeAutoSizeDetail {
    effectiveSize: BadgeSize
    isZero       : boolean
}

export interface IMDCBadgeEvents {
    'change'         : CustomEvent<IMDCBadgeValueChangeDetail>
    'size-change'    : CustomEvent<IMDCBadgeSizeChangeDetail>
    'overflow-change': CustomEvent<IMDCBadgeOverflowChangeDetail>
    'auto-size'      : CustomEvent<IMDCBadgeAutoSizeDetail>
}

export interface IMDCBadge extends LitElement, IMDCBadgeAttributes {
}

