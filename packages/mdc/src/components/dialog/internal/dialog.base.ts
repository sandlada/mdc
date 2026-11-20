/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * [Modified by Kai-Orion & Sandlada]
 */
import { html, LitElement, nothing } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { redispatchEvent } from '../../../utils/event/redispatch-event'
import '../../divider/divider'
import '../../elevation/elevation'
import type { DialogType, IDialog } from '../dialog.interface'

const BooleanTrueDefaultConverter = {
    fromAttribute(value: string | null): boolean {
        return value !== 'false'
    },
    toAttribute(value: boolean): string | null {
        return value ? null : 'false'
    },
}

/**
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/dialogs/specs
 */
export abstract class BaseDialog extends composeMixin(mixinDelegatesAria)(LitElement) implements IDialog {

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
    public type: DialogType = ''

    @property({ type: Boolean, attribute: 'no-focus-trap', reflect: true })
    public noFocusTrap: boolean = false

    @property({ converter: BooleanTrueDefaultConverter, attribute: 'dismiss-on-click-outside' })
    public dismissOnClickOutside: boolean = true

    @property({ converter: BooleanTrueDefaultConverter, attribute: 'dismiss-on-escape' })
    public dismissOnEscape: boolean = true

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
    protected hasHeadline = false
    @state()
    protected hasActions = false
    @state()
    protected hasIcon = false
    @state()
    protected hasContent = false

    protected getIsConnectedPromise() {
        return new Promise<void>((resolve) => {
            this.isConnectedPromiseResolve = resolve
        })
    }

    constructor() {
        super()
        if (typeof window === 'undefined') {
            return
        }
        this.addEventListener('submit', this.handleSubmit.bind(this), { capture: true })
    }

    override connectedCallback() {
        super.connectedCallback()
        this.isConnectedPromiseResolve()
    }

    protected override firstUpdated() {
        const headlineSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="headline"]')
        const actionsSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="actions"]')
        const iconSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="icon"]')
        const contentSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="content"]')
        if (headlineSlot) this.hasHeadline = headlineSlot.assignedElements().length > 0
        if (actionsSlot) this.hasActions = actionsSlot.assignedElements().length > 0
        if (iconSlot) this.hasIcon = iconSlot.assignedElements().length > 0
        if (contentSlot) this.hasContent = contentSlot.assignedElements().length > 0
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
                aria-labelledby=${this.hasHeadline && !ariaLabel ? 'headline' : nothing}
                aria-describedby=${this.hasContent ? 'content' : nothing}
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
                    <mdc-elevation aria-hidden="true"></mdc-elevation>
                    ${this.renderContainer()}
                </div>
                ${!this.noFocusTrap ? html`<div class="last-focus-trap" tabindex="0"
                    @focus=${this.handleLastFocusTrapFocus}></div>` : nothing}
            </dialog>
        `
    }

    protected renderContainer() {
        return html`
            <div class="headline">
                ${this.renderHeadlineIcon()}
                ${this.renderHeadlineLabel()}
                <mdc-divider></mdc-divider>
            </div>
            ${this.renderContent()}
            ${this.renderActions()}
        `
    }

    protected renderHeadlineLabel() {
        return html`
            <h2 id="headline" aria-hidden=${!this.hasHeadline ? 'true' : nothing}>
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
                <div class="content" id="content">
                    <div class="top anchor"></div>
                    <slot name="content" @slotchange=${this.handleContentChange}></slot>
                    <div class="bottom anchor"></div>
                </div>
            </div>
        `
    }

    protected handleHeadlineChange(event: Event) {
        const slot = event.target as HTMLSlotElement
        this.hasHeadline = slot.assignedElements().length > 0
    }

    protected handleActionsChange(event: Event) {
        const slot = event.target as HTMLSlotElement
        this.hasActions = slot.assignedElements().length > 0
    }

    protected handleIconChange(event: Event) {
        const slot = event.target as HTMLSlotElement
        this.hasIcon = slot.assignedElements().length > 0
    }

    protected handleContentChange(event: Event) {
        const slot = event.target as HTMLSlotElement
        this.hasContent = slot.assignedElements().length > 0
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
        const selector =
            'a[href], button, textarea, input, select, mdc-button, mdc-icon-button, mdc-text-field, [tabindex]:not([tabindex="-1"])'
        const shadowCandidates = this.dialog
            ? Array.from(this.dialog.querySelectorAll<HTMLElement>(selector))
            : []
        const lightCandidates = Array.from(this.querySelectorAll<HTMLElement>(selector))
        const seen = new Set<HTMLElement>()
        const results: HTMLElement[] = []
        for (const el of [...shadowCandidates, ...lightCandidates]) {
            if (seen.has(el)) continue
            seen.add(el)
            if (
                el.hasAttribute('disabled') ||
                el.getAttribute('aria-hidden') === 'true' ||
                el.classList.contains('first-focus-trap') ||
                el.classList.contains('last-focus-trap')
            ) {
                continue
            }
            results.push(el)
        }
        return results
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

        if (!this.dismissOnClickOutside) {
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
        if (form?.getAttribute('method') !== 'dialog') {
            return
        }

        event.preventDefault()
        const { submitter } = event
        const submitterValue = submitter?.getAttribute('value')
            ?? (submitter as { value?: string } | null)?.value
        // Close reason is the submitter's value, or the dialog's `returnValue`.
        this.close(submitterValue ?? this.returnValue)
    }

    protected handleCancel(event: Event) {
        if (event.target !== this.dialog) {
            // Ignore any cancel events dispatched by content.
            return
        }
        this.escapePressedWithoutCancel = false
        // We always prevent default on the original dialog event since we close
        // it through `close()` to let the closing transition play out.
        event.preventDefault()
        if (!this.dismissOnEscape) {
            return
        }
        const preventDefault = redispatchEvent(this, event)
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
        if (!this.dismissOnEscape) {
            return
        }
        this.dialog?.dispatchEvent(new Event('cancel', { cancelable: true }))
    }

    protected handleKeydown(event: KeyboardEvent) {
        if (event.key !== 'Escape') {
            return
        }
        if (!this.dismissOnEscape) {
            event.preventDefault()
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
