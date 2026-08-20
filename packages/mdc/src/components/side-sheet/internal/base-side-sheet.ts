/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { baseSideSheetStyles } from './base-side-sheet.style'
import {
    SideSheetDefaultCloseAnimation,
    SideSheetDefaultOpenAnimation,
    type SideSheetAnimation,
    type SideSheetAnimationArgs,
} from '../side-sheet.animation'
import {
    SIDE_SHEET_ACTION_EVENT,
    SIDE_SHEET_CANCEL_EVENT,
    SIDE_SHEET_CLOSED_EVENT,
    SIDE_SHEET_CLOSING_EVENT,
    SIDE_SHEET_OPENED_EVENT,
    SIDE_SHEET_OPENING_EVENT,
    type ISideSheet,
    type ISideSheetActionEventDetail,
    type ISideSheetCancelEventDetail,
    type ISideSheetClosedEventDetail,
    type SideSheetCloseReason,
    type SideSheetEdge,
    type SideSheetVariant,
} from '../side-sheet.interface'

/**
 * Abstract base for `mdc-side-sheet`. Owns the lifecycle, focus traps,
 * and event dispatch. Subclasses define the public tag and the default
 * variant.
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/side-sheets/guidelines
 */
export abstract class BaseSideSheet extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements ISideSheet {

    public static override styles = [baseSideSheetStyles]

    @property({ type: String })
    public variant: SideSheetVariant = 'standard'

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    @property({ type: String, attribute: 'sheet-edge' })
    public sheetEdge: SideSheetEdge = 'end'

    @property({ type: Number, attribute: 'max-width' })
    public maxWidth: number = 0

    @property({ type: Boolean })
    public quick: boolean = false

    /**
     * Whether Esc and scrim taps dismiss the modal sheet. Custom string-aware
     * converter so `cancelable="false"` is honoured (Lit default treats any
     * present attribute as `true`).
     */
    @property({
        attribute: 'cancelable',
        converter: {
            fromAttribute: (value: string | null) =>
                value !== null && value !== 'false',
            toAttribute: (value: boolean) => (value ? '' : 'false'),
        },
    })
    public cancelable: boolean = true

    @property({ type: Boolean, attribute: 'no-focus-trap' })
    public noFocusTrap: boolean = false

    @property({ type: String, attribute: 'return-value' })
    public returnValue: string = ''

    @property({ type: Boolean, attribute: 'show-back-button' })
    public showBackButton: boolean = false

    @property({ type: Boolean })
    public override draggable: boolean = false

    @state()
    protected hasHeadline: boolean = false

    @state()
    protected hasContent: boolean = false

    @state()
    protected hasActions: boolean = false

    @state()
    protected hasCloseIcon: boolean = false

    @state()
    protected hasBackIcon: boolean = false

    private lastCloseReason: SideSheetCloseReason = 'programmatic'

    private previouslyFocused: Element | null = null

    /**
     * Cancels any in-flight WAAPI animations (scrim + container) when a fresh
     * `show()` or `hide()` interrupts them. Replaces the old CSS
     * `transitionend` + `pendingClose` design — the CSS version wedged the
     * sheet open when consumers toggled faster than the close animation
     * finished (the cancelled transition never fired `transitionend`, so
     * `pendingClose` stayed `true` forever). See `animateSideSheet`.
     */
    protected cancelAnimations?: AbortController

    @query('dialog')
    protected readonly dialogEl!: HTMLDialogElement | null

    @query('.container')
    protected readonly containerEl!: HTMLElement | null

    @query('.scrim')
    protected readonly scrimEl!: HTMLElement | null

    @query('.close-icon')
    protected readonly closeIconEl!: HTMLElement | null

    public declare ariaLabel: string | null

    protected getRenderClasses(): Record<string, boolean | string> {
        return {
            'standard'    : this.variant === 'standard',
            'modal'       : this.variant === 'modal',
            [`edge-${this.sheetEdge}`]: true,
            'has-headline': this.hasHeadline,
            'has-content' : this.hasContent,
            'has-actions' : this.hasActions,
            'has-close-icon': this.hasCloseIcon,
            'has-back-icon' : this.hasBackIcon,
            'no-focus-trap': this.noFocusTrap,
            'show-back-button': this.showBackButton,
            'quick'       : this.quick,
        }
    }

