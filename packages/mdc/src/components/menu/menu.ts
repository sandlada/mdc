/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseMenu } from './internal/base-menu'

/**
 * A Material Design 3 Expressive menu container (static render shell).
 *
 * The `variant` attribute reflects the expressive color-style axis
 * (`standard` → surface-container-low, `vibrant` → tertiary-container);
 * `layout="grouped"` renders a single surface with divider / `section-label`
 * slots (inset gaps are Android-only). Open / close behavior, positioning
 * and keyboard handling land in M4.
 *
 * @element mdc-menu
 * @slot - The `mdc-menu-item` / `mdc-menu-submenu` children.
 * @slot trigger - The anchor element that toggles the menu.
 * @slot surface - The menu surface wrapper (optional override).
 * @slot section-label - Group labels, only used when `layout` is `grouped`.
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/menus/specs
 */
@customElement('mdc-menu')
export class MDCMenu extends BaseMenu {

    protected override getHostClasses(): Record<string, boolean> {
        return {
            ...super.getHostClasses(),
            [`variant-${this.variant}`]: true,
            [`layout-${this.layout}`]: true,
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-menu': MDCMenu
    }
}
