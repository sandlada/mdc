/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../icon-button/icon-button'
import '../icon/icon'
import { BaseDialog } from './internal/dialog.base'
import { FullscreenDialogStyle } from './internal/dialog.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-fullscreen-dialog': FullscreenDialog
    }
}

/**
 * Material Design 3 full-screen dialog (`mdc-fullscreen-dialog`).
 *
 * @slot close - Custom leading close button (defaults to an `mdc-icon-button` with `close` icon).
 * @slot headline - Dialog title displayed in the header.
 * @slot actions - Trailing header action button(s).
 * @slot content - Scrollable body content.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/dialogs/specs
 */
@customElement('mdc-fullscreen-dialog')
export class FullscreenDialog extends BaseDialog {
    static override styles = FullscreenDialogStyle

    /** Accessible label for the default leading close icon button. */
    @property({ type: String, attribute: 'close-label' })
    public closeLabel: string = 'Close'

    protected override renderContainer() {
        return html`
            <div class="header">
                <mdc-elevation aria-hidden="true"></mdc-elevation>
                <div class="close-button">
                    <slot name="close">
                        <mdc-icon-button
                            aria-label=${this.closeLabel}
                            @click=${this.handleCloseButtonClick}
                        >
                            <mdc-icon>close</mdc-icon>
                        </mdc-icon-button>
                    </slot>
                </div>
                <h2 id="headline" class="headline" aria-hidden=${!this.hasHeadline ? 'true' : nothing}>
                    <slot name="headline" @slotchange=${this.handleHeadlineChange}></slot>
                </h2>
                <div class="actions">
                    <slot name="actions" @slotchange=${this.handleActionsChange}></slot>
                </div>
                <mdc-divider></mdc-divider>
            </div>
            ${this.renderContent()}
        `
    }

    private handleCloseButtonClick() {
        const preventDefault = !this.dispatchEvent(
            new Event('cancel', { cancelable: true }),
        )
        if (preventDefault) {
            return
        }
        this.close()
    }
}
