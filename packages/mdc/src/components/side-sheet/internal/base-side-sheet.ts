/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { baseSideSheetStyles } from './base-side-sheet.style'
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
    public maxWidth: number = 400

    @property({ type: Boolean })
    public quick: boolean = false

    @property({ type: Boolean })
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

    @query('.container')
    protected readonly containerEl!: HTMLElement | null

    @query('.close-icon')
    protected readonly closeIconEl!: HTMLElement | null

    public declare ariaLabel: string | null

    protected getRenderClasses(): Record<string, boolean | string> {
        return {
            'standard'    : this.variant === 'standard',
            'modal'       : this.variant === 'modal',
            [`edge-${this.sheetEdge}`]: true,
            'open'        : this.open,
            'closing'     : false,
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
                ?open=${this.open}
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
                    part="container"
                    @transitionend=${this.handleContainerTransitionEnd}>
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
        this.lastCloseReason = 'programmatic'   // ← ADDED: reset stale reason
        this.open = true
        if (this.quick) await this.resolveQuick('open')
    }

    public async hide(): Promise<void> {
        if (!this.open) return
        this.open = false
        if (this.quick) await this.resolveQuick('close')
    }

    public async close(returnValue?: string): Promise<void> {
        this.returnValue = returnValue ?? ''
        await this.hide()
    }

    protected override willUpdate(changed: PropertyValues<this>): void {
        if (changed.has('open')) {
            if (this.open) {
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

    private handleContainerTransitionEnd(event: TransitionEvent): void {
        if (event.propertyName !== 'transform') return
        if (this.open) {
            this.dispatchEvent(new Event(
                SIDE_SHEET_OPENED_EVENT,
                { bubbles: true, composed: true },
            ))
            // Focus the first focusable element after the entrance transition.
            requestAnimationFrame(() => {
                if (!this.noFocusTrap) this.focusFirstInside()
            })
        } else {
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
            // Restore focus to the previously-focused element.
            if (!this.noFocusTrap) this.restoreFocus()
        }
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

    private async resolveQuick(which: 'open' | 'close'): Promise<void> {
        // Wait one frame so the attribute is committed, then dispatch the
        // matching 'after' event.
        await new Promise(requestAnimationFrame)
        if (which === 'open') {
            this.dispatchEvent(new Event(
                SIDE_SHEET_OPENED_EVENT,
                { bubbles: true, composed: true },
            ))
            if (!this.noFocusTrap) this.focusFirstInside()
        } else {
            this.dispatchEvent(new CustomEvent<ISideSheetClosedEventDetail>(
                SIDE_SHEET_CLOSED_EVENT,
                {
                    bubbles: true,
                    composed: true,
                    detail: { returnValue: this.returnValue, reason: this.lastCloseReason },
                },
            ))
            if (!this.noFocusTrap) this.restoreFocus()
        }
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
        if (this.variant !== 'modal' || !this.cancelable) {
            // Standard variant, or modal-but-not-cancelable: prevent the
            // browser's default close. We don't want any close without an
            // explicit user gesture.
            event.preventDefault()
            return
        }
        event.preventDefault()
        this.lastCloseReason = 'escape'
        this.dispatchEvent(new CustomEvent<ISideSheetCancelEventDetail>(
            SIDE_SHEET_CANCEL_EVENT,
            { bubbles: true, composed: true, detail: { reason: 'escape' } },
        ))
        void this.hide()
    }

    private handleHostClick(event: MouseEvent): void {
        if (this.variant !== 'modal' || !this.cancelable) return
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