    protected override render(): TemplateResult {
        return html`
            <dialog
                class="host ${classMap(this.getRenderClasses())}"
                part="host"
                style=${styleMap(this.maxWidth > 0
                    ? { '--_container-max-width': `${this.maxWidth}px` }
                    : {})}
                .returnValue=${this.returnValue}
                aria-label=${this.ariaLabel || nothing}
                role="dialog"
                @cancel=${this.handleNativeCancel}
                @click=${this.handleHostClick}
                @keydown=${this.handleKeydown}
            >
                ${!this.noFocusTrap ? this.renderFocusTrap('first') : nothing}

                <span class="scrim" aria-hidden="true"></span>

                <div class="container"
                    part="container">
                    <header class="headline">
                        ${this.renderHeadlineBackIcon()}
                        <h2 class="headline-label">
                            <slot name="headline"
                                @slotchange=${this.handleHeadlineSlotChange}></slot>
                        </h2>
                        <button class="close-icon"
                            type="button"
                            aria-label="Close"
                            @click=${this.handleCloseIconClick}>
                            <slot name="close-icon"
                                @slotchange=${this.handleCloseIconSlotChange}>
                                <svg viewBox="0 0 24 24" width="24" height="24"
                                    fill="currentColor" aria-hidden="true">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41
                                        10.59 12 5 17.59 6.41 19 12 13.41 17.59 19
                                        19 17.59 13.41 12z"/>
                                </svg>
                            </slot>
                        </button>
                    </header>

                    <mdc-divider></mdc-divider>

                    <div class="content">
                        <slot @slotchange=${this.handleContentSlotChange}></slot>
                    </div>

                    <footer class="actions"
                        ?hidden=${!this.hasActions}>
                        <mdc-divider></mdc-divider>
                        <div class="actions-row">
                            <slot name="actions"
                                @slotchange=${this.handleActionsSlotChange}></slot>
                        </div>
                    </footer>
                </div>

                ${!this.noFocusTrap ? this.renderFocusTrap('last') : nothing}
            </dialog>
        `
    }

    protected renderHeadlineBackIcon(): TemplateResult | typeof nothing {
        if (this.variant !== 'modal' || !this.showBackButton) return nothing
        return html`
            <button class="headline-icon"
                type="button"
                aria-label="Back"
                @click=${this.handleBackIconClick}>
                <slot name="headline-icon"
                    @slotchange=${this.handleBackIconSlotChange}></slot>
            </button>
        `
    }

    protected renderFocusTrap(position: 'first' | 'last'): TemplateResult {
        return html`
            <div class="focus-trap focus-trap-${position}"
                tabindex="0"
                @focus=${position === 'first'
                    ? this.handleFirstFocusTrapFocus
                    : this.handleLastFocusTrapFocus}>
            </div>
        `
    }

    public async show(): Promise<void> {
        if (this.open) return
        // The state reset (lastCloseReason, previouslyFocused) happens in
        // willUpdate() so declaratively-opened sheets get the same fresh state.
        this.open = true
        await this.updateComplete
        const dialog = this.dialogEl
        if (!dialog) return
        // Re-opening while a prior close is still animating: dialog.showModal()
        // throws InvalidStateError on an already-open dialog, so guard with
        // `dialog.open`.
        if (!dialog.open) {
            if (this.variant === 'modal') {
                dialog.showModal()
            } else {
                dialog.show()
            }
        }
        // Promote to the top layer first so the scrim + container animate
        // against the live render tree (matches DialogAction.show ordering).
        await this.animateSideSheet(SideSheetDefaultOpenAnimation(this.sheetEdge))
        this.dispatchEvent(new Event(
            SIDE_SHEET_OPENED_EVENT,
            { bubbles: true, composed: true },
        ))
        // Focus the first focusable element after the entrance animation.
        requestAnimationFrame(() => {
            if (!this.noFocusTrap) this.focusFirstInside()
        })
    }

    public async hide(): Promise<void> {
        if (!this.open) return
        this.open = false
        await this.updateComplete
        // The close animation runs while the dialog stays in the top layer;
        // closeDialog() is called after it settles so the slide-out is visible.
        // animateSideSheet is reentrant-safe via AbortController — a fresh
        // show() mid-hide() will abort this animation cleanly.
        await this.animateSideSheet(SideSheetDefaultCloseAnimation(this.sheetEdge))
        this.closeDialog()
        this.dispatchEvent(new CustomEvent<ISideSheetClosedEventDetail>(
            SIDE_SHEET_CLOSED_EVENT,
            {
                bubbles: true,
                composed: true,
                detail: {
                    returnValue: this.returnValue,
                    reason: this.lastCloseReason,
                },
            },
        ))
        if (!this.noFocusTrap) this.restoreFocus()
    }

    public async close(returnValue?: string): Promise<void> {
        this.returnValue = returnValue ?? ''
        await this.hide()
    }

    /**
     * Close the native `<dialog>` element, removing it from the top layer.
     * Safe to call multiple times — no-ops if the dialog is already closed.
     */
    private closeDialog(): void {
        const dialog = this.dialogEl
        if (!dialog?.open) return
        dialog.close(this.returnValue)
    }

    protected override willUpdate(changed: PropertyValues<this>): void {
        if (changed.has('open')) {
            if (this.open) {
                // Reset here (not in show()) so declaratively-opened sheets
                // get the same fresh state. The close path leaves these
                // fields alone, preserving the "preserve caller-set
                // lastCloseReason" behaviour (commits 0a82180 / 6983438).
                this.lastCloseReason = 'programmatic'
                this.previouslyFocused = this.ownerDocument?.activeElement ?? null
                this.dispatchEvent(new Event(
                    SIDE_SHEET_OPENING_EVENT,
                    { bubbles: true, composed: true },
                ))
            } else {
                this.dispatchEvent(new Event(
                    SIDE_SHEET_CLOSING_EVENT,
                    { bubbles: true, composed: true },
                ))
            }
        }
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        // Cancel any in-flight animations; otherwise the WAAPI Animation
        // objects would keep ticking against a detached shadow tree.
        this.cancelAnimations?.abort()
    }

