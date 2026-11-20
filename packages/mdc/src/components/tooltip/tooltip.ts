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
import '../elevation/elevation'
import {
    TooltipHiddenEvent,
    TooltipHidingEvent,
    TooltipShownEvent,
    TooltipShowingEvent,
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
 * Supports plain and rich variants via slots, and an optional directional caret.
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
 * @cssproperty --mdc-tooltip-enabled-headline-color
 * @cssproperty --mdc-tooltip-enabled-action-label-color
 * @cssproperty --mdc-tooltip-caret-width
 * @cssproperty --mdc-tooltip-caret-height
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/tooltips/overview
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

    @property({ type: Boolean, reflect: true })
    public caret: boolean = false

    @state()
    public hasContent: boolean = false

    @state()
    public hasActions: boolean = false

    @state()
    private hasHeadlineContent: boolean = false

    @query('.container')
    protected readonly containerElement!: HTMLDivElement | null

    private openTimeoutId: ReturnType<typeof setTimeout> | null = null
    private closeTimeoutId: ReturnType<typeof setTimeout> | null = null

    public constructor() {
        super()
        if (isServer) {
            return
        }
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        this.detectRichMode()
    }

    protected override firstUpdated(): void {
        const defaultSlot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement | null
        if (defaultSlot) {
            this.hasContent = defaultSlot.assignedNodes({ flatten: true }).some(
                (node) => node.nodeType === Node.ELEMENT_NODE
                    || (node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim())),
            )
        } else {
            this.hasContent = Array.from(this.childNodes).some(
                (node) => (node.nodeType === Node.ELEMENT_NODE && !(node as Element).hasAttribute('slot'))
                    || (node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim())),
            )
        }
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.clearTransitionTimeouts()
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
            'has-headline': this.hasHeadlineContent,
        })
    }

    protected override render(): TemplateResult {
        return html`
            <div class="${classMap(this.getRenderClasses())}" role="tooltip">
                ${this.rich ? html`<mdc-elevation></mdc-elevation>` : nothing}
                ${this.renderHeadline()}
                ${this.renderContent()}
                ${this.renderActions()}
                ${this.renderCaret()}
            </div>
        `
    }

    protected renderHeadline(): TemplateResult | typeof nothing {
        if (!this.rich) {
            return nothing
        }
        return html`
            <div class="headline">
                <slot name="headline" @slotchange=${this.handleHeadlineSlotChange}></slot>
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

    protected renderActions(): TemplateResult | typeof nothing {
        if (!this.rich) {
            return nothing
        }
        return html`
            <div class="actions">
                <slot name="actions" @slotchange=${this.handleActionsSlotChange}></slot>
            </div>
        `
    }

    protected renderCaret(): TemplateResult | typeof nothing {
        if (!this.caret) {
            return nothing
        }
        return html`
            <svg class="caret" viewBox="0 0 16 8" aria-hidden="true">
                <path d="M 0,0 L 6.5858,6.5858 A 2,2 0 0 0 9.4142,6.5858 L 16,0 Z"></path>
            </svg>
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
        const hasHeadlineSlot = this.querySelector('[slot="headline"]') !== null
        const hasActionsSlot = this.querySelector('[slot="actions"]') !== null
        this.hasHeadlineContent = hasHeadlineSlot
        this.hasActions = hasActionsSlot

        if (hasHeadlineSlot || hasActionsSlot) {
            this.rich = true
            this.plain = false
        } else if (!this.hasAttribute('rich')) {
            this.rich = false
            this.plain = true
        } else {
            this.plain = !this.rich
        }
    }

    private clearTransitionTimeouts(): void {
        if (this.openTimeoutId !== null) {
            clearTimeout(this.openTimeoutId)
            this.openTimeoutId = null
        }
        if (this.closeTimeoutId !== null) {
            clearTimeout(this.closeTimeoutId)
            this.closeTimeoutId = null
        }
    }

    private handleOpen(): void {
        if (this.hasAttribute('managed')) return
        this.clearTransitionTimeouts()
        this.classList.remove('hiding')
        this.dispatchEvent(new Event(TooltipShowingEvent, { bubbles: true, composed: true }))
        this.openTimeoutId = setTimeout(() => {
            this.openTimeoutId = null
            this.dispatchEvent(new Event(TooltipShownEvent, { bubbles: true, composed: true }))
        }, 150)
    }

    private handleClose(): void {
        if (this.hasAttribute('managed')) return
        this.clearTransitionTimeouts()
        this.classList.add('hiding')
        this.dispatchEvent(new Event(TooltipHidingEvent, { bubbles: true, composed: true }))
        this.closeTimeoutId = setTimeout(() => {
            this.closeTimeoutId = null
            this.classList.remove('hiding')
            this.dispatchEvent(new Event(TooltipHiddenEvent, { bubbles: true, composed: true }))
        }, 75)
    }

    private handleContentSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasContent = slot.assignedNodes({ flatten: true }).some(
            (node) => node.nodeType === Node.ELEMENT_NODE
                || (node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim())),
        )
    }

    private handleHeadlineSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasHeadlineContent = slot.assignedElements({ flatten: true }).length > 0
        if (this.hasHeadlineContent) {
            this.rich = true
            this.plain = false
        }
    }

    private handleActionsSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasActions = slot.assignedElements({ flatten: true }).length > 0
        if (this.hasActions) {
            this.rich = true
            this.plain = false
        }
    }
}
