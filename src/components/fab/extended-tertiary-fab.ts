/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { ExtendedFab } from './extended-fab'
import { tertiaryExtendedFabStyles } from './fab.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-extended-tertiary-fab": ExtendedTertiaryFab
    }
}

@customElement('mdc-extended-tertiary-fab')
export class ExtendedTertiaryFab extends ExtendedFab {
    static override styles = tertiaryExtendedFabStyles
}
