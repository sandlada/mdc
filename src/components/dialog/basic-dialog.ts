/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseDialog } from './base-dialog'
import { basicDialogStyle } from './dialog.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-basic-dialog": BasicDialog
    }
}

@customElement('mdc-basic-dialog')
export class BasicDialog extends BaseDialog {
    static override styles = basicDialogStyle
}
