/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * [Modified by Kai-Orion & Sandlada]
 */
import { html, isServer, LitElement, nothing } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { redispatchEvent } from '../../../utils/event/redispatch-event'

/**
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/dialogs/specs
 */
export abstract class BaseDialog extends composeMixin(mixinDelegatesAria)(LitElement) {

    @property({ type: Boolean, noAccessor: true })
    public get open(): boolean {
        return this.isOpen
    }
    public set open(value: boolean) {
        if (value === this.isOpen) {
            return
        }
        this.isOpen = value
        if (value) {
            this.setAttribute('open', '')
            this.show?.()
        } else {
            this.removeAttribute('open')
            this.close?.()
        }
    }

    @property({ type: Boolean })
    public quick: boolean = false

    @property({ type: String, attribute: 'return-value' })
    public returnValue: string = ''

    @property({ type: String })
    public type: 'alert' | '' = ''

    @property({ type: Boolean, attribute: 'no-focus-trap', reflect: true })
    public noFocusTrap: boolean = false

    @state()
    protected isAtScrollTop = false;
    @state()
    protected isAtScrollBottom = false;

    protected isOpen = false
    protected isOpening = false
    protected isConnectedPromiseResolve!: () => void
    protected isConnectedPromise = this.getIsConnectedPromise()
    protected nextClickIsFromContent = false;
    protected intersectionObserver?: IntersectionObserver
    protected escapePressedWithoutCancel = false

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

    protected getIsConnectedPromise() {
        return new Promise<void>((resolve) => {
            this.isConnectedPromiseResolve = resolve
        })
    }

    constructor() {
        super()
        if (isServer) {
            return
        }
        this.addEventListener('submit', this.handleSubmit.bind(this))
    }

    override connectedCallback() {
        super.connectedCallback()
        this.isConnectedPromiseResolve()
    }

    public override disconnectedCallback() {
        super.disconnectedCallback()
        this.isConnectedPromise = this.getIsConnectedPromise()
        this.disconnectIntersectionObserver()
    }

    protected override render(): unknown {
        return html`
            ${this.renderScrim()}
            ${this.renderDialog()}
        `
    }

    protected renderScrim() {
        return html`
            <span aria-hidden="true" class="${this.quick ? 'scrim quick' : 'scrim'}"></span>
        `
    }

