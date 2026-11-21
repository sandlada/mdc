/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, query, queryAssignedElements, state } from 'lit/decorators.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { OverlayController, OverlayDismissReasons } from '../../utils/overlay'
import { TriggerController, TriggerKinds } from '../../utils/trigger'
import '../elevation/elevation'
import { mixinElevationOptions } from '../elevation/elevation-options.mixin'
import '../icon/icon'
import '../icon-button/icon-button'
import {
    PopoverClosedEvent,
    PopoverDismissReasons,
    PopoverHidingEvent,
    PopoverOpenedEvent,
    PopoverPlacements,
    PopoverShowingEvent,
    PopoverTriggerModes,
    PopoverVariants,
    type IMDCPopover,
    type IMDCPopoverLifecycleDetail,
} from './popover.interface'
import { PopoverStyles } from './popover.style'

const ValidVariants: readonly string[] = Object.values(PopoverVariants)
const ValidTriggers: readonly string[] = Object.values(PopoverTriggerModes)

const resolveTriggerKinds = (mode: PopoverTriggerModes): ReadonlyArray<TriggerKinds> => {
    switch (mode) {
        case PopoverTriggerModes.Click:
            return [TriggerKinds.Click]
        case PopoverTriggerModes.Hover:
            return [TriggerKinds.Hover]
        case PopoverTriggerModes.Focus:
            return [TriggerKinds.Focus]
        case PopoverTriggerModes.Manual:
            return []
    }
}

/**
 * A thin Material Design 3 Popover UI shell powered by the shared
 * `OverlayController` (with `OverlayTree` nesting) and `TriggerController`.
 *
 * @element mdc-popover
 * @slot - Rich content rendered inside the popover surface.
 * @slot trigger - The anchor element that triggers the popover.
 * @slot header - Optional header content.
 * @slot footer - Optional footer/actions content.
 *
 * @fires popover-showing - Cancelable event dispatched before the popover opens.
 * @fires popover-opened - Dispatched after the popover has opened.
 * @fires popover-hiding - Cancelable event dispatched before the popover closes.
 * @fires popover-closed - Dispatched after the popover has closed.
 *
 * @csspart anchor - The wrapper around the trigger slot.
 * @csspart surface - The floating popover surface container.
 * @csspart arrow - The directional arrow element when `arrow` is enabled.
 * @csspart scrim - The modal backdrop scrim when `modal` is enabled.
 */
