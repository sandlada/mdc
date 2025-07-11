/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { ExtendedFab } from './extended-fab'
import { tonalSecondaryExtendedFabStyles } from './fab.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-extended-tonal-secondary-fab": ExtendedTonalSecondaryFab
    }
}

@customElement('mdc-extended-tonal-secondary-fab')
export class ExtendedTonalSecondaryFab extends ExtendedFab {
    static override styles = tonalSecondaryExtendedFabStyles
}
