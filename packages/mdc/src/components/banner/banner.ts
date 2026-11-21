/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import '../icon/icon'
import {
    BannerClosedEvent,
    BannerCloseReason,
    BannerClosingEvent,
    BannerLayout,
    BannerOpenedEvent,
    BannerOpeningEvent,
    BannerPrimaryActionEvent,
    BannerSecondaryActionEvent,
    BannerVariant,
    type IMDCBanner,
    type IMDCBannerCloseEventDetail,
} from './banner.interface'
import { BannerStyles } from './banner.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-banner': MDCBanner
    }
}

const ExpandCollapseFallbackMs = 350

/**
 * @element mdc-banner
 *
 * A Material Design banner displays an important, succinct message in-flow
 * (typically below a top app bar) and provides 1–2 actions for users to address
 * or dismiss it. Unlike a snackbar, a banner is persistent and pushes page
 * content rather than floating over it.
 *
 * @slot - The banner message / supporting text.
 * @slot icon - Optional leading icon (or illustration).
 * @slot headline - Optional short headline above the message.
 * @slot primary-action - Optional custom primary action element (e.g. `<mdc-button>`).
 * @slot secondary-action - Optional custom secondary action element (e.g. `<mdc-button>`).
 * @slot actions - Optional container slot for arbitrary custom action controls.
 *
 * @fires banner-opening - Dispatched when the banner starts opening.
 * @fires banner-opened - Dispatched when the banner finishes opening.
 * @fires banner-closing - Dispatched when the banner starts closing (`detail.reason`).
 * @fires banner-closed - Dispatched when the banner finishes closing (`detail.reason`).
 * @fires banner-primary-action - Dispatched when the built-in primary action button is clicked (cancelable).
 * @fires banner-secondary-action - Dispatched when the built-in secondary action button is clicked (cancelable).
 *
 * @cssproperty --mdc-banner-enabled-container-color
 * @cssproperty --mdc-banner-enabled-headline-color
 * @cssproperty --mdc-banner-enabled-supporting-text-color
 * @cssproperty --mdc-banner-enabled-icon-color
 * @cssproperty --mdc-banner-enabled-icon-container-color
 * @cssproperty --mdc-banner-enabled-action-text-color
 * @cssproperty --mdc-banner-enabled-divider-color
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/banner/overview
 */
@customElement('mdc-banner')
export class MDCBanner extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements IMDCBanner {

    public static override styles = BannerStyles

    @property({ type: Boolean, reflect: true })
    public open: boolean = true

    @property({ type: String, reflect: true })
    public variant: BannerVariant = BannerVariant.Surface

    @property({ type: String, reflect: true })
    public layout: BannerLayout = BannerLayout.Auto

    @property({ type: String, reflect: true })
    public headline: string = ''

    @property({ type: String, attribute: 'supporting-text' })
    public supportingText: string = ''

    @property({ type: String, reflect: true })
    public icon: string = ''

    @property({ type: Boolean, attribute: 'icon-container', reflect: true })
    public iconContainer: boolean = false

    @property({ type: String, attribute: 'primary-action' })
    public primaryAction: string = ''

    @property({ type: String, attribute: 'secondary-action' })
    public secondaryAction: string = ''

    @property({ type: Boolean, attribute: 'no-divider', reflect: true })
    public noDivider: boolean = false

    @property({ type: Boolean, attribute: 'dismiss-on-action', reflect: true })
    public dismissOnAction: boolean = false

    @property({ type: Boolean, reflect: true })
    public quick: boolean = false

    @state()
    private hasSlottedIcon: boolean = false

    @state()
    private hasSlottedHeadline: boolean = false

    @state()
    private hasSlottedPrimaryAction: boolean = false

    @state()
    private hasSlottedSecondaryAction: boolean = false

    @state()
    private hasSlottedActions: boolean = false

    @query('.collapse')
    private readonly collapseElement!: HTMLDivElement | null

