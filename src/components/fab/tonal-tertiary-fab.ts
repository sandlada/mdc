/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { Fab } from './fab'
import { tonalTertiaryFabStyles } from './fab.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-tonal-tertiary-fab": TonalTertiaryFab
    }
}

@customElement('mdc-tonal-tertiary-fab')
export class TonalTertiaryFab extends Fab {
    static override styles = tonalTertiaryFabStyles
}
