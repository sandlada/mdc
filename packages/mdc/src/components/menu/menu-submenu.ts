/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseMenuSubmenu } from './internal/base-menu-submenu'

/**
 * A Material Design 3 Expressive nested menu surface (static render shell).
 *
 * The nested surface mirrors the `mdc-menu` container per color-style
 * (reflected `variant` attribute). Right / Enter opens and focuses the
 * first nested item, Left / Escape closes and refocuses the trigger;
 * pointer hover follows the hover-intent timers (`open-delay` / 120,
 * `close-delay` / 220 defaults, spec-TODO).
 *
 * @element mdc-menu-submenu
 * @slot - The nested `mdc-menu-item` children.
 * @slot leading - Leading icon of the trigger row.
 * @slot trailing - Trailing chevron of the trigger row.
 * @slot section-label - Group labels inside the nested surface.
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/menus/specs
 */
@customElement('mdc-menu-submenu')
export class MDCMenuSubmenu extends BaseMenuSubmenu {

    protected override getHostClasses(): Record<string, boolean> {
        return {
            ...super.getHostClasses(),
            [`variant-${this.variant}`]: true,
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-menu-submenu': MDCMenuSubmenu
    }
}
