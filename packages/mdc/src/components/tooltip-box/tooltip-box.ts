/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, query, queryAssignedElements, state } from 'lit/decorators.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import {
    getDirectionFromPlacement,
    OverlayController,
    OverlayDismissReasons,
    type OverlayPlacements,
} from '../../utils/controller/overlay-controller'
import { TriggerController, TriggerKinds } from '../../utils/controller/trigger-controller'
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

let TooltipIdCounter = 0
const LongPressDelayMs = 500

const resolveTooltipTriggerKinds = (mode: TooltipBoxTriggerMode): ReadonlyArray<TriggerKinds> => {
    switch (mode) {
        case 'auto':
            return [TriggerKinds.Hover, TriggerKinds.Focus, TriggerKinds.LongPress]
        case 'hover':
            return [TriggerKinds.Hover]
        case 'focus':
            return [TriggerKinds.Focus]
        case 'click':
            return [TriggerKinds.Click]
        case 'manual':
            return []
    }
}

/**
 * @element mdc-tooltip-box
 *
 * A controller that manages the display, positioning, and lifecycle
 * of a tooltip relative to its anchor content. Powered by the shared
 * `OverlayController` (with `OverlayTree` nesting & mutex) and `TriggerController`.
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
    mixinDelegatesAria,
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

    @query('.anchor')
    private readonly anchorWrapperElement!: HTMLElement | null

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

    private generatedTooltipId: string | null = null

    private readonly overlay = new OverlayController(this, {
        getSurfaceElement: () => this.tooltipElement,
        getAnchorElement: () => this.anchorElement ?? this.anchorWrapperElement,
        getDismissIgnoreElements: () => [this],
        getPlacement: () => this.placement as OverlayPlacements,
        getOffset: () => (this.caret && !this.hasAttribute('offset') ? Math.max(this.offset, 12) : this.offset),
        getDisableFlip: () => this.disableFlip,
        getQuick: () => this.quick,
        shouldRestoreFocus: () => false,
        exclusiveGroup: 'mdc-tooltip-box',
        onOpenChange: (nextOpen) => {
            if (this.open !== nextOpen) {
                this.open = nextOpen
            }
            const tooltip = this.tooltipElement
            if (!tooltip) return
            if (nextOpen) {
                this.syncTooltipCaret()
                tooltip.setAttribute('managed', '')
                tooltip.style.removeProperty('visibility')
                tooltip.setAttribute('open', '')
            } else {
                tooltip.style.setProperty('visibility', 'hidden')
                tooltip.removeAttribute('open')
            }
        },
        onResolvedPlacementChange: (resolvedPlacement) => {
            const tooltip = this.tooltipElement
            if (tooltip) {
                tooltip.setAttribute('position', getDirectionFromPlacement(resolvedPlacement))
            }
        },
        onBeforeShow: () => this.dispatchTooltipEvent(TooltipBoxShowingEvent, true),
        onShown: () => {
            this.dispatchTooltipEvent(TooltipBoxShownEvent, false)
        },
        onBeforeHide: () => this.dispatchTooltipEvent(TooltipBoxHidingEvent, true),
        onHidden: () => {
            this.dispatchTooltipEvent(TooltipBoxHiddenEvent, false)
        },
    })

    private readonly triggerController = new TriggerController(this, {
        getKinds: () => resolveTooltipTriggerKinds(this.trigger),
        getShowDelay: () => this.showDelay,
        getHideDelay: () => (this.hideDelay === 0 && this.isRichInteractiveTooltip() ? 100 : this.hideDelay),
        getLongPressDelay: () => LongPressDelayMs,
        isEventInsideSurface: (target) => Boolean(this.tooltipElement && target && this.tooltipElement.contains(target)),
        onOpen: ({ kind, originalEvent }) => {
            if (kind === TriggerKinds.Focus && this.trigger === 'auto') {
                const target = originalEvent.target as HTMLElement | null
                if (target && typeof target.matches === 'function') {
                    try {
                        if (!target.matches(':focus-visible')) return
                    } catch {
                        // Fallback for environments without :focus-visible
                    }
                }
            }
            void this.show()
        },
        onToggle: ({ originalEvent }) => {
            const tooltip = this.tooltipElement
            if (tooltip && originalEvent.composedPath().includes(tooltip)) return
            if (this.open) {
                void this.hide()
            } else {
                void this.show()
            }
        },
        onClose: () => {
            if (this.persistent) return
            void this.hide()
        },
    })

    public override connectedCallback(): void {
        super.connectedCallback()
        this.triggerController.setTarget(this)
    }

    protected override firstUpdated(): void {
        this.syncTooltipCaret()
        this.syncAriaDescribedBy()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        if (changedProperties.has('caret')) {
            this.syncTooltipCaret()
        }
        if (changedProperties.has('open')) {
            if (this.open && !this.overlay.opened) {
                void this.overlay.show()
            } else if (!this.open && this.overlay.opened) {
                void this.overlay.hide(OverlayDismissReasons.Programmatic)
            }
        }
        if (changedProperties.has('placement') || changedProperties.has('offset') || changedProperties.has('disableFlip')) {
            if (this.overlay.opened) {
                void this.overlay.updatePosition()
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

    /**
     * Programmatically show the tooltip.
     */
    public async show(): Promise<void> {
        this.triggerController.cancelPendingTimers()
        await this.overlay.show()
    }

    /**
     * Programmatically hide the tooltip.
     */
    public async hide(): Promise<void> {
        this.triggerController.cancelPendingTimers()
        await this.overlay.hide(OverlayDismissReasons.Programmatic)
    }

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

    private dispatchTooltipEvent(name: string, cancelable: boolean): boolean {
        return this.dispatchEvent(new CustomEvent<ITooltipBoxEventDetail>(name, {
            bubbles: true,
            composed: true,
            cancelable,
            detail: { tooltipBox: this },
        }))
    }
}
