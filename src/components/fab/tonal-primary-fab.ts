/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { Fab } from './fab'
import { tonalPrimaryFabStyles } from './fab.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-tonal-primary-fab": TonalPrimaryFab
    }
}

@customElement('mdc-tonal-primary-fab')
export class TonalPrimaryFab extends Fab {
    static override styles = tonalPrimaryFabStyles
}
