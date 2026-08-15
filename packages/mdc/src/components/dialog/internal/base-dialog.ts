/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, nothing } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { DialogAction } from './dialog-action'

/**
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/dialogs/specs
 */
export abstract class BaseDialog extends DialogAction {

    @property({ type: Boolean })
    public override quick: boolean = false

    @property({ type: String, attribute: 'return-value' })
    public override returnValue: string = ''

    @property({ type: String })
    public type: 'alert' | '' = ''

    @property({ type: Boolean, attribute: 'no-focus-trap', reflect: true })
    public noFocusTrap: boolean = false

    @query('dialog')
    protected declare readonly dialog: HTMLDialogElement | null
    @query('.scrim')
    protected declare readonly scrim: HTMLElement | null
    @query('.container')
    protected declare readonly container: HTMLElement | null
    @query('.headline')
    protected declare readonly headline: HTMLElement | null
    @query('.content')
    protected declare readonly content: HTMLElement | null
    @query('.actions')
    protected declare readonly actions: HTMLElement | null
    @query('.scroller')
    protected declare readonly scroller: HTMLElement | null
    @query('.top.anchor')
    protected declare readonly topAnchor: HTMLElement | null
    @query('.bottom.anchor')
    protected declare readonly bottomAnchor: HTMLElement | null
    @query('.first-focus-trap')
    protected declare readonly firstFocusTrap: HTMLElement | null
    @query('.last-focus-trap')
    private declare readonly lastFocusTrap: HTMLElement | null

    @state()
    private hasHeadline = false;
    @state()
    private hasActions = false;
    @state()
    private hasIcon = false;

    protected override render(): unknown {
        return html`
            ${this.renderScrim()}
            ${this.renderDialog()}
        `
    }

    protected renderScrim() {
        return html`
            <span aria-hidden="true" class="scrim"></span>
        `
    }

    protected getDialogClasses() {
        const scrollable = this.open && !(this.isAtScrollTop && this.isAtScrollBottom)
        return {
            'has-headline': this.hasHeadline,
            'has-actions': this.hasActions,
            'has-icon': this.hasIcon,
            'scrollable': scrollable,
            'show-top-divider': scrollable && !this.isAtScrollTop,
            'show-bottom-divider': scrollable && !this.isAtScrollBottom,
        }
    }

    protected renderDialog() {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <dialog
                class="${classMap(this.getDialogClasses())}"
                aria-label=${ariaLabel || nothing}
                role=${this.type === 'alert' ? 'alertdialog' : nothing}
                .returnValue=${this.returnValue}
                @cancel=${this.handleCancel}
                @click=${this.handleDialogClick}
                @close=${this.handleClose}
                @keydown=${this.handleKeydown}
            >
                ${!this.noFocusTrap ? html`<div class="first-focus-trap" tabindex="0"
                    @focus=${this.handleFirstFocusTrapFocus}></div>` : nothing}
                <div class="container" @click=${this.handleContentClick}>
                    <div class="headline">
                        ${this.renderHeadlineIcon()}
                        ${this.renderHeadlineLabel()}
                        <mdc-divider></mdc-divider>
                    </div>
                    ${this.renderContent()}
                    ${this.renderActions()}
                </div>
                ${!this.noFocusTrap ? html`<div class="last-focus-trap" tabindex="0"
                    @focus=${this.handleLastFocusTrapFocus}></div>` : nothing}
            </dialog>
        `
    }

    protected renderHeadlineLabel() {
        return html`
            <h2 id="headline" .aria-hidden=${!this.hasHeadline || nothing}>
                <slot name="headline" @slotchange=${this.handleHeadlineChange}></slot>
            </h2>
        `
    }
    protected renderHeadlineIcon() {
        return html`
            <div class="icon" aria-hidden="true">
                <slot name="icon" @slotchange=${this.handleIconChange}></slot>
            </div>
        `
    }
    protected renderActions() {
        return html`
            <div class="actions">
                <mdc-divider></mdc-divider>
                <slot name="actions" @slotchange=${this.handleActionsChange}></slot>
            </div>
        `
    }
    protected renderContent() {
        return html`
            <div class="scroller">
                <div class="content">
                    <div class="top anchor"></div>
                    <slot name="content"></slot>
                    <div class="bottom anchor"></div>
                </div>
            </div>
        `
    }



    override connectedCallback() {
        super.connectedCallback()
        this.isConnectedPromiseResolve()
    }

    override disconnectedCallback() {
        super.disconnectedCallback()
        this.isConnectedPromise = this.getIsConnectedPromise()
    }



    private handleHeadlineChange(event: Event) {
        const slot = event.target as HTMLSlotElement
        this.hasHeadline = slot.assignedElements().length > 0
    }

    private handleActionsChange(event: Event) {
        const slot = event.target as HTMLSlotElement
        this.hasActions = slot.assignedElements().length > 0
    }

    private handleIconChange(event: Event) {
        const slot = event.target as HTMLSlotElement
        this.hasIcon = slot.assignedElements().length > 0
    }

    private handleFirstFocusTrapFocus() {
        // Focus trapped at the start — move focus to the last focusable element.
        const focusable = this.getFocusableElements()
        if (focusable.length > 0) {
            focusable[focusable.length - 1].focus()
        }
    }

    private handleLastFocusTrapFocus() {
        // Focus trapped at the end — move focus to the first focusable element.
        const focusable = this.getFocusableElements()
        if (focusable.length > 0) {
            focusable[0].focus()
        }
    }

    private getFocusableElements(): HTMLElement[] {
        if (!this.dialog) {
            return []
        }
        const candidates = this.dialog.querySelectorAll<HTMLElement>(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
        )
        return Array.from(candidates).filter(
            (el) => !el.hasAttribute('disabled')
                && !el.getAttribute('aria-hidden')
                && !el.classList.contains('first-focus-trap')
                && !el.classList.contains('last-focus-trap'),
        )
    }
}
