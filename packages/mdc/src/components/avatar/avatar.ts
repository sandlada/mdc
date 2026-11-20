/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseAvatar } from './internal/base-avatar'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-avatar': MDCAvatar
    }
}

/**
 * Material Design 3 Avatar (`<mdc-avatar>`).
 *
 * Displays a user profile image, monogram initials, or fallback icon with
 * optional interactive states (button/link), deterministic tonal coloring,
 * and a `badge` slot.
 *
 * @element mdc-avatar
 * @slot - Custom fallback content when no `src` or initials are provided.
 * @slot icon - Custom fallback icon replacing the default `person` icon.
 * @slot badge - Optional `<mdc-badge>` or status indicator anchored at `badge-placement`.
 *
 * @fires avatar-load - Dispatched when the `src` image finishes loading.
 * @fires avatar-error - Dispatched when the `src` image fails to load.
 * @fires avatar-click - Dispatched when an interactive avatar is activated.
 *
 * @version
 * Material Design 3 - Expressive
 */
@customElement('mdc-avatar')
export class MDCAvatar extends BaseAvatar {}
