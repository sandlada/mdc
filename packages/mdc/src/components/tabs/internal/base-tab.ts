/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-tab`.
 *
 * A tab is a single-select cell inside an `mdc-tabs` bar. Selection is owned
 * by the parent bar (roving `tabindex`, `role="tab"`, `aria-selected`), while
 * the tab is responsible for rendering its icon, badge, label, and the
 * animated active indicator.
 *
 * Label and icon width/opacity changes are animated via
 * {@link MeasuredDimensionController} and {@link OpacityTransitionController},
 * so a tab visibly resizes / fades when its slotted content changes.
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, queryAssignedNodes } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { MeasuredDimensionController, OpacityTransitionController } from '../../../utils/motion'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import { TabVariant, type IMDCTab } from '../tab.interface'

/**
 * Symbol used by `mdc-tabs` to request a tab to animate its active indicator
 * from the previously selected tab's indicator position.
 */
export const AnimateIndicator = Symbol('animateIndicator')

/** MD3E Expressive spatial easing used for the indicator morph. */
const IndicatorEasing = 'cubic-bezier(0.38, 1.21, 0.22, 1)'
const IndicatorDuration = 250

// NOTE: `mixinDelegatesAria` is intentionally NOT used here. The tab host is
// itself the focusable, interactive element (it carries `role="tab"` and
// `aria-selected`); delegating aria to a `data-*` attribute would strip the
// role from the accessibility tree.
export abstract class BaseTab
    extends composeMixin(mixinElementInternals, mixinRippleOptions, mixinFocusRingOptions)(LitElement)
    implements IMDCTab
{
    /**
     * Marks the element as a tab child of `mdc-tabs`. The bar discovers its
     * tabs by querying this attribute.
     */
    @property({ type: Boolean, reflect: true, attribute: 'mdc-tab' })
    public readonly isTab = true

    /** Whether this tab is currently selected. */
    @property({ type: Boolean, reflect: true })
    public active = false

    /** Whether this tab is disabled and non-interactive. */
    @property({ type: Boolean, reflect: true })
    public disabled = false

    /** Keeps a disabled tab focusable in roving tabindex order. */
    @property({ type: Boolean, reflect: true, attribute: 'always-focusable' })
    public alwaysFocusable = false

    /** Visual variant — `primary` | `secondary` | `floating`. */
    @property({ type: String, reflect: true })
    public variant: TabVariant = TabVariant.Primary

    /** Index within the parent `mdc-tabs`, assigned by the bar. */
    @property({ type: Number })
    public index = 0

    /** Set automatically when the `icon` slot is populated. */
    @property({ type: Boolean, reflect: true, attribute: 'has-icon' })
    public hasIcon = false

    /** Set automatically when the default slot (and `label`) is empty — the tab shows only its icon. */
    @property({ type: Boolean, reflect: true, attribute: 'icon-only' })
    public iconOnly = false

    /** Set automatically when the `badge` slot is populated. */
    @property({ type: Boolean, reflect: true, attribute: 'has-badge' })
    public hasBadge = false

    /** Optional fallback label text when the default slot is empty; also used for `aria-label`. */
    @property({ type: String })
    public label = ''

    @query('.tab')
    protected readonly buttonElement!: HTMLElement | null
    @query('.content')
    protected readonly contentElement!: HTMLElement | null
    @query('.indicator')
    protected readonly indicatorElement!: HTMLElement | null
    @query('.label')
    protected readonly labelElement!: HTMLElement | null
    @query('.icon')
    protected readonly iconElement!: HTMLElement | null

    @queryAssignedNodes({ flatten: true })
    private readonly assignedDefaultNodes!: Node[]
    @queryAssignedElements({ slot: 'icon', flatten: true })
    private readonly assignedIcons!: HTMLElement[]
    @queryAssignedElements({ slot: 'badge', flatten: true })
    private readonly assignedBadges!: HTMLElement[]

    /** Animates the label width when the slotted label text changes. */
    protected readonly labelWidthController = new MeasuredDimensionController(this, {
        target: () => this.labelElement,
    })
    /** Fades the label when its content changes. */
    protected readonly labelOpacityController = new OpacityTransitionController(this, {
        target: () => this.labelElement,
    })
    /** Fades the icon when the icon slot content changes. */
    protected readonly iconOpacityController = new OpacityTransitionController(this, {
        target: () => this.iconElement,
    })

    /** Ripple / focus ring track pointer & focus on the host. */
    public override get rippleControl(): HTMLElement | null {
        return this
    }
    public override get focusRingControl(): HTMLElement | null {
        return this
    }

    public constructor() {
        super()
        if (isServer) return
        this.role = 'tab'
        this.setAttribute('aria-selected', String(this.active))
        this.addEventListener('keydown', this.handleKeydown)
    }

    protected getContentClasses() {
        return {
            'has-icon' : this.hasIcon,
            'has-label': !this.iconOnly,
            'has-badge': this.hasBadge,
        }
    }

    protected override render(): TemplateResult {
        const indicator = html`<div class="indicator" part="indicator" aria-hidden="true"></div>`
        const isPrimary = this.variant === TabVariant.Primary

        return html`
            <div class="tab" part="tab" role="presentation" @click=${this.handleContentClick}>
                ${this.renderFocusRing()}
                ${this.disabled ? nothing : this.renderRipple()}
                <div class="content ${classMap(this.getContentClasses())}" role="presentation">
                    <span class="icon" aria-hidden="true">
                        <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
                        ${this.hasIcon ? html`<span class="badge"><slot name="badge" @slotchange=${this.handleBadgeSlotChange}></slot></span>` : nothing}
                    </span>
                    <span class="label">
                        <slot @slotchange=${this.handleSlotChange}>${this.label}</slot>
                    </span>
                    ${!this.hasIcon ? html`<span class="badge"><slot name="badge" @slotchange=${this.handleBadgeSlotChange}></slot></span>` : nothing}
                    ${isPrimary ? indicator : nothing}
                </div>
                ${isPrimary ? nothing : indicator}
            </div>
        `
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('active')) {
            this.setAttribute('aria-selected', String(this.active))
        }
        if (changedProperties.has('disabled')) {
            if (this.disabled) {
                this.setAttribute('aria-disabled', 'true')
            } else {
                this.removeAttribute('aria-disabled')
            }
        }
        if (changedProperties.has('label')) {
            this.syncLabelState()
        }
    }

    private readonly handleKeydown = (event: KeyboardEvent): void => {
        if (event.defaultPrevented || this.disabled) return
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            this.click()
        }
    }

    private readonly handleContentClick = (event: Event): void => {
        if (this.disabled) {
            event.preventDefault()
            event.stopPropagation()
            return
        }
        // Ensure the click target is always the tab host, not slotted content.
        event.stopPropagation()
        this.click()
    }

    private readonly handleSlotChange = (): void => {
        this.syncLabelState()
    }

    private syncLabelState(): void {
        let hasSlotContent = false
        for (const node of this.assignedDefaultNodes) {
            const hasTextContent =
                node.nodeType === Node.TEXT_NODE &&
                !!(node as Text).wholeText.match(/\S/)
            if (node.nodeType === Node.ELEMENT_NODE || hasTextContent) {
                hasSlotContent = true
                break
            }
        }
        this.iconOnly = !hasSlotContent && !this.label
    }

    private readonly handleIconSlotChange = (): void => {
        this.hasIcon = this.assignedIcons.length > 0
    }

    private readonly handleBadgeSlotChange = (): void => {
        this.hasBadge = this.assignedBadges.length > 0
    }

    /**
     * Animates the active indicator from the previously selected tab's
     * indicator bounds to this tab's, via a `translateX` + `scaleX` morph.
     * Falls back to an opacity fade when motion is reduced.
     */
    public [AnimateIndicator](previousTab: BaseTab | null): void {
        if (!this.indicatorElement) return
        this.indicatorElement.getAnimations().forEach((a) => a.cancel())
        const frames = this.getKeyframes(previousTab)
        if (frames !== null) {
            this.indicatorElement.animate(frames, {
                duration: IndicatorDuration,
                easing  : IndicatorEasing,
            })
        }
    }

    private getKeyframes(previousTab: BaseTab | null): Keyframe[] | null {
        const reduceMotion = shouldReduceMotion()
        if (!this.active) {
            return reduceMotion ? [{ opacity: 1 }, { transform: 'none' }] : null
        }

        const from: Keyframe = {}
        const fromRect = previousTab?.indicatorElement?.getBoundingClientRect()
        const toRect = this.indicatorElement!.getBoundingClientRect()
        const fromPos = fromRect?.left
        const fromExtent = fromRect?.width ?? 0
        const toPos = toRect.left
        const toExtent = toRect.width

        if (
            !reduceMotion &&
            fromPos !== undefined &&
            fromExtent > 0 &&
            toExtent > 0
        ) {
            const scale = fromExtent / toExtent
            from['transform'] = `translateX(${(fromPos - toPos).toFixed(4)}px) scaleX(${scale.toFixed(4)})`
        } else {
            from['opacity'] = 0
        }
        // Note: including `transform: none` avoids quirky Safari behavior that
        // can hide the animation.
        return [from, { transform: 'none' }]
    }
}

function shouldReduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
