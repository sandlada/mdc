/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { Fab } from './fab'
import { tertiaryFabStyles } from './fab.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-tertiary-fab": TertiaryFab
    }
}

@customElement('mdc-tertiary-fab')
export class TertiaryFab extends Fab {
    static override styles = tertiaryFabStyles
}
