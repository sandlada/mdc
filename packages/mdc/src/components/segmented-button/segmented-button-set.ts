/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Public `mdc-segmented-button-set` element — the selection-owning container.
 */
import { customElement } from 'lit/decorators.js'
import { BaseSegmentedButtonSet } from './internal/base-segmented-button-set'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-segmented-button-set': SegmentedButtonSet
    }
}

/**
 * @element mdc-segmented-button-set
 *
 * A group of `mdc-segmented-button` segments with one selection model:
 * exactly one selected segment (default, radio semantics) or any number
 * (`multiselect`, checkbox semantics). The set owns selection, roving
 * focus and the surrounding outline.
 *
 * @slot — One or more `mdc-segmented-button` elements.
 *
 * @fires segmented-button-set-selection {CustomEvent<{button: SegmentedButton, selected: boolean, index: number}>}
 *     Dispatched when a selection changes, on user interaction or through the
 *     `setButtonSelected` / `toggleSelection` methods. --bubbles --composed
 *
 * @cssproperty --mdc-segmented-button-container-height
 * @cssproperty --mdc-segmented-button-shape-start-start
 * @cssproperty --mdc-segmented-button-shape-start-end
 * @cssproperty --mdc-segmented-button-shape-end-start
 * @cssproperty --mdc-segmented-button-shape-end-end
 */
@customElement('mdc-segmented-button-set')
export class SegmentedButtonSet extends BaseSegmentedButtonSet {
    static override styles = BaseSegmentedButtonSet.styles
}
