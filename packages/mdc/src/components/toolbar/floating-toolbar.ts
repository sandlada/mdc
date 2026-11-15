/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseFloatingToolbar } from './internal/base-floating-toolbar'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-floating-toolbar': MDCFloatingToolbar
    }
}

/**
 * `<mdc-floating-toolbar>` floats above body content to provide contextual,
 * page-specific actions in a pill-shaped container, with optional paired FAB
 * and animated expand/collapse support.
 *
 * @version
 * Material Design 3 Expressive
 *
 * @link
 * https://m3.material.io/components/toolbars/overview
 * https://m3.material.io/components/toolbars/specs
 */
@customElement('mdc-floating-toolbar')
export class MDCFloatingToolbar extends BaseFloatingToolbar {}
