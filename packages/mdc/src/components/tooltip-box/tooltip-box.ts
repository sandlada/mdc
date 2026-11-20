/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import { Easing } from '@sandlada/mdk'
import { html, isServer, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, queryAssignedElements, state } from 'lit/decorators.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import {
    TooltipBoxHiddenEvent,
    TooltipBoxHidingEvent,
    TooltipBoxShownEvent,
    TooltipBoxShowingEvent,
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
 * Global mutator tracking the currently active tooltip box so at most
 * one tooltip is open at a time (mirrors Compose GlobalMutatorMutex).
 */
let ActiveTooltipBox: MDCTooltipBox | null = null

let TooltipIdCounter = 0

const LongPressDelayMs = 500

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
    public trigger: TooltipBoxTriggerMode = 'auto'

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    @property({ type: Boolean, reflect: true })
    public persistent: boolean = false

    @property({ type: Boolean, reflect: true })
    public caret: boolean = false

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
    private longPressTimeoutId: ReturnType<typeof setTimeout> | null = null
    private cleanupAutoUpdate: (() => void) | null = null
    private activeAnimation: Animation | null = null
    private resolvedPlacement: TooltipBoxPlacement = 'bottom'
    private generation: number = 0
    private generatedTooltipId: string | null = null

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
        this.addEventListener('pointerdown', this.handlePointerDown)
        this.addEventListener('pointerup', this.handlePointerUpOrCancel)
        this.addEventListener('pointercancel', this.handlePointerUpOrCancel)
        this.addEventListener('focusin', this.handleFocusIn)
        this.addEventListener('focusout', this.handleFocusOut)
        this.addEventListener('click', this.handleClick)
        document.addEventListener('keydown', this.handleKeyDown)
        document.addEventListener('pointerdown', this.handleDocumentPointerDown)
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.clearShowTimeout()
        this.clearHideTimeout()
        this.clearLongPressTimeout()
        this.activeAnimation?.cancel()
        this.activeAnimation = null
        this.stopPositionTracking()
        if (ActiveTooltipBox === this) {
            ActiveTooltipBox = null
        }
        this.removeEventListener('pointerenter', this.handlePointerEnter)
        this.removeEventListener('pointerleave', this.handlePointerLeave)
        this.removeEventListener('pointerdown', this.handlePointerDown)
        this.removeEventListener('pointerup', this.handlePointerUpOrCancel)
        this.removeEventListener('pointercancel', this.handlePointerUpOrCancel)
        this.removeEventListener('focusin', this.handleFocusIn)
        this.removeEventListener('focusout', this.handleFocusOut)
        this.removeEventListener('click', this.handleClick)
        document.removeEventListener('keydown', this.handleKeyDown)
        document.removeEventListener('pointerdown', this.handleDocumentPointerDown)
    }

    protected override firstUpdated(): void {
        this.syncTooltipCaret()
        this.syncAriaDescribedBy()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        if (changedProperties.has('caret')) {
            this.syncTooltipCaret()
        }
        if (changedProperties.has('placement') || changedProperties.has('offset') || changedProperties.has('disableFlip')) {
            if (this.open) {
                this.updatePosition()
            }
        }
    }

    protected override render(): TemplateResult {
        return html`
            <div part="anchor" class="anchor">
                <slot @slotchange=${this.handleAnchorSlotChange}></slot>
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

        this.clearShowTimeout()
        this.clearHideTimeout()

        const gen = ++this.generation

        const showingEvent = new CustomEvent<ITooltipBoxEventDetail>(
            TooltipBoxShowingEvent,
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

        if (ActiveTooltipBox && ActiveTooltipBox !== this) {
            void ActiveTooltipBox.hide()
        }
        ActiveTooltipBox = this

        this.open = true

        const tooltip = this.tooltipElement
        if (!tooltip) return

        this.syncTooltipCaret()
        tooltip.setAttribute('managed', '')
        tooltip.style.removeProperty('visibility')
        tooltip.setAttribute('open', '')

        this.startPositionTracking()
        await this.updatePosition()

        if (gen !== this.generation) return

        if (!this.shouldSkipAnimation()) {
            await this.animateTooltip('open', gen)
        }

        if (gen !== this.generation) return

        this.dispatchEvent(new CustomEvent<ITooltipBoxEventDetail>(
            TooltipBoxShownEvent,
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

        this.clearShowTimeout()
        this.clearHideTimeout()

        const gen = ++this.generation

        const hidingEvent = new CustomEvent<ITooltipBoxEventDetail>(
            TooltipBoxHidingEvent,
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

        if (!this.shouldSkipAnimation()) {
            await this.animateTooltip('close', gen)
        }

        if (gen !== this.generation) return

        this.open = false
        if (ActiveTooltipBox === this) {
            ActiveTooltipBox = null
        }

        const tooltip = this.tooltipElement
        if (tooltip) {
            tooltip.style.setProperty('visibility', 'hidden')
            tooltip.removeAttribute('open')
        }

        this.stopPositionTracking()

        this.dispatchEvent(new CustomEvent<ITooltipBoxEventDetail>(
            TooltipBoxHiddenEvent,
            {
                bubbles: true,
                composed: true,
                detail: { tooltipBox: this },
            },
        ))
    }

    // ─── Slot & ARIA Handling ─────────────────────────────────

    private handleAnchorSlotChange(): void {
        this.syncAriaDescribedBy()
    }

    private handleTooltipSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedTooltip = slot.assignedElements().length > 0
        this.syncTooltipCaret()
        this.syncAriaDescribedBy()
    }

    private syncTooltipCaret(): void {
        const tooltip = this.tooltipElement
        if (!tooltip) return
        tooltip.setAttribute('managed', '')
        if (this.caret) {
            tooltip.setAttribute('caret', '')
        } else {
            tooltip.removeAttribute('caret')
        }
    }

    private syncAriaDescribedBy(): void {
        const anchor = this.anchorElement
        const tooltip = this.tooltipElement
        if (!anchor || !tooltip) return

        if (!tooltip.id) {
            this.generatedTooltipId = `mdc-tooltip-${++TooltipIdCounter}`
            tooltip.id = this.generatedTooltipId
        }
        const existing = anchor.getAttribute('aria-describedby')
        if (!existing) {
            anchor.setAttribute('aria-describedby', tooltip.id)
        } else if (!existing.split(/\s+/).includes(tooltip.id)) {
            anchor.setAttribute('aria-describedby', `${existing} ${tooltip.id}`)
        }
    }

    private isRichInteractiveTooltip(): boolean {
        const tooltip = this.tooltipElement
        if (!tooltip) return false
        return tooltip.hasAttribute('rich') || tooltip.querySelector('[slot="actions"]') !== null
    }

    // ─── Trigger Handlers ─────────────────────────────────────

    private readonly handlePointerEnter = (): void => {
        if (this.trigger !== 'auto' && this.trigger !== 'hover') return
        this.clearHideTimeout()
        this.scheduleShow()
    }

    private readonly handlePointerLeave = (): void => {
        if (this.trigger !== 'auto' && this.trigger !== 'hover') return
        if (this.persistent) return
        this.scheduleHide()
    }

    private readonly handlePointerDown = (event: PointerEvent): void => {
        if (this.trigger !== 'auto') return
        if (event.pointerType === 'touch') {
            this.clearLongPressTimeout()
            this.longPressTimeoutId = setTimeout(() => {
                this.longPressTimeoutId = null
                void this.show()
            }, LongPressDelayMs)
        }
    }

    private readonly handlePointerUpOrCancel = (): void => {
        this.clearLongPressTimeout()
    }

    private readonly handleFocusIn = (event: FocusEvent): void => {
        if (this.trigger !== 'auto' && this.trigger !== 'focus') return
        if (this.trigger === 'auto') {
            const target = event.target as HTMLElement | null
            if (target && typeof target.matches === 'function') {
                try {
                    if (!target.matches(':focus-visible')) return
                } catch (_) {
                    // Fallback for environments without :focus-visible
                }
            }
        }
        this.scheduleShow()
    }

    private readonly handleFocusOut = (): void => {
        if (this.trigger !== 'auto' && this.trigger !== 'focus') return
        if (this.persistent) return
        this.scheduleHide()
    }

    private readonly handleClick = (event: MouseEvent): void => {
        if (this.trigger !== 'click') return
        const tooltip = this.tooltipElement
        if (tooltip && event.composedPath().includes(tooltip)) return
        if (this.open) {
            void this.hide()
        } else {
            void this.show()
        }
    }

    private readonly handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape' && this.open) {
            void this.hide()
        }
    }

    private readonly handleDocumentPointerDown = (event: PointerEvent): void => {
        if (!this.open) return
        if (!event.composedPath().includes(this)) {
            void this.hide()
        }
    }

    // ─── Delay Management ─────────────────────────────────────

    private scheduleShow(): void {
        this.clearHideTimeout()
        if (this.open) return
        this.clearShowTimeout()
        this.showTimeoutId = setTimeout(() => {
            this.showTimeoutId = null
            void this.show()
        }, this.showDelay)
    }

    private scheduleHide(): void {
        this.clearShowTimeout()
        if (!this.open) return
        this.clearHideTimeout()
        const effectiveHideDelay = this.hideDelay === 0 && this.isRichInteractiveTooltip()
            ? 100
            : this.hideDelay
        this.hideTimeoutId = setTimeout(() => {
            this.hideTimeoutId = null
            void this.hide()
        }, effectiveHideDelay)
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

    private clearLongPressTimeout(): void {
        if (this.longPressTimeoutId !== null) {
            clearTimeout(this.longPressTimeoutId)
            this.longPressTimeoutId = null
        }
    }

    // ─── Positioning (floating-ui) ────────────────────────────

    private startPositionTracking(): void {
        this.stopPositionTracking()

        const anchor = this.anchorElement
        const tooltip = this.tooltipElement
        if (!anchor || !tooltip) return

        const s = tooltip.style
        s.setProperty('position', 'fixed')
        s.setProperty('left', '0')
        s.setProperty('top', '0')
        s.setProperty('right', 'auto')
        s.setProperty('bottom', 'auto')
        s.setProperty('transform', 'none')
        s.setProperty('margin', '0')

        this.cleanupAutoUpdate = autoUpdate(anchor, tooltip, () => {
            void this.updatePosition()
        })
    }

    private stopPositionTracking(): void {
        this.cleanupAutoUpdate?.()
        this.cleanupAutoUpdate = null

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

        const effectiveOffset = this.caret && !this.hasAttribute('offset')
            ? Math.max(this.offset, 12)
            : this.offset

        const middleware = [
            offset(effectiveOffset),
            ...(!this.disableFlip ? [flip()] : []),
            shift({ padding: 8 }),
        ]

        const { x, y, placement: resolvedPlacement } = await computePosition(anchor, tooltip, {
            placement: this.placement,
            middleware,
        })

        this.resolvedPlacement = resolvedPlacement
        const direction = resolvedPlacement.split('-')[0]
        tooltip.setAttribute('position', direction)

        tooltip.style.setProperty('left', `${x}px`)
        tooltip.style.setProperty('top', `${y}px`)
    }

    // ─── Animation (Material 3 / Compose) ─────────────────────

    private shouldSkipAnimation(): boolean {
        if (this.quick) return true
        if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches
        }
        return false
    }

    private getTransformOriginForPlacement(): string {
        const direction = this.resolvedPlacement.split('-')[0]
        switch (direction) {
            case 'top':
                return 'bottom center'
            case 'bottom':
                return 'top center'
            case 'left':
                return 'right center'
            case 'right':
                return 'left center'
            default:
                return 'top center'
        }
    }

    private async animateTooltip(mode: 'open' | 'close', gen: number): Promise<void> {
        const tooltip = this.tooltipElement
        if (!tooltip || typeof tooltip.animate !== 'function') return

        this.activeAnimation?.cancel()

        const transformOrigin = this.getTransformOriginForPlacement()
        tooltip.style.transformOrigin = transformOrigin

        const keyframes = mode === 'open' ? [
            { opacity: 0, transform: 'scale(0.8)' },
            { opacity: 1, transform: 'scale(1)' },
        ] : [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.8)' },
        ]

        const animation = tooltip.animate(keyframes, {
            duration: mode === 'open' ? 150 : 75,
            easing: mode === 'open'
                ? Easing.EmphasizedDecelerate.ToCSSValue()
                : Easing.EmphasizedAccelerate.ToCSSValue(),
        })
        this.activeAnimation = animation

        try {
            await animation.finished
        } catch (_) {
            // Animation was cancelled by a newer show/hide call
        } finally {
            if (this.activeAnimation === animation) {
                this.activeAnimation = null
            }
            if (gen === this.generation) {
                if (mode === 'close') {
                    tooltip.style.setProperty('visibility', 'hidden')
                }
                animation.cancel()
            }
        }
    }
}
