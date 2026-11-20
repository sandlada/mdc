/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { AvatarShape, AvatarSize, IMDCAvatar } from './avatar.interface'

/**
 * Visual stacking direction of overlapping avatars in `<mdc-avatar-group>`.
 * - `start-on-top`: First avatar paints above subsequent avatars (Android / Google Workspace default).
 * - `end-on-top`: Last avatar paints above preceding avatars.
 */
export const AvatarGroupStackOrder = {
    StartOnTop: 'start-on-top',
    EndOnTop: 'end-on-top',
} as const
export type AvatarGroupStackOrder = (typeof AvatarGroupStackOrder)[keyof typeof AvatarGroupStackOrder]

export const AvatarGroupOverflowClickEvent = 'avatar-group-overflow-click'

export interface IMDCAvatarGroupOverflowClickDetail {
    overflowCount: number
    hiddenAvatars: IMDCAvatar[]
}

export interface IMDCAvatarGroupAttributes {
    /** Unified size propagated to child `<mdc-avatar>` elements without explicit size. */
    size: AvatarSize
    /** Unified shape propagated to child `<mdc-avatar>` elements without explicit shape. */
    shape: AvatarShape
    /** Maximum number of visible avatars before collapsing into `+N` overflow indicator. `null` disables collapsing. */
    max: number | null
    /** Stacking order (`'start-on-top'` | `'end-on-top'`). Defaults to `'start-on-top'`. */
    stackOrder: AvatarGroupStackOrder
    /** Expands spacing smoothly on hover or keyboard focus within the group. */
    hoverExpand: boolean
    /** Makes the built-in `+N` overflow indicator clickable and emits `avatar-group-overflow-click`. */
    overflowClickable: boolean
    /** Custom text overriding the default `+{count}` overflow label. */
    overflowLabel: string
}

export interface IMDCAvatarGroupEvents {
    'avatar-group-overflow-click': CustomEvent<IMDCAvatarGroupOverflowClickDetail>
}

export interface IMDCAvatarGroup extends LitElement, IMDCAvatarGroupAttributes {
    /** All direct/slotted `<mdc-avatar>` children. */
    getAvatars(): IMDCAvatar[]
    /** Currently visible `<mdc-avatar>` children (up to `max`). */
    getVisibleAvatars(): IMDCAvatar[]
    /** Collapsed `<mdc-avatar>` children hidden beyond `max`. */
    getOverflowAvatars(): IMDCAvatar[]
}
