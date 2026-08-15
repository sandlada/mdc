/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import { html, isServer, LitElement, type TemplateResult } from 'lit'
import { customElement, property, queryAssignedElements, state } from 'lit/decorators.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import {
    TOOLTIP_BOX_HIDDEN_EVENT,
    TOOLTIP_BOX_HIDING_EVENT,
    TOOLTIP_BOX_SHOWN_EVENT,
    TOOLTIP_BOX_SHOWING_EVENT,
    type ITooltipBox,
    type ITooltipBoxEventDetail,
    type TooltipBoxPlacement,
    type TooltipBoxTriggerMode,
} from './tooltip-box.interface'
import { TooltipBoxStyles } from './tooltip-box.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-tooltip-box': MDCTooltipBox
    }
}

/**
 * @element mdc-tooltip-box
 *
 * A controller that manages the display, positioning, and lifecycle
 * of a tooltip relative to its anchor content. Modeled after
 * Jetpack Compose's TooltipBox.
 *
 * @slot - The anchor content (e.g., a button or icon-button).
 * @slot tooltip - The mdc-tooltip element to display.
 *
 * @fires tooltip-box-showing - Dispatched when the tooltip starts showing.
 * @fires tooltip-box-shown - Dispatched when the tooltip is fully visible.
 * @fires tooltip-box-hiding - Dispatched when the tooltip starts hiding.
 * @fires tooltip-box-hidden - Dispatched when the tooltip is fully hidden.
 *
 * @csspart anchor - The wrapper around the anchor content.
 *
 * @version
 * Material Design 3
 */
@customElement('mdc-tooltip-box')
export class MDCTooltipBox extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements ITooltipBox {

    static override styles = TooltipBoxStyles

    @property({ type: String, reflect: true })
    public placement: TooltipBoxPlacement = 'bottom'

    @property({ type: Number })
    public offset: number = 8

    @property({ type: Number, attribute: 'show-delay' })
    public showDelay: number = 400

    @property({ type: Number, attribute: 'hide-delay' })
    public hideDelay: number = 0

    @property({ type: String, reflect: true })
    public trigger: TooltipBoxTriggerMode = 'hover'

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    @property({ type: Boolean, reflect: true, attribute: 'disable-flip' })
    public disableFlip: boolean = false

    @property({ type: Boolean, reflect: true })
    public quick: boolean = false

    @state()
    private hasSlottedTooltip: boolean = false

    @queryAssignedElements({ slot: 'tooltip', flatten: true })
    private readonly tooltipSlotElements!: Array<HTMLElement>

    @queryAssignedElements({ flatten: true })
    private readonly anchorSlotElements!: Array<HTMLElement>

    private get tooltipElement(): HTMLElement | undefined {
        return this.tooltipSlotElements[0]
    }

    private get anchorElement(): HTMLElement | undefined {
        return this.anchorSlotElements[0]
    }

    private showTimeoutId: ReturnType<typeof setTimeout> | null = null
    private hideTimeoutId: ReturnType<typeof setTimeout> | null = null
    private cleanupAutoUpdate: (() => void) | null = null
    private generation: number = 0

    public constructor() {
        super()
        if (isServer) {
            return
        }
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        this.addEventListener('pointerenter', this.handlePointerEnter)
        this.addEventListener('pointerleave', this.handlePointerLeave)
        this.addEventListener('focusin', this.handleFocusIn)
        this.addEventListener('focusout', this.handleFocusOut)
        document.addEventListener('keydown', this.handleKeyDown)
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.clearShowTimeout()
        this.clearHideTimeout()
        this.stopPositionTracking()
        this.removeEventListener('pointerenter', this.handlePointerEnter)
        this.removeEventListener('pointerleave', this.handlePointerLeave)
        this.removeEventListener('focusin', this.handleFocusIn)
        this.removeEventListener('focusout', this.handleFocusOut)
        document.removeEventListener('keydown', this.handleKeyDown)
    }

    protected override render(): TemplateResult {
        return html`
            <div part="anchor" class="anchor">
                <slot></slot>
            </div>
            <slot
                name="tooltip"
                @slotchange=${this.handleTooltipSlotChange}
            ></slot>
        `
    }

    // ─── Public API ───────────────────────────────────────────

    /**
     * Programmatically show the tooltip.
     */
    public async show(): Promise<void> {
        if (this.open) return

        const gen = ++this.generation

        const showingEvent = new CustomEvent<ITooltipBoxEventDetail>(
            TOOLTIP_BOX_SHOWING_EVENT,
            {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: { tooltipBox: this },
            },
        )
        this.dispatchEvent(showingEvent)
        if (showingEvent.defaultPrevented) {
            this.generation--
            return
        }

        this.open = true

        const tooltip = this.tooltipElement
        if (!tooltip) return

        // Sync open state to the slotted tooltip
        tooltip.setAttribute('open', '')

        // Position and track
        this.startPositionTracking()

        // Animate in
        if (!this.quick) {
            await this.animateTooltip('open', gen)
        }

        if (gen !== this.generation) return

        this.dispatchEvent(new CustomEvent<ITooltipBoxEventDetail>(
            TOOLTIP_BOX_SHOWN_EVENT,
            {
                bubbles: true,
                composed: true,
                detail: { tooltipBox: this },
            },
        ))
    }

