/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { FabMenuStyles } from './fab-menu.style'
import { BaseFabMenu } from './internal/base-fab-menu'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-fab-menu': MDCFabMenu
    }
}

/**
 * A Material Design 3 Expressive FAB menu container.
 *
 * Displays 2 to 6 related actions (`<mdc-fab-menu-item>`) expanding from a
 * Floating Action Button. When expanded, the trigger FAB morphs into a 56dp
 * circular close button.
 *
 * @element mdc-fab-menu
 *
 * @slot - The `<mdc-fab-menu-item>` children.
 * @slot icon - Optional icon shown on the closed FAB (defaults to `+`).
 * @slot close-icon - Optional icon shown on the expanded close button (defaults to `×`).
 * @slot trigger - Optional custom trigger element replacing the built-in toggle FAB.
 *
 * @fires open - Dispatched before the menu opens (cancelable).
 * @fires opened - Dispatched after the menu finishes opening.
 * @fires close - Dispatched before the menu closes (cancelable).
 * @fires closed - Dispatched after the menu finishes closing.
 * @fires expanded-change - Dispatched when `expanded` changes.
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/fab-menu/overview
 */
@customElement('mdc-fab-menu')
export class MDCFabMenu extends BaseFabMenu {
    static override styles = FabMenuStyles
}
