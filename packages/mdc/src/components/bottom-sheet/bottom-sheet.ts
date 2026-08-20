/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseBottomSheet } from './internal/base-bottom-sheet'
import { bottomSheetStyles } from './bottom-sheet.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-bottom-sheet': BottomSheet
    }
}

/**
 * Material Design 3 Bottom Sheet.
 *
 * A horizontally-spanning panel anchored to the bottom edge of the viewport.
 * Two variants:
 *  - standard: co-exists with main UI, no scrim, `surface` background
 *  - modal: blocks interaction via a scrim, `surface-container-low` background
 *
 * Default variant is `modal`. The modal variant supports two detents
 * (`peek`, `full`); drag-to-dismiss with snap-to-detent-or-close when
 * `draggable=true`.
 *
 * @slot - Body content.
 * @slot headline - The `<h2>` headline text.
 * @slot close-icon - Optional replacement close icon (default inline SVG).
 * @slot actions - Footer action buttons.
 *
 * @example
 * ```html
 * <mdc-bottom-sheet variant="modal" detent="peek" open>
 *     <span slot="headline">Filters</span>
 *     <p>Filter content</p>
 * </mdc-bottom-sheet>
 * ```
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/bottom-sheets/overview
 */
@customElement('mdc-bottom-sheet')
export class BottomSheet extends BaseBottomSheet {
    public static override styles = bottomSheetStyles
}
