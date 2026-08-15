/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseChipSet } from './internal/base-chip-set'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-chip-set': MDCChipSet
    }
}

/**
 * @element mdc-chip-set
 *
 * A container that groups `mdc-chip` elements, roves focus with arrow keys
 * (Home / End included, RTL-aware), and optionally enforces single-select.
 *
 * @slot - The `mdc-chip` children.
 *
 * @fires chip-set-selection - Dispatched when a chip's selection changes.
 *
 * @cssproperty --mdc-chip-set-container-gap-space
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/chips/overview
 */
@customElement('mdc-chip-set')
export class MDCChipSet extends BaseChipSet {}