    private async animateSideSheet(animation: SideSheetAnimation): Promise<void> {
        // Abort any prior in-flight animations. Each prior Animation registered
        // an abort listener below that calls Animation.cancel(); its
        // `finished` Promise then rejects with AbortError, which the
        // `.catch(() => {})` below swallows. The fresh run then takes over.
        this.cancelAnimations?.abort()
        this.cancelAnimations = new AbortController()
        if (this.quick) return

        const sheetContainer = this.containerEl
        const scrim = this.scrimEl
        const isModal = this.variant === 'modal'
        // Standard variant has no scrim; the modal scrim must exist or we
        // bail rather than animating against a missing target.
        if (!sheetContainer || (isModal && !scrim)) return

        const { scrim: scrimArgs, container: containerArgs } = animation

        const targets: Array<[Element, SideSheetAnimationArgs[]]> = [
            [sheetContainer, containerArgs ?? []],
        ]
        if (isModal && scrim) targets.push([scrim, scrimArgs ?? []])

        const animations: Animation[] = []
        for (const [element, args] of targets) {
            for (const a of args) {
                const anim = element.animate(...a)
                this.cancelAnimations!.signal.addEventListener('abort', () => {
                    anim.cancel()
                })
                animations.push(anim)
            }
        }

        await Promise.all(
            animations.map((anim) =>
                anim.finished.catch(() => {
                    // Ignore intentional AbortErrors when calling anim.cancel().
                }),
            ),
        )
    }

    private focusFirstInside(): void {
        const focusable = this.getFocusableElements()
        const target = focusable[0] ?? this.closeIconEl
        target?.focus()
    }

    private restoreFocus(): void {
        const previous = this.previouslyFocused
        if (previous && 'focus' in previous && previous instanceof HTMLElement) {
            previous.focus()
        }
        this.previouslyFocused = null
    }

    private getFocusableElements(): HTMLElement[] {
        const container = this.containerEl
        if (!container) return []
        const candidates = container.querySelectorAll<HTMLElement>(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
        return Array.from(candidates).filter(
            (el) => !el.hasAttribute('disabled')
                && el.getAttribute('aria-hidden') !== 'true'
                && !el.classList.contains('focus-trap')
        )
    }

    private handleHeadlineSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasHeadline = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleContentSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasContent = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleActionsSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasActions = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleCloseIconSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasCloseIcon = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleBackIconSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasBackIcon = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleNativeCancel(event: Event): void {
        // Always prevent the browser's default close — we manage the dialog
        // lifecycle ourselves via show()/hide().
        event.preventDefault()
        if (this.variant !== 'modal' || !this.cancelable || !this.open) {
            return
        }
        this.lastCloseReason = 'escape'
        this.dispatchEvent(new CustomEvent<ISideSheetCancelEventDetail>(
            SIDE_SHEET_CANCEL_EVENT,
            { bubbles: true, composed: true, detail: { reason: 'escape' } },
        ))
        void this.hide()
    }

    private handleHostClick(event: MouseEvent): void {
        if (this.variant !== 'modal' || !this.cancelable || !this.open) return
        const path = event.composedPath()
        if (path.some((node) => (node as Element).classList?.contains?.('scrim'))) {
            this.lastCloseReason = 'scrim'
            this.dispatchEvent(new CustomEvent<ISideSheetCancelEventDetail>(
                SIDE_SHEET_CANCEL_EVENT,
                { bubbles: true, composed: true, detail: { reason: 'scrim' } },
            ))
            void this.hide()
        }
    }

    private handleKeydown(_event: KeyboardEvent): void {
        // The native `cancel` event on `<dialog>` already handles Esc.
        // This handler is reserved for future hotkeys (e.g., Ctrl+W) and is
        // intentionally a no-op in v1.
    }

    private handleCloseIconClick(_event: MouseEvent): void {
        this.dispatchEvent(new CustomEvent<ISideSheetActionEventDetail>(
            SIDE_SHEET_ACTION_EVENT,
            { bubbles: true, composed: true, detail: { source: 'close' } },
        ))
        this.lastCloseReason = 'close-button'
        void this.hide()
    }

    private handleBackIconClick(_event: MouseEvent): void {
        this.dispatchEvent(new CustomEvent<ISideSheetActionEventDetail>(
            SIDE_SHEET_ACTION_EVENT,
            { bubbles: true, composed: true, detail: { source: 'back' } },
        ))
        this.lastCloseReason = 'back-button'
        void this.hide()
    }

    private handleFirstFocusTrapFocus(): void {
        // Wrapped from start — jump focus to the last focusable element.
        const focusable = this.getFocusableElements()
        if (focusable.length > 0) {
            focusable[focusable.length - 1].focus()
        }
    }

    private handleLastFocusTrapFocus(): void {
        // Wrapped from end — jump focus to the first focusable element.
        const focusable = this.getFocusableElements()
        if (focusable.length > 0) {
            focusable[0].focus()
        }
    }
}
