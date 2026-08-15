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
    TOOLTIP_HIDDEN_EVENT,
    TOOLTIP_HIDING_EVENT,
    TOOLTIP_SHOWN_EVENT,
    TOOLTIP_SHOWING_EVENT,
    type ITooltip,
    type TooltipPosition,
} from './tooltip.interface'
import { TooltipStyles } from './tooltip.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-tooltip': MDCTooltip
    }
}

/**
 * @element mdc-tooltip
 *
 * A tooltip adds context to a button or other UI element.
 * Supports plain and rich variants via slots.
 *
 * Plain tooltip: Describes elements or actions (default).
 * Rich tooltip: Provides more detail with optional title and actions.
 *
 * @slot - Tooltip content text.
 * @slot headline - Rich tooltip title (auto-detects rich mode).
 * @slot actions - Rich tooltip action buttons (auto-detects rich mode).
 *
 * @fires tooltip-showing - Dispatched when the tooltip starts showing.
 * @fires tooltip-shown - Dispatched when the tooltip is fully visible.
 * @fires tooltip-hiding - Dispatched when the tooltip starts hiding.
 * @fires tooltip-hidden - Dispatched when the tooltip is fully hidden.
 *
 * @cssproperty --mdc-tooltip-enabled-container-color
 * @cssproperty --mdc-tooltip-container-shape-start-start
 * @cssproperty --mdc-tooltip-container-shape-start-end
 * @cssproperty --mdc-tooltip-container-shape-end-start
 * @cssproperty --mdc-tooltip-container-shape-end-end
 * @cssproperty --mdc-tooltip-enabled-label-color
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/tooltip/overview
 */
@customElement('mdc-tooltip')
export class MDCTooltip extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements ITooltip {

    static override styles = TooltipStyles

    @property({ type: String, reflect: true })
    public position: TooltipPosition = 'top'

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    @property({ type: Boolean, reflect: true })
    public rich: boolean = false

    @property({ type: Boolean, reflect: true })
    public plain: boolean = false

    @state()
    public hasContent: boolean = false

    @state()
    public hasActions: boolean = false

    @query('.container')
    protected readonly containerElement!: HTMLDivElement | null

    public constructor() {
        super()
        if (isServer) {
            return
        }
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        // Auto-detect rich mode from slots
        this.detectRichMode()
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
            'has-content': this.hasContent,
            'has-actions': this.hasActions,
            'has-headline': this.hasHeadline(),
        })
    }

    protected override render(): TemplateResult {
        return html`
            <div class="${classMap(this.getRenderClasses())}" role="tooltip">
                ${this.renderHeadline()}
                ${this.renderContent()}
                ${this.renderActions()}
            </div>
        `
    }

    protected renderHeadline(): TemplateResult {
        if (!this.rich) {
            return html``
        }
        return html`
            <div class="headline">
                <slot name="headline"></slot>
            </div>
        `
    }

    protected renderContent(): TemplateResult {
        return html`
            <div class="content">
                <slot @slotchange=${this.handleContentSlotChange}></slot>
            </div>
        `
    }

    protected renderActions(): TemplateResult {
        if (!this.rich) {
            return html``
        }
        return html`
            <div class="actions">
                <slot name="actions" @slotchange=${this.handleActionsSlotChange}></slot>
            </div>
        `
    }

    /**
     * Shows the tooltip.
     */
    public async show(): Promise<void> {
        if (this.open) return
        this.open = true
    }

    /**
     * Hides the tooltip.
     */
    public async hide(): Promise<void> {
        if (!this.open) return
        this.open = false
    }

    private detectRichMode(): void {
        // Auto-detect rich mode based on slot content
        const headlineSlot = this.querySelector('[slot="headline"]')
        const actionsSlot = this.querySelector('[slot="actions"]')
        if (headlineSlot || actionsSlot) {
            this.rich = true
            this.plain = false
        } else {
            this.rich = false
            this.plain = true
        }
    }

    private hasHeadline(): boolean {
        const headlineSlot = this.querySelector('[slot="headline"]')
        return headlineSlot !== null
    }

    private handleOpen(): void {
        this.dispatchEvent(new Event(TOOLTIP_SHOWING_EVENT, { bubbles: true, composed: true }))
        // Emit shown event after animation
        setTimeout(() => {
            this.dispatchEvent(new Event(TOOLTIP_SHOWN_EVENT, { bubbles: true, composed: true }))
        }, 200)
    }

    private handleClose(): void {
        this.containerElement?.classList.add('hiding')
        this.dispatchEvent(new Event(TOOLTIP_HIDING_EVENT, { bubbles: true, composed: true }))
        // Emit hidden event after animation
        setTimeout(() => {
            this.containerElement?.classList.remove('hiding')
            this.dispatchEvent(new Event(TOOLTIP_HIDDEN_EVENT, { bubbles: true, composed: true }))
        }, 200)
    }

    private handleContentSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasContent = slot.assignedElements().length > 0
    }

    private handleActionsSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasActions = slot.assignedElements().length > 0
    }
}
