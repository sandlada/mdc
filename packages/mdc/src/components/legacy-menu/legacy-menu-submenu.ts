/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseLegacyMenuSubmenu } from './internal/base-legacy-menu-submenu'

/**
 * MD3 Baseline standard submenu (static shell, M3).
 *
 * Renders a menu-item-like trigger row (defaults to the `label` plus an
 * expand icon; replace via the `trigger` slot) and a nested `SurfaceContainer`
 * surface at `right-start` (mirrored in RTL). Right / Enter opens and focuses
 * the first nested item, Left / Escape closes and refocuses the trigger;
 * pointer hover follows the hover-intent delays.
 *
 * @element mdc-legacy-menu-submenu
 * @slot trigger - Trigger row override (defaults to the label + expand icon).
 * @slot - Nested menu items.
 * @slot surface - Nested surface override.
 */
@customElement('mdc-legacy-menu-submenu')
export class MDCLegacyMenuSubmenu extends BaseLegacyMenuSubmenu {
    protected override getHostClasses(): Record<string, boolean> {
        return {
            ...super.getHostClasses(),
            'mdc-legacy-menu-submenu': true,
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-legacy-menu-submenu': MDCLegacyMenuSubmenu
    }
}
