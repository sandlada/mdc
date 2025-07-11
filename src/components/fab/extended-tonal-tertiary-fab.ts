/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { ExtendedFab } from './extended-fab'
import { tonalTertiaryExtendedFabStyles } from './fab.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-extended-tonal-tertiary-fab": ExtendedTonalTertiaryFab
    }
}

@customElement('mdc-extended-tonal-tertiary-fab')
export class ExtendedTonalTertiaryFab extends ExtendedFab {
    static override styles = tonalTertiaryExtendedFabStyles
}
