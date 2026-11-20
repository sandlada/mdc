/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseSkeletonGroup } from './internal/base-skeleton-group'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-skeleton-group': MDCSkeletonGroup
    }
}

/**
 * Material Design 3 Skeleton Group (`<mdc-skeleton-group>`).
 *
 * Coordinates `loading`, `animation`, and `size` across descendant
 * `<mdc-skeleton>` elements via Lit Context and exposes a single accessible
 * `role="status"` / `aria-busy` region to avoid redundant screen-reader
 * announcements.
 *
 * @element mdc-skeleton-group
 * @slot - Descendant `<mdc-skeleton>` elements and layout wrappers.
 *
 * @fires skeleton-group-loaded - Dispatched when `loading` transitions from `true` to `false`.
 *
 * @version
 * Material Design 3 - Expressive
 */
@customElement('mdc-skeleton-group')
export class MDCSkeletonGroup extends BaseSkeletonGroup {}
