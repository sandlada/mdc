/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseExtendedFab } from './internal/base-extended-fab'
import { fabStyles } from './internal/fab.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-fab": MDCFab
    }
}

/**
 * Fab provides a label and an icon.
 *
 * Note that the tag must be wrapped with a span or div tag.
 * The label is not displayed by default, and the label is displayed through the extended attribute:
 *
 * @example
 * ```html
 * <mdc-fab variant="primary" extended>
 *     <span>FAB</span>
 * </mdc-fab>
 * ```
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/floating-action-button/overview
 */
@customElement('mdc-fab')
export class MDCFab extends BaseExtendedFab {
    static override styles = fabStyles
}