    /**
     * Programmatically hide the tooltip.
     */
    public async hide(): Promise<void> {
        if (!this.open) return

        const gen = ++this.generation

        const hidingEvent = new CustomEvent<ITooltipBoxEventDetail>(
            TOOLTIP_BOX_HIDING_EVENT,
            {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: { tooltipBox: this },
            },
        )
        this.dispatchEvent(hidingEvent)
        if (hidingEvent.defaultPrevented) {
            this.generation--
            return
        }

        // Animate out
        if (!this.quick) {
            await this.animateTooltip('close', gen)
        }

        if (gen !== this.generation) return

        this.open = false

        const tooltip = this.tooltipElement
        if (tooltip) {
            tooltip.removeAttribute('open')
        }

        this.stopPositionTracking()

        this.dispatchEvent(new CustomEvent<ITooltipBoxEventDetail>(
            TOOLTIP_BOX_HIDDEN_EVENT,
            {
                bubbles: true,
                composed: true,
                detail: { tooltipBox: this },
            },
        ))
    }

    // ─── Slot Handling ────────────────────────────────────────

    private handleTooltipSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedTooltip = slot.assignedElements().length > 0
    }

    // ─── Trigger Handlers ─────────────────────────────────────

    private readonly handlePointerEnter = (): void => {
        if (this.trigger !== 'hover') return
        this.scheduleShow()
    }

    private readonly handlePointerLeave = (): void => {
        if (this.trigger !== 'hover') return
        this.scheduleHide()
    }

    private readonly handleFocusIn = (): void => {
        if (this.trigger !== 'focus') return
        this.scheduleShow()
    }

    private readonly handleFocusOut = (): void => {
        if (this.trigger !== 'focus') return
        this.scheduleHide()
    }

    private readonly handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape' && this.open) {
            this.hide()
        }
    }

    // ─── Delay Management ─────────────────────────────────────

    private scheduleShow(): void {
        this.clearHideTimeout()
        if (this.open) return
        this.showTimeoutId = setTimeout(() => {
            this.showTimeoutId = null
            this.show()
        }, this.showDelay)
    }

    private scheduleHide(): void {
        this.clearShowTimeout()
        if (!this.open) return
        this.hideTimeoutId = setTimeout(() => {
            this.hideTimeoutId = null
            this.hide()
        }, this.hideDelay)
    }

    private clearShowTimeout(): void {
        if (this.showTimeoutId !== null) {
            clearTimeout(this.showTimeoutId)
            this.showTimeoutId = null
        }
    }

    private clearHideTimeout(): void {
        if (this.hideTimeoutId !== null) {
            clearTimeout(this.hideTimeoutId)
            this.hideTimeoutId = null
        }
    }

    // ─── Positioning (floating-ui) ────────────────────────────

    private startPositionTracking(): void {
        this.stopPositionTracking()

        const anchor = this.anchorElement
        const tooltip = this.tooltipElement
        if (!anchor || !tooltip) return

        /*
         * Neutralize mdc-tooltip's built-in CSS positioning.
         * ::slotted styles cannot override the element's own :host styles
         * (the element's stylesheet wins by shadow DOM specificity rules),
         * so we must apply overrides via JS setProperty('…', …, 'important').
         */
        const s = tooltip.style
        s.setProperty('position', 'fixed', 'important')
        s.setProperty('left', '0', 'important')
        s.setProperty('top', '0', 'important')
        s.setProperty('right', 'auto', 'important')
        s.setProperty('bottom', 'auto', 'important')
        s.setProperty('transform', 'none', 'important')
        s.setProperty('margin', '0', 'important')

        this.cleanupAutoUpdate = autoUpdate(anchor, tooltip, () => {
            this.updatePosition()
        })
    }

    private stopPositionTracking(): void {
        this.cleanupAutoUpdate?.()
        this.cleanupAutoUpdate = null

        // Clean up inline positioning styles
        const tooltip = this.tooltipElement
        if (tooltip) {
            const s = tooltip.style
            s.removeProperty('position')
            s.removeProperty('left')
            s.removeProperty('top')
            s.removeProperty('right')
            s.removeProperty('bottom')
            s.removeProperty('transform')
            s.removeProperty('margin')
        }
    }

    private async updatePosition(): Promise<void> {
        const anchor = this.anchorElement
        const tooltip = this.tooltipElement
        if (!anchor || !tooltip) return

        const middleware = [
            offset(this.offset),
            ...(!this.disableFlip ? [flip()] : []),
            shift({ padding: 8 }),
        ]

        const { x, y } = await computePosition(anchor, tooltip, {
            placement: this.placement,
            middleware,
        })

        tooltip.style.setProperty('left', `${x}px`, 'important')
        tooltip.style.setProperty('top', `${y}px`, 'important')
    }

    // ─── Animation ────────────────────────────────────────────

    private async animateTooltip(mode: 'open' | 'close', gen: number): Promise<void> {
        const tooltip = this.tooltipElement
        if (!tooltip) return

        const direction = this.placement.split('-')[0] as string
        let transform: string
        switch (direction) {
            case 'top':
                transform = 'translateY(10px)'
                break
            case 'bottom':
                transform = 'translateY(-10px)'
                break
            case 'left':
                transform = 'translateX(10px)'
                break
            case 'right':
                transform = 'translateX(-10px)'
                break
            default:
                transform = 'translateY(-10px)'
        }

        const keyframes = mode === 'open' ? [
            { opacity: 0, transform },
            { opacity: 1, transform: 'none' },
        ] : [
            { opacity: 1, transform: 'none' },
            { opacity: 0, transform },
        ]

        const animation = tooltip.animate(keyframes, {
            duration: 150,
            easing: 'ease-out',
            fill: 'forwards',
        })

        try {
            await animation.finished
        } catch (_) {
            // Animation was cancelled (e.g., by a newer show/hide call)
        } finally {
            animation.commitStyles()
            animation.cancel()
        }
    }
}
