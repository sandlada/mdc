/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseAvatarGroup } from './internal/base-avatar-group'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-avatar-group': MDCAvatarGroup
    }
}

/**
 * Material Design 3 Avatar Group (`<mdc-avatar-group>`).
 *
 * Stacks multiple `<mdc-avatar>` elements with transparent cutout rings,
 * unified size/shape propagation, optional hover expansion, and `+N` overflow collapsing.
 *
 * @element mdc-avatar-group
 * @slot - `<mdc-avatar>` children.
 * @slot overflow - Optional custom content for the overflow indicator.
 *
 * @fires avatar-group-overflow-click - Dispatched when `overflow-clickable` is set and `+N` is clicked.
 *
 * @version
 * Material Design 3 - Expressive
 */
@customElement('mdc-avatar-group')
export class MDCAvatarGroup extends BaseAvatarGroup {}
