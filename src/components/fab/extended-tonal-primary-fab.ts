/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { ExtendedFab } from './extended-fab'
import { tonalPrimaryExtendedFabStyles } from './fab.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-extended-tonal-primary-fab": ExtendedTonalPrimaryFab
    }
}

@customElement('mdc-extended-tonal-primary-fab')
export class ExtendedTonalPrimaryFab extends ExtendedFab {
    static override styles = tonalPrimaryExtendedFabStyles
}
