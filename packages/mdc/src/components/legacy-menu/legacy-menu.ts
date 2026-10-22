/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseLegacyMenu } from './internal/base-legacy-menu'

/**
 * MD3 Baseline standard menu (static shell, M3).
 *
 * Renders an anchor `trigger` slot plus a `SurfaceContainer` surface (4dp
 * corners, Level2) hosting `section-label`, default item, and
 * `surface`-override slots. Open / close, positioning, and keyboard
 * navigation land in M4.
 *
 * @element mdc-legacy-menu
 * @slot trigger - Anchor element the surface positions against.
 * @slot section-label - Group label row (`label-small`, 32dp header).
 * @slot - Menu items (`mdc-legacy-menu-item` / `mdc-legacy-menu-submenu`) and dividers.
 * @slot surface - Surface override (replaces the default surface content).
 */
@customElement('mdc-legacy-menu')
export class MDCLegacyMenu extends BaseLegacyMenu {
    protected override getHostClasses(): Record<string, boolean> {
        return {
            ...super.getHostClasses(),
            'mdc-legacy-menu': true,
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-legacy-menu': MDCLegacyMenu
    }
}
