/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, nothing } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
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

    @property({ type: String, attribute: false })
    public override returnValue: string = ''

    @property({ type: String, attribute: false })
    public type: 'alert' | '' = ''

    private readonly treewalker

    @query('dialog')
    protected override readonly dialog!: HTMLDialogElement | null
    @query('.scrim')
    protected override readonly scrim!: HTMLDialogElement | null
    @query('.container')
    protected override readonly container!: HTMLDialogElement | null
    @query('.headline')
    protected override readonly headline!: HTMLDialogElement | null
    @query('.content')
    protected override readonly content!: HTMLDialogElement | null
    @query('.actions')
    protected override readonly actions!: HTMLDialogElement | null
    @query('.scroller')
    protected override readonly scroller!: HTMLElement | null
    @query('.top.anchor')
    protected override readonly topAnchor!: HTMLElement | null
    @query('.bottom.anchor')
    protected override readonly bottomAnchor!: HTMLElement | null
    @query('.focus-trap')
    protected override readonly firstFocusTrap!: HTMLElement | null

    // Dialogs should not be SSR'd while open, so we can just use runtime checks.
    @state()
    private hasHeadline = false;
    @state()
    private hasActions = false;
    @state()
    private hasIcon = false;

    constructor() {
        super()
        if (isServer) {
            this.treewalker = null
            return
        }
        this.treewalker = document.createTreeWalker(this, NodeFilter.SHOW_ELEMENT)
    }

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

    protected renderDialog() {
        const { ariaLabel } = this as AriaMixinStrict
        const scrollable = this.open && !(this.isAtScrollTop && this.isAtScrollBottom);
        const classes = classMap({
            'has-headline': this.hasHeadline,
            'has-actions': this.hasActions,
            'has-icon': this.hasIcon,
            'scrollable': scrollable,
            'show-top-divider': scrollable && !this.isAtScrollTop,
            'show-bottom-divider': scrollable && !this.isAtScrollBottom,
        })
        return html`
            <dialog
                class="${classes}"
                aria-label=${ariaLabel || nothing}
                role=${this.type === 'alert' ? 'alertdialog' : nothing}
                .returnValue=${this.returnValue}
                @cancel=${this.handleCancel}
                @click=${this.handleDialogClick}
                @close=${this.handleClose}
                @keydown=${this.handleKeydown}
            >
                <div class="container" @click=${this.handleContentClick}>
                    <div class="headline">
                        ${this.renderHeadlineIcon()}
                        ${this.renderHeadlineLabel()}
                        <mdc-divider></mdc-divider>
                    </div>
                    ${this.renderContent()}
                    ${this.renderActions()}
                </div>
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


}
