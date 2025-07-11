/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { ExtendedFab } from './extended-fab'
import { secondaryExtendedFabStyles } from './fab.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-extended-secondary-fab": ExtendedSecondaryFab
    }
}

@customElement('mdc-extended-secondary-fab')
export class ExtendedSecondaryFab extends ExtendedFab {
    static override styles = secondaryExtendedFabStyles
}
