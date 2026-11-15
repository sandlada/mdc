/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseMenuGroup } from './internal/base-menu-group'

/**
 * A Material Design 3 Expressive grouped menu surface.
 *
 * Renders an elevated rounded group container inside `mdc-menu[layout="grouped"]`
 * separated by gaps, with optional group header label.
 *
 * @element mdc-menu-group
 * @slot - The `mdc-menu-item` / `mdc-menu-submenu` children in this group.
 * @slot label - Optional custom group header label.
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/menus/specs
 */
@customElement('mdc-menu-group')
export class MDCMenuGroup extends BaseMenuGroup {}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-menu-group': MDCMenuGroup
    }
}
