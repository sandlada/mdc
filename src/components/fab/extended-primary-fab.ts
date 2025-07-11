/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { ExtendedFab } from './extended-fab'
import { primaryExtendedFabStyles } from './fab.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-extended-primary-fab": ExtendedPrimaryFab
    }
}

@customElement('mdc-extended-primary-fab')
export class ExtendedPrimaryFab extends ExtendedFab {
    static override styles = primaryExtendedFabStyles
}
