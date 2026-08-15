/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import {
    SNACKBAR_ACTION_EVENT,
    SNACKBAR_CLOSED_EVENT,
    SNACKBAR_CLOSING_EVENT,
    SNACKBAR_OPENED_EVENT,
    SNACKBAR_OPENING_EVENT,
    type ISnackbar,
    type ISnackbarActionEventDetail,
    type SnackbarAnimationMode,
    type SnackbarDuration,
    type SnackbarVariant,
} from './snackbar.interface'
import { SnackbarStyles } from './snackbar.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-snackbar': MDCSnackbar
    }
}

/**
 * @element mdc-snackbar
 *
 * A brief message displayed at the bottom of the screen.
 * Can include an optional action button and close icon.
 *
 * @slot - The snackbar message text.
 * @slot icon - Optional leading icon.
 * @slot action - Optional action button.
 * @slot close-icon - Optional close icon button.
 *
 * @fires snackbar-opening - Dispatched when the snackbar starts opening.
 * @fires snackbar-opened - Dispatched when the snackbar is fully open.
 * @fires snackbar-closing - Dispatched when the snackbar starts closing.
 * @fires snackbar-closed - Dispatched when the snackbar is fully closed.
 * @fires snackbar-action - Dispatched when the action button is clicked.
 *
 * @cssproperty --mdc-snackbar-enabled-container-color
 * @cssproperty --mdc-snackbar-container-shape-start-start
 * @cssproperty --mdc-snackbar-container-shape-start-end
 * @cssproperty --mdc-snackbar-container-shape-end-start
 * @cssproperty --mdc-snackbar-container-shape-end-end
 * @cssproperty --mdc-snackbar-enabled-label-color
 * @cssproperty --mdc-snackbar-enabled-action-text-color
 * @cssproperty --mdc-snackbar-enabled-close-icon-color
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/snackbar/overview
 */
@customElement('mdc-snackbar')
export class MDCSnackbar extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements ISnackbar {

    static override styles = SnackbarStyles

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    @property({ type: String, attribute: 'duration', reflect: true })
    public duration: SnackbarDuration = 'short'

    @property({ type: String, attribute: 'animation-mode', reflect: true })
    public animationMode: SnackbarAnimationMode = 'slide'

    @property({ type: Boolean, reflect: true })
    public multiline: boolean = false

    @property({ type: String, reflect: true })
    public variant: SnackbarVariant = 'inverse-surface'

    @state()
    public hasAction: boolean = false

    @state()
    public hasCloseIcon: boolean = false

    @state()
    public hasIcon: boolean = false

    @query('.container')
    protected readonly containerElement!: HTMLDivElement | null

    @query('.action')
    protected readonly actionButton!: HTMLButtonElement | null

    @query('.close-icon')
    protected readonly closeButton!: HTMLButtonElement | null

    private autoHideTimer: ReturnType<typeof setTimeout> | null = null
    private animationAbortController: AbortController | null = null

    public constructor() {
        super()
        if (isServer) {
            return
        }
        this.addEventListener('click', this.handleClick)
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (this.hasAttribute('open')) {
            this.open = true
        }
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.clearAutoHideTimer()
        this.animationAbortController?.abort()
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        if (changedProperties.has('open')) {
            if (this.open) {
                this.handleOpen()
            } else if (changedProperties.get('open') === true) {
                this.handleClose()
            }
        }
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            [`variant-${this.variant}`]: true,
            'multiline': this.multiline,
            'has-action': this.hasAction,
            'has-close-icon': this.hasCloseIcon,
            'has-icon': this.hasIcon,
            'closing': false,
        })
    }

    protected override render(): TemplateResult {
        return html`
            <div class="${classMap(this.getRenderClasses())}">
                <span class="background"></span>
                ${this.renderIcon()}
                ${this.renderLabel()}
                ${this.renderAction()}
                ${this.renderCloseIcon()}
            </div>
        `
    }

    protected renderIcon(): TemplateResult {
        return html`
            <span class="icon" aria-hidden="true">
                <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
            </span>
        `
    }

    protected renderLabel(): TemplateResult {
        return html`
            <span class="label">
                <slot></slot>
            </span>
        `
    }

    protected renderAction(): TemplateResult {
        return html`
            <button
                class="action"
                @click=${this.handleActionClick}
            >
                <slot name="action" @slotchange=${this.handleActionSlotChange}></slot>
            </button>
        `
    }

    protected renderCloseIcon(): TemplateResult {
        return html`
            <button
                class="close-icon"
                aria-label="Close"
                @click=${this.handleCloseIconClick}
            >
                <slot name="close-icon" @slotchange=${this.handleCloseIconSlotChange}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </slot>
            </button>
        `
    }

    /**
     * Shows the snackbar.
     */
    public async show(): Promise<void> {
        if (this.open) return
        this.open = true
    }

    /**
     * Hides the snackbar.
     */
    public async hide(): Promise<void> {
        if (!this.open) return
        this.open = false
    }

    private handleOpen(): void {
        this.dispatchEvent(new Event(SNACKBAR_OPENING_EVENT, { bubbles: true, composed: true }))
        this.startAutoHideTimer()
        // Emit opened event after animation
        setTimeout(() => {
            this.dispatchEvent(new Event(SNACKBAR_OPENED_EVENT, { bubbles: true, composed: true }))
        }, 300)
    }

    private handleClose(): void {
        this.clearAutoHideTimer()
        this.containerElement?.classList.add('closing')
        this.dispatchEvent(new Event(SNACKBAR_CLOSING_EVENT, { bubbles: true, composed: true }))
        // Emit closed event after animation
        setTimeout(() => {
            this.containerElement?.classList.remove('closing')
            this.dispatchEvent(new Event(SNACKBAR_CLOSED_EVENT, { bubbles: true, composed: true }))
        }, 300)
    }

    private startAutoHideTimer(): void {
        this.clearAutoHideTimer()
        if (this.duration === 'indefinite') return

        const duration = this.duration === 'short' ? 4000 : 10000
        this.autoHideTimer = setTimeout(() => {
            this.open = false
        }, duration)
    }

    private clearAutoHideTimer(): void {
        if (this.autoHideTimer !== null) {
            clearTimeout(this.autoHideTimer)
            this.autoHideTimer = null
        }
    }

    private handleClick(event: MouseEvent): void {
        // Reset auto-hide timer on interaction
        if (this.open && this.duration !== 'indefinite') {
            this.startAutoHideTimer()
        }
    }

    private handleActionClick(event: MouseEvent): void {
        const actionText = this.actionButton?.textContent?.trim() ?? ''
        this.dispatchEvent(new CustomEvent<ISnackbarActionEventDetail>(
            SNACKBAR_ACTION_EVENT,
            {
                detail: { action: actionText },
                bubbles: true,
                composed: true,
            }
        ))
    }

    private handleCloseIconClick(event: MouseEvent): void {
        this.open = false
    }

    private handleActionSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasAction = slot.assignedElements().length > 0
    }

    private handleCloseIconSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasCloseIcon = slot.assignedElements().length > 0
    }

    private handleIconSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasIcon = slot.assignedElements().length > 0
    }
}
