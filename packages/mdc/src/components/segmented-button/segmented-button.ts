/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Public `mdc-segmented-button` element — a single selectable segment.
 */
import { customElement } from 'lit/decorators.js'
import { BaseSegmentedButton } from './internal/base-segmented-button'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-segmented-button': SegmentedButton
    }
}

/**
 * @element mdc-segmented-button
 *
 * A selectable segment of an `mdc-segmented-button-set`. Selection state is
 * owned by the parent set, so a segment is only meaningful as its child.
 *
 * The segment renders the MD3 *outlined* variant: a 1px border around the
 * whole set that doubles as the divider between adjacent segments.
 *
 * @slot icon — Optional leading icon.
 * @slot — The segment label text.
 *
 * @fires segmented-button-interaction — Dispatched when the segment is
 *     activated; the parent set decides whether the selection commits.
 *
 * @cssproperty --mdc-segmented-button-enabled-container-color-selected
 * @cssproperty --mdc-segmented-button-enabled-label-color-selected
 * @cssproperty --mdc-segmented-button-enabled-label-color-unselected
 * @cssproperty --mdc-segmented-button-enabled-outline-color
 * @cssproperty --mdc-segmented-button-icon-size
 * ...
 */
@customElement('mdc-segmented-button')
export class SegmentedButton extends BaseSegmentedButton {
    static override styles = BaseSegmentedButton.styles
}
