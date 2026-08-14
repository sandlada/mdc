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
 * the tab is responsible for rendering its icon / label and the animated
 * active indicator.
 *
 * Label and icon width/opacity changes are animated via
 * {@link MeasuredDimensionController} and {@link OpacityTransitionController},
 * so a tab visibly resizes / fades when its slotted content changes.
 */
import { html, isServer, LitElement, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, queryAssignedNodes } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { MeasuredDimensionController } from '../../../utils/controller/measured-dimension-controller'
import { OpacityTransitionController } from '../../../utils/controller/opacity-transition-controller'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import type { ITab, TabVariant } from '../tab.interface'

/**
 * Symbol used by `mdc-tabs` to request a tab to animate its active indicator
 * from the previously selected tab's indicator position.
 */
export const ANIMATE_INDICATOR = Symbol('animateIndicator')

/** MD3E Expressive spatial easing used for the indicator morph. */
const INDICATOR_EASING = 'cubic-bezier(0.38, 1.21, 0.22, 1)'
const INDICATOR_DURATION = 250

// NOTE: `mixinDelegatesAria` is intentionally NOT used here. The tab host is
// itself the focusable, interactive element (it carries `role="tab"` and
// `aria-selected`); delegating aria to a `data-*` attribute would strip the
// role from the accessibility tree.
export abstract class BaseTab extends composeMixin(
    mixinElementInternals,
    mixinRippleOptions,
    mixinFocusRingOptions
)(LitElement) implements ITab {

    /**
     * Marks the element as a tab child of `mdc-tabs`. The bar discovers its
     * tabs by querying this attribute.
     */
    @property({ type: Boolean, reflect: true, attribute: 'mdc-tab' })
    public readonly isTab = true

    /** Whether this tab is currently selected. */
    @property({ type: Boolean, reflect: true })
    public active = false

    /** @deprecated use `active`. */
    @property({ type: Boolean })
    public get selected(): boolean {
        return this.active
    }
    public set selected(active: boolean) {
        this.active = active
    }

    /** Visual variant — `primary` | `secondary` | `floating`. */
    @property({ type: String, reflect: true })
    public variant: TabVariant = 'primary'

    /** Index within the parent `mdc-tabs`, assigned by the bar. */
    @property({ type: Number })
    public index = 0

    /** Set when the `icon` slot is populated. */
    @property({ type: Boolean, reflect: true, attribute: 'has-icon' })
    public hasIcon = false

    /** Set when the default slot is empty — the tab shows only its icon. */
    @property({ type: Boolean, reflect: true, attribute: 'icon-only' })
    public iconOnly = false

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
            'has-icon': this.hasIcon,
            'has-label': !this.iconOnly,
        }
    }

    protected override render(): TemplateResult {
        return html`
            <div class="tab" role="presentation" @click=${this.handleContentClick}>
                ${this.renderFocusRing()}
                ${this.renderRipple()}
                <div class="content ${classMap(this.getContentClasses())}" role="presentation">
                    <span class="icon" aria-hidden="true">
                        <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
                    </span>
                    <span class="label">
                        <slot @slotchange=${this.handleSlotChange}></slot>
                    </span>
                </div>
                <div class="indicator" aria-hidden="true"></div>
            </div>
        `
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('active')) {
            this.setAttribute('aria-selected', String(this.active))
        }
    }

    private readonly handleKeydown = (event: KeyboardEvent): void => {
        if (event.defaultPrevented) return
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            this.click()
        }
    }

    private readonly handleContentClick = (event: Event): void => {
        // Ensure the click target is always the tab host, not slotted content.
        event.stopPropagation()
        this.click()
    }

    private readonly handleSlotChange = (): void => {
        this.iconOnly = false
        // If the default slot has no element or non-whitespace text, the tab
        // is icon-only.
        for (const node of this.assignedDefaultNodes) {
            const hasTextContent =
                node.nodeType === Node.TEXT_NODE &&
                !!(node as Text).wholeText.match(/\S/)
            if (node.nodeType === Node.ELEMENT_NODE || hasTextContent) {
                return
            }
        }
        this.iconOnly = true
    }

    private readonly handleIconSlotChange = (): void => {
        this.hasIcon = this.assignedIcons.length > 0
    }

    /**
     * Animates the active indicator from the previously selected tab's
     * indicator bounds to this tab's, via a `translateX` + `scaleX` morph.
     * Falls back to an opacity fade when motion is reduced.
     */
    public [ANIMATE_INDICATOR](previousTab: BaseTab | null): void {
        if (!this.indicatorElement) return
        this.indicatorElement.getAnimations().forEach((a) => a.cancel())
        const frames = this.getKeyframes(previousTab)
        if (frames !== null) {
            this.indicatorElement.animate(frames, {
                duration: INDICATOR_DURATION,
                easing  : INDICATOR_EASING,
            })
        }
    }

    private getKeyframes(previousTab: BaseTab | null): Keyframe[] | null {
        const reduceMotion = shouldReduceMotion()
        if (!this.active) {
            return reduceMotion ? [{ opacity: 1 }, { transform: 'none' }] : null
        }

        const from: Keyframe = {}
        const fromRect = previousTab?.indicatorElement?.getBoundingClientRect() ?? ({} as DOMRect)
        const fromPos = fromRect.left
        const fromExtent = fromRect.width
        const toRect = this.indicatorElement!.getBoundingClientRect()
        const toPos = toRect.left
        const toExtent = toRect.width
        const scale = fromExtent / toExtent
        if (
            !reduceMotion &&
            fromPos !== undefined &&
            toPos !== undefined &&
            !isNaN(scale)
        ) {
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
