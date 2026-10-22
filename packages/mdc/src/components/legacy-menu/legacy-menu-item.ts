/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseLegacyMenuItem } from './internal/base-legacy-menu-item'

/**
 * MD3 Baseline standard menu item (static shell, M3).
 *
 * One-line 48dp row with leading / content / end zones, `label-large` type,
 * 24dp icons, 12dp horizontal padding, and a secondary-container selected
 * state. `href` forces `link`
 * type; `checkable` / `radio` switch the ARIA role. Activation and roving
 * tabindex land in M4.
 *
 * @element mdc-legacy-menu-item
 * @slot - Primary label text.
 * @slot leading - Leading icon.
 * @slot supporting - Supporting text below the label.
 * @slot trailing - Trailing icon.
 */
@customElement('mdc-legacy-menu-item')
export class MDCLegacyMenuItem extends BaseLegacyMenuItem {
    protected override getHostClasses(): Record<string, boolean> {
        return {
            ...super.getHostClasses(),
            'mdc-legacy-menu-item': true,
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-legacy-menu-item': MDCLegacyMenuItem
    }
}
