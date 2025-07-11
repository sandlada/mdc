/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { Fab } from './fab'
import { secondaryFabStyles } from './fab.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-secondary-fab": SecondaryFab
    }
}

@customElement('mdc-secondary-fab')
export class SecondaryFab extends Fab {
    static override styles = secondaryFabStyles
}
