/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Navigation tab component that behaves like a single-select control and
 * synchronizes selection through the navigation state store.
 *
 * @example
 * ```html
 * <mdc-navigation-bar navigation-scope="main-nav">
 *   <mdc-navigation-tab name="bar-tabs" value="/home">Home</mdc-navigation-tab>
 *   <mdc-navigation-tab name="bar-tabs" value="/settings">Settings</mdc-navigation-tab>
 * </mdc-navigation-bar>
 *
 * <script>
 *   const bar = document.querySelector('mdc-navigation-bar')
 *   bar?.addEventListener('change', (event) => {
 *     const [newValue, oldValue] = event.detail
 *   })
 * </script>
 * ```
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { SelectionController } from '../../utils/controller/selection-controller'
import {
    GlobalNavigationStateStore,
    type NavigationEventTrigger,
    type NavigationScopeMutation,
} from '../../utils/navigation/navigation-state-store'
import type { INavigationTab } from './navigation-tab.interface'
import { NavigationTabVariant } from './navigation-tab.interface'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { mixinRippleOptions } from '../ripple/ripple-options.mixin'
import { mixinFocusRingOptions } from '../focus-ring/focus-ring-options.mixin'
import { mixinElementInternals } from '../../utils/behaviors/element-internals'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { CreateValidator, GetValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { GetFormState, GetFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { RadioValidator } from '../../utils/behaviors/validators/radio-validator'
import { NavigationTabStyles } from './navigation-tab.style'
import { classMap } from 'lit/directives/class-map.js'
import { isActivationClick } from '../../utils/event/form-label-activation'
import { readDirectLabel } from './internal/read-direct-label'
import {
    captureNavigationTabSnapshot,
    isReducedMotion,
    runNavigationTabTransitions,
    type INavigationTabMotionElements,
    type INavigationTabMotionSnapshot,
} from './internal/navigation-tab-motion'

const KeyboardSelectionKeys = new Set([' ', 'Enter'])

const ValidTabVariants = new Set<string>(Object.values(NavigationTabVariant))

function createNavigationTabId(): string {
    return `mdc-navigation-tab-${crypto.randomUUID()}`
}

declare global {
    interface HTMLElementTagNameMap {
        'mdc-navigation-tab': MDCNavigationTab
    }
}

/**
 *
 * @tutorial
 * - bar    : vertical | horizontal
 * - bar-xr : vertical
 * - rail   : vertical | horizontal | round
 * - rail-xr: vertical | round
 *
 * @version "Material Design 3"
 * @version "Material Design 3 - Expressive"
 */
@customElement('mdc-navigation-tab')
export class MDCNavigationTab extends composeMixin(
    mixinDelegatesAria,
    mixinConstraintValidation,
    mixinFormAssociated,
    mixinElementInternals,
    mixinRippleOptions,
    mixinFocusRingOptions,
)(LitElement) implements INavigationTab {

    static override shadowRootOptions = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: true,
    }

    static override styles = NavigationTabStyles

    declare disabled: boolean
    declare name: string

    @property({ type: String, reflect: true })
    public label: string = ''

    @property({ type: String, reflect: true })
    public badge: string = ''

    @property({ type: Boolean, reflect: true, attribute: 'badge-dot' })
    public badgeDot: boolean = false

    @property({ type: String })
    public value: string = ''

    @property({ type: String, reflect: true })
    public href: string | null = null

    @property({ type: String, reflect: true })
    public target: string | null = null

    @property({ type: String, reflect: true, attribute: 'navigation-scope' })
    public navigationScope: string = ''

    @property({ type: Boolean, reflect: true })
    public checked: boolean = false

    @property({ type: Boolean, reflect: true, attribute: 'default-checked' })
    public defaultChecked: boolean = false

    @property({ type: Boolean, reflect: true })
    public required: boolean = false

    /**
     * horizontal is not available for bar-xr and rail-xr types.
     */
    @property({ type: String, reflect: true })
    public variant: NavigationTabVariant = 'bar-vertical'

    @state()
    private badgeExiting: boolean = false

    private lastNonEmptyBadge: string = ''
    private exitingBadgeWasDot: boolean = false

    @query('.container')
    protected readonly rootElement!: HTMLElement | null

    @query('.indicator')
    private indicatorElement!: HTMLElement | null

    @query('.icon-container')
    private iconContainerElement!: HTMLElement | null

    @query('.icon.default-icon')
    private defaultIconElement!: HTMLElement | null

    @query('.icon.active-icon')
    private activeIconElement!: HTMLElement | null

    @query('.icon.inactive-icon')
    private inactiveIconElement!: HTMLElement | null

    @query('.label.in-icon-container')
    private inLabelElement!: HTMLElement | null

    @query('.label.out-icon-container')
    private outLabelElement!: HTMLElement | null

    @query('.badge-label')
    private badgeLabelElement!: HTMLElement | null

    public override get rippleControl(): HTMLElement | null {
        return this.rootElement
    }
    public override get focusRingControl(): HTMLElement | null {
        return this.rootElement
    }
    public override focusRingInward: boolean = true

    public override focus(): void {
        this.rootElement?.focus()
    }

    public override blur(): void {
        this.rootElement?.blur()
    }

    public override click(): void {
        this.rootElement?.click()
    }

    private readonly tabId: string = createNavigationTabId()
    private unsubscribeScope: (() => void) | null = null
    private pendingUserTrigger: NavigationEventTrigger | null = null
    private checkedBeforeControllerSelection: boolean = false
    private selectionHandledByController: boolean = false
    private suppressCheckedUpdatePublish: boolean = false
    private labelObserver: MutationObserver | null = null
    private autoAdoptedLabel: string = ''
    private readonly activeAnimations = new Set<Animation>()
    private pendingMotionSnapshot: INavigationTabMotionSnapshot | null = null

    private readonly selectionController = new SelectionController(this, {
        multiple: false,
        canCancel: false,
        preventSelectionDuringInitialFocus: true,
        preventSelectionDuringSwitching: true,
        dispatchNavigationClick: false,
        dispatchInputChangeEvents: false,
        // The inner native `<a>`/`<button>` is the only focusable control;
        // the host is a wrapper and must not be a Tab stop of its own.
        getFocusableElement: (host) =>
            (host as MDCNavigationTab).rootElement ?? host,
        // Scope group discovery to the nearest navigation container so that
        // independent containers reusing the same `name` do not share arrow-key
        // navigation, mutex enforcement, or roving tabindex. A tab outside any
        // container returns null and only manages itself.
        getGroupRoot: (host) => host.closest(
            'mdc-navigation-bar, mdc-navigation-rail, mdc-navigation-drawer',
        ),
        onBeforeSelect: () => {
            this.selectionHandledByController = true
            this.checkedBeforeControllerSelection = this.checked
        },
        onAfterSelected: () => {
            const changed = this.checkedBeforeControllerSelection !== this.checked
            this.handleControllerSelection(changed)
        },
    })

    constructor() {
        super()
        if (isServer) return

        // Navigation destinations are exposed through the inner native
        // `<a>`/`<button>`, not through an ARIA `tab` role on the host. The
        // host stays a form-associated custom element without an explicit
        // role, so no `tablist`/`tab` pattern is implied.
        this.addEventListener('click', this.handleHostClick)
        this.addEventListener('pointerdown', this.handlePointerDownCapture, { capture: true })
        this.addEventListener('keydown', this.handleKeyDownCapture, { capture: true })
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (isServer) return

        // Apply the `default-checked` attribute as the initial `checked`
        // state, mirroring native HTML `defaultChecked` semantics. Runs
        // before `formStateRestoreCallback` so a restored form value can
        // still override the default.
        if (this.hasAttribute('default-checked') || this.defaultChecked) {
            this.checked = true
        }

        // Only direct text nodes name the tab. A slotted
        // `<mdc-icon>settings</mdc-icon>` carries the icon name as text and
        // must not turn an icon-only destination into a labelled one.
        if (!this.label) {
            const directLabel = readDirectLabel(this.childNodes)
            if (directLabel) {
                this.autoAdoptedLabel = directLabel
                this.label = directLabel
            }
        }

        // An icon-only tab may rely on an author-supplied `aria-label`, so an
        // empty label must not clear it or create an empty attribute.
        if (this.label.length > 0) {
            this.setAttribute('aria-label', this.label)
        }

        this.subscribeScope()
        this.observeDirectLabel()
    }

    public override disconnectedCallback(): void {
        this.cancelActiveAnimations()
        this.labelObserver?.disconnect()
        this.labelObserver = null
        this.unsubscribeScope?.()
        this.unsubscribeScope = null
        super.disconnectedCallback()
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)

        if (!ValidTabVariants.has(this.variant)) {
            throw new Error(`[mdc-navigation-tab] Unsupported variant "${String(this.variant)}".`)
        }

        if (this.hasUpdated && !isServer) {
            const checkedChanged = changedProperties.has('checked')
            const variantChanged = changedProperties.has('variant')
            const disabledChanged = changedProperties.has('disabled')
            const badgeChanged = changedProperties.has('badge') || changedProperties.has('badgeDot')

            if (badgeChanged) {
                const hasBadge = Boolean(this.badge) || this.badgeDot
                const prevBadgeValue = changedProperties.has('badge')
                    ? (changedProperties.get('badge') ?? '')
                    : this.badge
                const prevDotValue = changedProperties.has('badgeDot')
                    ? Boolean(changedProperties.get('badgeDot'))
                    : this.badgeDot
                const prevHadBadge = Boolean(prevBadgeValue) || prevDotValue

                if (hasBadge) {
                    this.lastNonEmptyBadge = this.badge
                    this.exitingBadgeWasDot = !this.badge && this.badgeDot
                    this.badgeExiting = false
                } else if (prevHadBadge && !isReducedMotion()) {
                    this.lastNonEmptyBadge = prevBadgeValue
                    this.exitingBadgeWasDot = !prevBadgeValue && prevDotValue
                    this.badgeExiting = true
                } else {
                    this.badgeExiting = false
                    this.exitingBadgeWasDot = false
                }
            }

            if (checkedChanged || variantChanged || disabledChanged || badgeChanged) {
                const prevChecked = checkedChanged ? Boolean(changedProperties.get('checked')) : this.checked
                const prevVariant = (variantChanged ? changedProperties.get('variant') : this.variant) ?? this.variant
                const prevDisabled = disabledChanged ? Boolean(changedProperties.get('disabled')) : this.disabled
                const prevBadge = (changedProperties.has('badge') ? changedProperties.get('badge') : this.badge) ?? this.badge
                const prevBadgeDot = changedProperties.has('badgeDot') ? Boolean(changedProperties.get('badgeDot')) : this.badgeDot

                this.pendingMotionSnapshot = captureNavigationTabSnapshot(
                    this.getMotionElements(),
                    {
                        checked        : prevChecked,
                        variant        : prevVariant,
                        disabled       : prevDisabled,
                        badge          : prevBadge,
                        badgeDot       : prevBadgeDot,
                        hasActiveIcon  : this.hasActiveIcon,
                        hasInactiveIcon: this.hasInactiveIcon,
                    },
                    { checkedChanged, variantChanged, disabledChanged, badgeChanged },
                )
            }
        }

        if (changedProperties.has('defaultChecked') && this.defaultChecked) {
            this.checked = true
        }

        if (!isServer && this.isConnected) {
            if (changedProperties.has('navigationScope')) {
                this.subscribeScope()
            } else if (changedProperties.has('value')) {
                this.syncWithScopeState()
            }
        }

        // Before the first render there is no inner control yet, so the
        // controller would fall back to the host and make the wrapper an extra
        // Tab stop. The first render's roving tabindex is applied by the
        // controller's `hostUpdated` once the inner control exists.
        if (changedProperties.has('checked') && this.hasUpdated) {
            this.selectionController.handleCheckedChange()
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)

        if (this.pendingMotionSnapshot && !isServer) {
            const snapshot = this.pendingMotionSnapshot
            this.pendingMotionSnapshot = null
            runNavigationTabTransitions(
                this.activeAnimations,
                this.getMotionElements(),
                {
                    checked        : this.checked,
                    variant        : this.variant,
                    disabled       : this.disabled,
                    badge          : this.badge,
                    badgeDot       : this.badgeDot,
                    hasActiveIcon  : this.hasActiveIcon,
                    hasInactiveIcon: this.hasInactiveIcon,
                },
                snapshot,
                {
                    onBadgeExitComplete: () => {
                        if (!this.badge && !this.badgeDot) {
                            this.badgeExiting = false
                            this.exitingBadgeWasDot = false
                        }
                    },
                },
            )
        }

        if (changedProperties.has('label')) {
            // Mirror a non-empty label into the accessible name. An icon-only
            // tab has no label of its own, so an empty label may only clear a
            // name that was mirrored from the previous label; keep an
            // author-supplied `aria-label`.
            const previousLabel = changedProperties.get('label') ?? ''
            if (this.label.length > 0) {
                this.setAttribute('aria-label', this.label)
            } else if (
                previousLabel.length > 0
                && this.getAttribute('aria-label') === previousLabel
            ) {
                this.removeAttribute('aria-label')
            }
        }

        if (changedProperties.has('checked')) {
            this.handleCheckedMutation()
        }
    }

    public override [GetFormValue]() {
        return this.checked ? this.value : null
    }

    public override [GetFormState]() {
        return String(this.checked)
    }

    public override formResetCallback(): void {
        this.checked = this.hasAttribute('default-checked')
    }

    public override formStateRestoreCallback(state: string | null): void {
        this.checked = state === 'true'
    }

    public override [CreateValidator]() {
        return new RadioValidator(() => {
            if (!this.selectionController) {
                return [this] as [MDCNavigationTab]
            }
            return this.selectionController.controls as [MDCNavigationTab, ...MDCNavigationTab[]]
        })
    }

    public override [GetValidityAnchor]() {
        return this.rootElement ?? this
    }

    @state()
    protected hasDefaultIcon: boolean = false

    @state()
    protected hasActiveIcon: boolean = false

    @state()
    protected hasInactiveIcon: boolean = false

    @state()
    protected hasBadgeSlot: boolean = false

    protected getRenderClasses() {
        const isDot = !this.badge && (this.badgeDot || (this.badgeExiting && this.exitingBadgeWasDot))
        return ({
            'container': true,
            [this.variant]: true,
            'has-default-icon': this.hasDefaultIcon,
            'has-active-icon': this.hasActiveIcon,
            'has-inactive-icon': this.hasInactiveIcon,
            'has-badge': Boolean(this.badge) || this.badgeDot || this.badgeExiting || this.hasBadgeSlot,
            'has-badge-dot': isDot,
            'disabled': this.disabled,
        })
    }

    protected override render(): TemplateResult {
        const classes = classMap(this.getRenderClasses())
        // A navigation tab is a navigation destination, not an ARIA tab. The
        // inner native `<a>`/`<button>` is the accessible control: it carries
        // the name (an author `aria-label` for icon-only tabs, otherwise the
        // label), marks the selected destination with `aria-current="page"`,
        // and owns the roving tab stop within its selection group. No
        // `tablist`/`tab`/`aria-selected` relationship is implied.
        const accessibleLabel = this.getAttribute('aria-label') || this.label || nothing
        const content = html`
            <div aria-hidden="true" class="indicator"></div>
            <div aria-hidden="true" class="ripple-layer">
                ${this.renderRipple()}
            </div>

            <div class="icon-container">
                <span class="icon default-icon">
                    <slot name="icon" @slotchange=${this.handleDefaultIconSlotChange}></slot>
                </span>
                <span class="icon inactive-icon">
                    <slot name="inactive-icon" @slotchange=${this.handleInactiveIconSlotChange}></slot>
                </span>
                <span class="icon active-icon">
                    <slot name="active-icon" @slotchange=${this.handleActiveIconSlotChange}></slot>
                </span>
                <div class="label in-icon-container">${this.label}</div>
            </div>
            <div class="label out-icon-container">${this.label}</div>
            <div class="badge-container">${this.renderBadgeSlot()}</div>
            ${this.renderFocusRing()}
        `

        if (this.href) {
            return html`
                <a
                    class="${classes}"
                    href=${this.href}
                    target=${this.target || nothing}
                    aria-label=${accessibleLabel}
                    aria-current=${this.checked ? 'page' : nothing}
                    aria-disabled=${this.disabled ? 'true' : nothing}
                    @click=${this.handleClick}
                >
                    ${content}
                </a>
            `
        }

        return html`
            <button
                type="button"
                class="${classes}"
                ?disabled=${this.disabled}
                aria-label=${accessibleLabel}
                aria-current=${this.checked ? 'page' : nothing}
                aria-disabled=${this.disabled ? 'true' : nothing}
                @click=${this.handleClick}
            >
                ${content}
            </button>
        `
    }

    protected renderBadgeSlot() {
        const hasTextBadge = Boolean(this.badge)
        const isDot = !hasTextBadge && (this.badgeDot || (this.badgeExiting && this.exitingBadgeWasDot))
        const badgeText = this.badge || (this.badgeExiting && !this.exitingBadgeWasDot ? this.lastNonEmptyBadge : '')
        const showInternalBadge = Boolean(badgeText) || isDot
        return html`
            <slot name="badge" @slotchange=${this.handleBadgeSlotChange}>
                ${showInternalBadge
                    ? html`<span class="badge-label ${isDot ? 'dot' : ''} ${this.badgeExiting ? 'exiting' : ''}">${badgeText}</span>`
                    : nothing}
            </slot>
        `
    }

    protected handleBadgeSlotChange(e: Event): void {
        this.hasBadgeSlot = (e.target as HTMLSlotElement).assignedElements({ flatten: true }).length > 0
    }

    protected handleDefaultIconSlotChange(e: Event): void {
        this.hasDefaultIcon = (e.target as HTMLSlotElement).assignedElements({ flatten: true }).length > 0
    }

    protected handleActiveIconSlotChange(e: Event): void {
        this.hasActiveIcon = (e.target as HTMLSlotElement).assignedElements({ flatten: true }).length > 0
    }

    protected handleInactiveIconSlotChange(e: Event): void {
        this.hasInactiveIcon = (e.target as HTMLSlotElement).assignedElements({ flatten: true }).length > 0
    }

    private readonly handleHostClick = (event: MouseEvent): void => {
        if (this.disabled) {
            event.preventDefault()
            event.stopImmediatePropagation()
            return
        }
        if (!isActivationClick(event) || !this.rootElement) {
            return
        }
        this.rootElement.click()
    }

    private readonly handleClick = (event: MouseEvent): void => {
        if (this.disabled) {
            event.preventDefault()
            event.stopImmediatePropagation()
            return
        }
    }

    private readonly handlePointerDownCapture = () => {
        if (this.disabled) return
        this.pendingUserTrigger = 'pointer'
    }

    private readonly handleKeyDownCapture = (event: KeyboardEvent) => {
        if (this.disabled) return
        if (!KeyboardSelectionKeys.has(event.key)) return

        // Activate through the inner control exactly once; the selection
        // controller would otherwise toggle on keydown and again on the
        // forwarded click.
        event.preventDefault()
        event.stopImmediatePropagation()
        if (event.repeat) return

        this.pendingUserTrigger = 'keyboard'
        this.rootElement?.click()
    }

    // Apply store mutations from other tabs/containers in the same scope.
    private readonly handleScopeMutation = (mutation: NavigationScopeMutation) => {
        if (mutation.originId === this.tabId) return

        if (mutation.activeValue === null) {
            if (this.checked) {
                this.suppressCheckedUpdatePublish = true
                this.checked = false
            }
            return
        }

        const shouldActivate = mutation.activeValue === this.value

        if (this.checked !== shouldActivate) {
            this.suppressCheckedUpdatePublish = true
            this.checked = shouldActivate
        }
    }

    private handleControllerSelection(changed: boolean): void {
        const trigger = this.pendingUserTrigger ?? 'programmatic'
        this.pendingUserTrigger = null

        if (this.checked && !this.disabled && this.normalizedScope) {
            GlobalNavigationStateStore.setActive(this.normalizedScope, this.value, {
                source: 'user',
                trigger,
                originId: this.tabId,
            })
        }

        if (!changed) {
            this.selectionHandledByController = false
        }
    }

    // Publish programmatic checked updates as external mutations.
    private handleCheckedMutation(): void {
        if (this.selectionHandledByController) {
            this.selectionHandledByController = false
            return
        }

        if (this.suppressCheckedUpdatePublish) {
            this.suppressCheckedUpdatePublish = false
            return
        }

        if (!this.checked || this.disabled || !this.normalizedScope) {
            return
        }

        GlobalNavigationStateStore.setActive(this.normalizedScope, this.value, {
            source: 'external',
            trigger: 'programmatic',
            originId: this.tabId,
        })
    }

    private subscribeScope(): void {
        this.unsubscribeScope?.()
        this.unsubscribeScope = null
        if (!this.normalizedScope) return

        this.unsubscribeScope = GlobalNavigationStateStore.subscribe(this.normalizedScope, this.handleScopeMutation)
        this.syncWithScopeState()
    }

    /**
     * Keeps an auto-adopted label in sync with the tab's direct text content.
     *
     * `subtree` is required to observe in-place text edits (`node.data = ...`,
     * how Lit updates interpolations); without it `characterData` never fires
     * for a child text node. The callback filters those records down to the
     * direct children, so mutations inside a slotted icon are ignored. Once the
     * author assigns `label` explicitly, the observer stops for good.
     */
    private observeDirectLabel(): void {
        this.labelObserver?.disconnect()
        this.labelObserver = new MutationObserver((records) => {
            if (!records.some((record) => this.isDirectLabelMutation(record))) {
                return
            }

            const next = readDirectLabel(this.childNodes)
            if (this.label !== this.autoAdoptedLabel) {
                // Author has taken over the label; stop auto-updating.
                this.labelObserver?.disconnect()
                this.labelObserver = null
                return
            }

            if (next !== this.autoAdoptedLabel) {
                this.autoAdoptedLabel = next
                this.label = next
            }
        })
        this.labelObserver.observe(this, {
            childList: true,
            characterData: true,
            subtree: true,
        })
    }

    private isDirectLabelMutation(record: MutationRecord): boolean {
        if (record.type === 'childList') {
            return record.target === this
        }
        return record.target.parentNode === this
    }

    private syncWithScopeState(): void {
        if (!this.normalizedScope) return

        const activeValue = GlobalNavigationStateStore.getActive(this.normalizedScope)

        if (activeValue === null) {
            if (this.checked) {
                GlobalNavigationStateStore.setActive(this.normalizedScope, this.value, {
                    source: 'external',
                    trigger: 'programmatic',
                    originId: this.tabId,
                })
            }
            return
        }

        const shouldBeChecked = activeValue === this.value
        if (this.checked === shouldBeChecked) return

        this.suppressCheckedUpdatePublish = true
        this.checked = shouldBeChecked
    }

    private get normalizedScope(): string {
        return this.navigationScope?.trim() ?? ''
    }

    protected getMotionElements(): INavigationTabMotionElements {
        return {
            container    : this.rootElement,
            indicator    : this.indicatorElement,
            iconContainer: this.iconContainerElement,
            defaultIcon  : this.defaultIconElement,
            activeIcon   : this.activeIconElement,
            inactiveIcon : this.inactiveIconElement,
            inLabel      : this.inLabelElement,
            outLabel     : this.outLabelElement,
            badgeLabel   : this.badgeLabelElement,
        }
    }

    private cancelActiveAnimations(): void {
        for (const anim of this.activeAnimations) {
            anim.cancel()
        }
        this.activeAnimations.clear()
        this.pendingMotionSnapshot = null
    }
}
