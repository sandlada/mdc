/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { SkeletonAnimation, SkeletonSize } from './skeleton.interface'

export const SkeletonGroupLoadedEvent = 'skeleton-group-loaded'

export interface IMDCSkeletonGroupLoadedEventDetail {
    group: IMDCSkeletonGroup
}

export interface IMDCSkeletonGroupAttributes {
    /** Shared loading state propagated to descendant `<mdc-skeleton>` elements. */
    loading: boolean
    /** Shared animation style propagated to descendant `<mdc-skeleton>` elements. */
    animation: SkeletonAnimation
    /** Shared preset size propagated to descendant `<mdc-skeleton>` elements. */
    size: SkeletonSize
    /** Accessible status label announced for the group while `loading` is `true`. Defaults to `'Loading'`. */
    label: string
}

export interface IMDCSkeletonGroupEvents {
    'skeleton-group-loaded': CustomEvent<IMDCSkeletonGroupLoadedEventDetail>
}

export interface IMDCSkeletonGroup extends LitElement, IMDCSkeletonGroupAttributes {}