@customElement('mdc-popover')
export class MDCPopover extends composeMixin(
    mixinDelegatesAria,
    mixinElevationOptions,
)(LitElement) implements IMDCPopover {

    static override styles = PopoverStyles

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    @property({ type: String, reflect: true })
    public variant: PopoverVariants = PopoverVariants.Standard

    @property({ type: String, reflect: true })
    public placement: PopoverPlacements = PopoverPlacements.BottomStart

    @property({ type: String, reflect: true })
    public trigger: PopoverTriggerModes = PopoverTriggerModes.Click

    @property({ type: Number })
    public offset: number = 8

    @property({ type: Boolean, reflect: true })
    public arrow: boolean = false

    @property({ type: Boolean, reflect: true })
    public modal: boolean = false

    @property({ type: Boolean, reflect: true })
    public quick: boolean = false

    @property({ type: Boolean, reflect: true, attribute: 'disable-flip' })
    public disableFlip: boolean = false

    @property({ type: Boolean, reflect: true, attribute: 'close-on-scroll' })
    public closeOnScroll: boolean = false

    @property({ type: String, reflect: true })
    public for: string = ''

    @property({ type: String })
    public label: string | null = null

    @property({ type: Boolean, reflect: true })
    public closable: boolean = false

    @property({ type: Number, attribute: 'show-delay' })
    public showDelay: number = 150

    @property({ type: Number, attribute: 'hide-delay' })
    public hideDelay: number = 150

    @state()
    private hasHeader: boolean = false

    @state()
    private hasFooter: boolean = false

    @query('.anchor')
    private readonly anchorWrapperElement!: HTMLElement | null

    @query('.surface')
    private readonly surfaceElement!: HTMLElement | null

    @query('.arrow')
    private readonly arrowElement!: HTMLElement | null

    @queryAssignedElements({ slot: 'trigger', flatten: true })
    private readonly triggerSlotElements!: HTMLElement[]

    private readonly overlay = new OverlayController(this, {
        getSurfaceElement: () => this.surfaceElement,
        getAnchorElement: () => this.resolveAnchorElement(),
        getArrowElement: () => (this.arrow ? this.arrowElement : null),
        getDismissIgnoreElements: () => [this.resolveExternalAnchor()],
        getPlacement: () => this.placement,
        getOffset: () => (this.arrow ? Math.max(this.offset, 10) : this.offset),
        getDisableFlip: () => this.disableFlip,
        getQuick: () => this.quick,
        getCloseOnScroll: () => this.closeOnScroll,
        onOpenChange: (nextOpen) => {
            if (this.open !== nextOpen) {
                this.open = nextOpen
            }
            this.syncTriggerAriaExpanded()
        },
        onBeforeShow: () => this.dispatchLifecycleEvent(PopoverShowingEvent, true),
        onShown: () => {
            this.dispatchLifecycleEvent(PopoverOpenedEvent, false)
        },
        onBeforeHide: (reason) => this.dispatchLifecycleEvent(PopoverHidingEvent, true, reason),
        onHidden: (reason) => {
            this.dispatchLifecycleEvent(PopoverClosedEvent, false, reason)
        },
    })

    private readonly triggerController = new TriggerController(this, {
        getKinds: () => resolveTriggerKinds(this.trigger),
        getShowDelay: () => this.showDelay,
        getHideDelay: () => this.hideDelay,
        onOpen: () => {
            void this.overlay.show()
        },
        onToggle: () => {
            void this.overlay.toggle()
        },
        onClose: () => {
            void this.overlay.hide(OverlayDismissReasons.PointerLeave)
        },
    })

    public override connectedCallback(): void {
        super.connectedCallback()
        this.syncTriggerTarget()
    }

    protected override firstUpdated(): void {
        this.syncTriggerTarget()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)

        if (changedProperties.has('variant') && !ValidVariants.includes(this.variant)) {
            throw new Error(`Invalid mdc-popover variant "${this.variant}". Expected one of: ${ValidVariants.join(', ')}`)
        }
        if (changedProperties.has('trigger') && !ValidTriggers.includes(this.trigger)) {
            throw new Error(`Invalid mdc-popover trigger "${this.trigger}". Expected one of: ${ValidTriggers.join(', ')}`)
        }

        if (changedProperties.has('for')) {
            this.syncTriggerTarget()
        }

        if (changedProperties.has('open')) {
            if (this.open && !this.overlay.opened) {
                void this.overlay.show()
            } else if (!this.open && this.overlay.opened) {
                void this.overlay.hide(OverlayDismissReasons.Programmatic)
            }
            this.syncTriggerAriaExpanded()
        }

        if (
            this.overlay.opened
            && (changedProperties.has('placement')
                || changedProperties.has('offset')
                || changedProperties.has('arrow')
                || changedProperties.has('disableFlip'))
        ) {
            void this.overlay.updatePosition()
        }
    }

    public async show(): Promise<void> {
        this.triggerController.cancelPendingTimers()
        await this.overlay.show()
    }

    public async showAt(x: number, y: number): Promise<void> {
        this.triggerController.cancelPendingTimers()
        await this.overlay.showAt(x, y)
    }

    public async hide(reason: PopoverDismissReasons = PopoverDismissReasons.Programmatic): Promise<void> {
        this.triggerController.cancelPendingTimers()
        await this.overlay.hide(reason)
    }

    public async toggle(): Promise<void> {
        this.triggerController.cancelPendingTimers()
        await this.overlay.toggle()
    }

    protected override render(): TemplateResult {
        const dialogLabel = this.label ?? this.ariaLabel ?? undefined
        return html`
            <div class="anchor" part="anchor">
                <slot name="trigger" @slotchange=${this.handleTriggerSlotChange}></slot>
            </div>
            ${this.modal ? html`<div class="scrim" part="scrim" @click=${this.handleScrimClick}></div>` : nothing}
            <div
                class="surface"
                part="surface"
                role="dialog"
                aria-modal=${this.modal ? 'true' : 'false'}
                aria-label=${dialogLabel ?? nothing}
                tabindex="-1"
                @pointerenter=${() => this.triggerController.notifySurfacePointerEnter()}
                @pointerleave=${(e: PointerEvent) => this.triggerController.notifySurfacePointerLeave(e)}
            >
                <mdc-elevation class="elevation"></mdc-elevation>
                ${this.arrow ? html`<div class="arrow" part="arrow" aria-hidden="true"></div>` : nothing}
                <div class="content">
                    <div class="header-row" ?hidden=${!this.hasHeader && !this.closable}>
                        <div class="header" ?hidden=${!this.hasHeader}>
                            <slot name="header" @slotchange=${this.handleHeaderSlotChange}></slot>
                        </div>
                        ${this.closable ? html`
                            <mdc-icon-button
                                class="close-btn"
                                aria-label="Close"
                                @click=${this.handleCloseButtonClick}
                            >
                                <mdc-icon>close</mdc-icon>
                            </mdc-icon-button>
                        ` : nothing}
                    </div>
                    <slot></slot>
                    <div class="footer" ?hidden=${!this.hasFooter}>
                        <slot name="footer" @slotchange=${this.handleFooterSlotChange}></slot>
                    </div>
                </div>
            </div>
        `
    }

    private resolveExternalAnchor(): HTMLElement | null {
        if (typeof document === 'undefined' || !this.for) return null
        const root = this.getRootNode()
        if (root instanceof Document || root instanceof ShadowRoot) {
            const escaped = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
                ? CSS.escape(this.for)
                : this.for
            return root.querySelector<HTMLElement>(`#${escaped}`)
        }
        return null
    }

    private resolveAnchorElement(): HTMLElement | null {
        return this.resolveExternalAnchor() ?? this.triggerSlotElements[0] ?? this.anchorWrapperElement
    }

    private syncTriggerTarget(): void {
        const target = this.resolveExternalAnchor() ?? this.triggerSlotElements[0] ?? null
        this.triggerController.setTarget(target)
        this.syncTriggerAriaExpanded()
    }

    private syncTriggerAriaExpanded(): void {
        const triggerEl = this.resolveExternalAnchor() ?? this.triggerSlotElements[0]
        if (!triggerEl) return
        triggerEl.setAttribute('aria-haspopup', 'dialog')
        triggerEl.setAttribute('aria-expanded', String(this.open))
    }

    private handleTriggerSlotChange = (): void => {
        this.syncTriggerTarget()
    }

    private handleHeaderSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasHeader = slot.assignedNodes({ flatten: true }).length > 0
    }

    private handleFooterSlotChange = (event: Event): void => {
        const slot = event.target as HTMLSlotElement
        this.hasFooter = slot.assignedNodes({ flatten: true }).length > 0
    }

    private handleScrimClick = (): void => {
        void this.hide(PopoverDismissReasons.OutsideClick)
    }

    private handleCloseButtonClick = (): void => {
        void this.hide(PopoverDismissReasons.Programmatic)
    }

    private dispatchLifecycleEvent(
        name: string,
        cancelable: boolean,
        reason?: PopoverDismissReasons,
    ): boolean {
        const detail: IMDCPopoverLifecycleDetail = reason
            ? { popover: this, reason }
            : { popover: this }
        return this.dispatchEvent(new CustomEvent<IMDCPopoverLifecycleDetail>(name, {
            bubbles: true,
            composed: true,
            cancelable,
            detail,
        }))
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-popover': MDCPopover
    }
}