    protected getDialogClasses() {
        const scrollable = this.open && !(this.isAtScrollTop && this.isAtScrollBottom)
        return {
            'has-headline': this.hasHeadline,
            'has-actions': this.hasActions,
            'has-icon': this.hasIcon,
            'quick': this.quick,
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

    public async show() {
        this.isOpening = true
        // Dialogs can be opened before being attached to the DOM, so we need to
        // wait until we're connected before calling `showModal()`.
        await this.isConnectedPromise
        await this.updateComplete
        const dialog = this.dialog!
        // Check if already opened or if `dialog.close()` was called while awaiting.
        if (dialog.open || !this.isOpening) {
            this.isOpening = false
            return
        }

        const preventOpen = !this.dispatchEvent(
            new Event('open', { cancelable: true }),
        )
        if (preventOpen) {
            this.open = false
            this.isOpening = false
            return
        }

        // All Material dialogs are modal.
        dialog.showModal()
        this.open = true
        // Reset scroll position if re-opening a dialog with the same content.
        if (this.scroller) {
            this.scroller.scrollTop = 0
        }
        // After resetting scroll, the top anchor is visible and bottom depends
        // on content height. Set initial state before observing.
        this.isAtScrollTop = true
        this.isAtScrollBottom = !this.scroller ||
            this.scroller.scrollHeight <= this.scroller.clientHeight
        this.connectIntersectionObserver()
        // Native modal dialogs ignore autofocus and instead force focus to the
        // first focusable child. Override this behavior if there is a child with
        // an autofocus attribute.
        this.querySelector<HTMLElement>('[autofocus]')?.focus()

        await this.waitForAnimations()
        this.dispatchEvent(new Event('opened'))
        this.isOpening = false
    }

    /**
     * Closes the dialog and fires a cancelable `close` event. After a dialog's
     * animation, a `closed` event is fired.
     *
     * @param returnValue A return value usually indicating which button was used
     *     to close a dialog. If a dialog is canceled by clicking the scrim or
     *     pressing Escape, it will not change the return value after closing.
     * @return A Promise that resolves after the animation is finished and the
     *     `closed` event was fired.
     */
    public async close(returnValue = this.returnValue) {
        this.isOpening = false
        if (!this.isConnected) {
            // Disconnected dialogs do not fire close events or animate.
            this.open = false
            return
        }

        await this.updateComplete
        const dialog = this.dialog!
        // Check if already closed or if `dialog.show()` was called while awaiting.
        if (!dialog.open || this.isOpening) {
            this.open = false
            return
        }

        const prevReturnValue = this.returnValue
        this.returnValue = returnValue
        const preventClose = !this.dispatchEvent(
            new Event('close', { cancelable: true }),
        )
        if (preventClose) {
            this.returnValue = prevReturnValue
            return
        }

        // Close first: the close transition only starts once the native
        // `[open]` attribute is removed. `allow-discrete` keeps the dialog and
        // the scrim rendered until the transition ends.
        dialog.close(returnValue)
        this.disconnectIntersectionObserver()
        this.open = false
        await this.waitForAnimations()
        this.dispatchEvent(new Event('closed'))
    }

    /**
     * Waits until every CSS transition started by the last state change is
     * done. CSS transitions carry no awaitable handle of their own, so the
     * live ones are gathered from the rendered elements and awaited through
     * the Web Animations `finished` promises.
     *
     * A replaced or canceled transition (e.g. the state flipped again mid-way)
     * rejects `finished`, which counts as "no longer animating". When nothing
     * animates (`quick`, reduced motion, zero durations), this resolves
     * immediately.
     */
    private async waitForAnimations() {
        const animations = [
            ...(this.dialog?.getAnimations({ subtree: true }) ?? []),
            ...(this.scrim?.getAnimations() ?? []),
        ]
        if (animations.length === 0) {
            return
        }
        await Promise.all(
            animations.map((animation) =>
                animation.finished.catch(() => {
                    // Ignore intentional interruptions (replace or cancel).
                }),
            ),
        )
    }

    protected handleDialogClick() {
        if (this.nextClickIsFromContent) {
            // Avoid doing a layout calculation below if we know the click came from
            // content.
            this.nextClickIsFromContent = false
            return
        }

        // Click originated on the backdrop. Native `<dialog>`s will not cancel,
        // but Material dialogs do.
        const preventDefault = !this.dispatchEvent(
            new Event('cancel', { cancelable: true }),
        )
        if (preventDefault) {
            return
        }

        this.close()
    }

    protected handleContentClick() {
        this.nextClickIsFromContent = true
    }

    protected handleSubmit(event: SubmitEvent) {
        const form = event.target as HTMLFormElement
        const { submitter } = event
        if (form.getAttribute('method') !== 'dialog' || !submitter) {
            return
        }

        // Close reason is the submitter's value attribute, or the dialog's
        // `returnValue` if there is no attribute.
        this.close(submitter.getAttribute('value') ?? this.returnValue)
    }

    protected handleCancel(event: Event) {
        if (event.target !== this.dialog) {
            // Ignore any cancel events dispatched by content.
            return
        }
        this.escapePressedWithoutCancel = false
        const preventDefault = redispatchEvent(this, event)
        // We always prevent default on the original dialog event since we close
        // it through `close()` to let the closing transition play out.
        event.preventDefault()
        if (preventDefault) {
            return
        }

        this.close()
    }

    protected handleClose() {
        if (!this.escapePressedWithoutCancel) {
            return
        }
        this.escapePressedWithoutCancel = false
        this.dialog?.dispatchEvent(new Event('cancel', { cancelable: true }))
    }

    protected handleKeydown(event: KeyboardEvent) {
        if (event.key !== 'Escape') {
            return
        }
        // An escape key was pressed. If a "close" event fires next without a
        // "cancel" event first, then we know we're in the Chrome v120 bug.
        this.escapePressedWithoutCancel = true
        // Wait a full task for the cancel/close event listeners to fire, then
        // reset the flag.
        setTimeout(() => {
            this.escapePressedWithoutCancel = false
        })
    }

    private connectIntersectionObserver() {
        this.disconnectIntersectionObserver()
        if (!this.scroller || !this.topAnchor || !this.bottomAnchor) {
            return
        }
        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    this.handleAnchorIntersection(entry)
                }
            },
            { root: this.scroller },
        )
        this.intersectionObserver.observe(this.topAnchor)
        this.intersectionObserver.observe(this.bottomAnchor)
    }

    private disconnectIntersectionObserver() {
        this.intersectionObserver?.disconnect()
        this.intersectionObserver = undefined
    }

    private handleAnchorIntersection(entry: IntersectionObserverEntry) {
        const { target, isIntersecting } = entry
        if (target === this.topAnchor) {
            this.isAtScrollTop = isIntersecting
        }

        if (target === this.bottomAnchor) {
            this.isAtScrollBottom = isIntersecting
        }
    }
}
