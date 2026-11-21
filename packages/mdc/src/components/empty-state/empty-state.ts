/**
 * @version 2026.11.21
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type TemplateResult } from 'lit'
import { customElement } from 'lit/decorators.js'
import type { IMDCEmptyState } from './empty-state.interface'
import { EmptyStateStyles } from './empty-state.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-empty-state': MDCEmptyState
    }
}

/**
 * Displays an empty screen or section using a centered, vertical layout.
 *
 * @element mdc-empty-state
 * @slot illustration - Optional icon or image.
 * @slot headline - Heading at the level appropriate for the page.
 * @slot supporting-text - Optional explanation or instructions.
 * @slot actions - Optional buttons or links.
 */
@customElement('mdc-empty-state')
export class MDCEmptyState extends LitElement implements IMDCEmptyState {
    public static override styles = EmptyStateStyles

    protected override render(): TemplateResult {
        const occupiedSlots = new Set(Array.from(this.children, (child) => child.slot))

        return html`
            <slot name="illustration" ?hidden=${!occupiedSlots.has('illustration')} @slotchange=${this.handleSlotChange}></slot>
            <slot name="headline" ?hidden=${!occupiedSlots.has('headline')} @slotchange=${this.handleSlotChange}></slot>
            <slot name="supporting-text" ?hidden=${!occupiedSlots.has('supporting-text')} @slotchange=${this.handleSlotChange}></slot>
            <slot name="actions" ?hidden=${!occupiedSlots.has('actions')} @slotchange=${this.handleSlotChange}></slot>
        `
    }

    private handleSlotChange(): void {
        this.requestUpdate()
    }
}
