/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseDockedToolbar } from './internal/base-docked-toolbar'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-docked-toolbar': MDCDockedToolbar
    }
}

/**
 * `<mdc-docked-toolbar>` spans the full width of the screen (typically anchored
 * at the bottom) to house global or persistent application-wide actions.
 *
 * @version
 * Material Design 3 Expressive
 *
 * @link
 * https://m3.material.io/components/toolbars/overview
 * https://m3.material.io/components/toolbars/specs
 */
@customElement('mdc-docked-toolbar')
export class MDCDockedToolbar extends BaseDockedToolbar {}
