/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { Fab } from './fab'
import { tonalSecondaryFabStyles } from './fab.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-tonal-secondary-fab": TonalSecondaryFab
    }
}

@customElement('mdc-tonal-secondary-fab')
export class TonalSecondaryFab extends Fab {
    static override styles = tonalSecondaryFabStyles
}
