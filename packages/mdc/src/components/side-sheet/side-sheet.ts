/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import '../elevation/elevation'
import '../divider/divider'
import { BaseSideSheet } from './internal/base-side-sheet'
import { sideSheetStyles } from './side-sheet.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-side-sheet': SideSheet
    }
}

/**
 * Material Design 3 Side Sheet.
 *
 * A vertically-extending (standard) or full-height (modal) panel anchored
 * to one edge of the viewport. Two variants:
 *  - standard: co-exists with main UI, no scrim, `surface` background
 *  - modal: blocks interaction via a scrim, `surface-container-low` background
 *
 * Default variant is `standard`. Set `variant="modal"` on the element to
 * switch.
 *
 * @slot - Body content.
 * @slot headline - The `<h2>` headline text.
 * @slot headline-icon - Optional back icon-button (modal + show-back-button).
 * @slot close-icon - Optional replacement close icon (default inline SVG).
 * @slot actions - Footer action buttons.
 *
 * @example
 * ```html
 * <mdc-side-sheet variant="standard" open>
 *     <span slot="headline">Filters</span>
 *     <p>Filter content</p>
 * </mdc-side-sheet>
 * ```
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/side-sheets/guidelines
 */
@customElement('mdc-side-sheet')
export class SideSheet extends BaseSideSheet {
    public static override styles = sideSheetStyles
}
