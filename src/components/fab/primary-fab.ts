/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { Fab } from './fab'
import { primaryFabStyles } from './fab.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-primary-fab": PrimaryFab
    }
}

@customElement('mdc-primary-fab')
export class PrimaryFab extends Fab {
    static override styles = primaryFabStyles
}