    private pendingCloseReason: BannerCloseReason = BannerCloseReason.Dismiss
    private transitionFallbackTimer: ReturnType<typeof setTimeout> | null = null
    private pendingTransitionState: 'opening' | 'closing' | null = null

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.clearTransitionFallbackTimer()
        this.pendingTransitionState = null
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        if (!this.hasUpdated) {
            this.syncLightDomSlots()
        }
        if (changedProperties.has('open') && this.hasUpdated) {
            const wasOpen = changedProperties.get('open')
            if (this.open && wasOpen === false) {
                this.startOpenTransition()
            } else if (!this.open && wasOpen === true) {
                this.startCloseTransition()
            }
        }
    }

    private syncLightDomSlots(): void {
        this.hasSlottedIcon = this.querySelector('[slot="icon"]') !== null
        this.hasSlottedHeadline = this.querySelector('[slot="headline"]') !== null
        this.hasSlottedPrimaryAction = this.querySelector('[slot="primary-action"]') !== null
        this.hasSlottedSecondaryAction = this.querySelector('[slot="secondary-action"]') !== null
        this.hasSlottedActions = this.querySelector('[slot="actions"]') !== null
    }

    /**
     * Shows (expands) the banner.
     */
    public async show(): Promise<void> {
        if (this.open) return
        this.open = true
        await this.updateComplete
    }

    /**
     * Hides (collapses) the banner with an optional close reason.
     */
    public async hide(reason: BannerCloseReason = BannerCloseReason.Dismiss): Promise<void> {
        if (!this.open) return
        this.pendingCloseReason = reason
        this.open = false
        await this.updateComplete
    }

    protected getRenderClasses() {
        const hasPrimary = this.hasSlottedPrimaryAction || Boolean(this.primaryAction)
        const hasSecondary = this.hasSlottedSecondaryAction || Boolean(this.secondaryAction)
        const hasTwoActions = hasPrimary && hasSecondary
        const hasHeadline = this.hasSlottedHeadline || Boolean(this.headline)

        return ({
            'surface'        : true,
            [`layout-${this.layout}`]: true,
            'has-two-actions': hasTwoActions,
            'has-headline'   : hasHeadline,
            'no-divider'     : this.noDivider,
        })
    }

    protected override render(): TemplateResult {
        const isError = this.variant === BannerVariant.ErrorContainer
        const hasIcon = this.hasSlottedIcon || Boolean(this.icon)
        const hasHeadline = this.hasSlottedHeadline || Boolean(this.headline)
        const hasPrimary = this.hasSlottedPrimaryAction || Boolean(this.primaryAction)
        const hasSecondary = this.hasSlottedSecondaryAction || Boolean(this.secondaryAction)
        const hasAnyActions = hasPrimary || hasSecondary || this.hasSlottedActions

        return html`
            <div
                class="collapse"
                ?inert=${!this.open}
                aria-hidden=${this.open ? 'false' : 'true'}
                @transitionend=${this.handleCollapseTransitionEnd}
            >
                <div class="collapse-inner">
                    <div
                        class=${classMap(this.getRenderClasses())}
                        role=${isError ? 'alert' : 'status'}
                        aria-live=${isError ? 'assertive' : 'polite'}
                    >
                        <div class="body">
                            <span
                                class=${classMap({
                                    'icon-wrapper'      : true,
                                    'has-icon-container': this.iconContainer,
                                })}
                                ?hidden=${!hasIcon}
                                aria-hidden="true"
                            >
                                <slot name="icon" @slotchange=${this.handleIconSlotChange}>
                                    ${this.icon ? html`<mdc-icon>${this.icon}</mdc-icon>` : null}
                                </slot>
                            </span>
                            <div class="text-group">
                                <div class="headline" ?hidden=${!hasHeadline}>
                                    <slot name="headline" @slotchange=${this.handleHeadlineSlotChange}>
                                        ${this.headline}
                                    </slot>
                                </div>
                                <div class="supporting-text">
                                    <slot>${this.supportingText}</slot>
                                </div>
                            </div>
                        </div>
                        <div class="actions" ?hidden=${!hasAnyActions}>
                            <slot name="secondary-action" @slotchange=${this.handleSecondaryActionSlotChange}></slot>
                            <button
                                type="button"
                                class="action secondary"
                                ?hidden=${this.hasSlottedSecondaryAction || !this.secondaryAction}
                                @click=${this.handleSecondaryActionClick}
                            >${this.secondaryAction}</button>
                            <slot name="primary-action" @slotchange=${this.handlePrimaryActionSlotChange}></slot>
                            <button
                                type="button"
                                class="action primary"
                                ?hidden=${this.hasSlottedPrimaryAction || !this.primaryAction}
                                @click=${this.handlePrimaryActionClick}
                            >${this.primaryAction}</button>
                            <slot name="actions" @slotchange=${this.handleActionsSlotChange}></slot>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    private startOpenTransition(): void {
        this.clearTransitionFallbackTimer()
        this.pendingCloseReason = BannerCloseReason.Dismiss
        this.pendingTransitionState = 'opening'
        this.dispatchEvent(new Event(BannerOpeningEvent, { bubbles: true, composed: true }))

        if (this.quick || this.prefersReducedMotion()) {
            this.finalizeTransition()
            return
        }

        void this.updateComplete.then(() => {
            if (this.pendingTransitionState !== 'opening') return
            const anims = this.collapseElement?.getAnimations?.() ?? []
            if (anims.length === 0) {
                this.finalizeTransition()
            } else {
                this.transitionFallbackTimer = setTimeout(() => this.finalizeTransition(), ExpandCollapseFallbackMs)
            }
        })
    }

    private startCloseTransition(): void {
        this.clearTransitionFallbackTimer()
        const reason = this.pendingCloseReason
        this.pendingTransitionState = 'closing'
        this.dispatchEvent(new CustomEvent<IMDCBannerCloseEventDetail>(
            BannerClosingEvent,
            { detail: { reason }, bubbles: true, composed: true }
        ))

        if (this.quick || this.prefersReducedMotion()) {
            this.finalizeTransition()
            return
        }

        void this.updateComplete.then(() => {
            if (this.pendingTransitionState !== 'closing') return
            const anims = this.collapseElement?.getAnimations?.() ?? []
            if (anims.length === 0) {
                this.finalizeTransition()
            } else {
                this.transitionFallbackTimer = setTimeout(() => this.finalizeTransition(), ExpandCollapseFallbackMs)
            }
        })
    }

    private handleCollapseTransitionEnd(event: TransitionEvent): void {
        if (event.target !== this.collapseElement) return
        if (event.propertyName !== 'grid-template-rows') return
        this.finalizeTransition()
    }

    private finalizeTransition(): void {
        this.clearTransitionFallbackTimer()
        const state = this.pendingTransitionState
        if (!state) return
        this.pendingTransitionState = null

        if (state === 'opening' && this.open) {
            this.dispatchEvent(new Event(BannerOpenedEvent, { bubbles: true, composed: true }))
        } else if (state === 'closing' && !this.open) {
            const reason = this.pendingCloseReason
            this.dispatchEvent(new CustomEvent<IMDCBannerCloseEventDetail>(
                BannerClosedEvent,
                { detail: { reason }, bubbles: true, composed: true }
            ))
        }
    }

    private clearTransitionFallbackTimer(): void {
        if (this.transitionFallbackTimer !== null) {
            clearTimeout(this.transitionFallbackTimer)
            this.transitionFallbackTimer = null
        }
    }

    private prefersReducedMotion(): boolean {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }

    private handleIconSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedIcon = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleHeadlineSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedHeadline = slot.assignedNodes({ flatten: true }).some(
            (n) => n.nodeType === Node.ELEMENT_NODE || (n.textContent?.trim().length ?? 0) > 0
        )
    }

    private handlePrimaryActionSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedPrimaryAction = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleSecondaryActionSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedSecondaryAction = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleActionsSlotChange(event: Event): void {
        const slot = event.target as HTMLSlotElement
        this.hasSlottedActions = slot.assignedElements({ flatten: true }).length > 0
    }

    private handlePrimaryActionClick(): void {
        const event = new Event(BannerPrimaryActionEvent, {
            bubbles   : true,
            composed  : true,
            cancelable: true,
        })
        const notPrevented = this.dispatchEvent(event)
        if (this.dismissOnAction && notPrevented) {
            void this.hide(BannerCloseReason.PrimaryAction)
        }
    }

    private handleSecondaryActionClick(): void {
        const event = new Event(BannerSecondaryActionEvent, {
            bubbles   : true,
            composed  : true,
            cancelable: true,
        })
        const notPrevented = this.dispatchEvent(event)
        if (this.dismissOnAction && notPrevented) {
            void this.hide(BannerCloseReason.SecondaryAction)
        }
    }
}
