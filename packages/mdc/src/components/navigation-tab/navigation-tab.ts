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
import type { INavigationTab, NavigationTabVariant } from './navigation-tab.interface'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { mixinRippleOptions } from '../ripple/ripple-options.mixin'
import { mixinFocusRingOptions } from '../focus-ring/focus-ring-options.mixin'
import { mixinElementInternals } from '../../utils/behaviors/element-internals'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { createValidator, getValidityAnchor, mixinConstraintValidation } from '../../utils/behaviors/constraint-validation'
import { getFormState, getFormValue, mixinFormAssociated } from '../../utils/form/form-associated'
import { RadioValidator } from '../../utils/behaviors/validators/radio-validator'
import { NavigationTabStyles } from './navigation-tab.style'
import { classMap } from 'lit/directives/class-map.js'
import { OpacityTransitionController } from '../../utils/controller/opacity-transition-controller'
import { MeasuredDimensionController } from '../../utils/controller/measured-dimension-controller'
import { isActivationClick } from '../../utils/event/form-label-activation'
import { readDirectLabel } from './internal/read-direct-label'

const KEYBOARD_SELECTION_KEYS = new Set([' ', 'Enter', 'Spacebar'])

function createNavigationTabId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return `mdc-navigation-tab-${Math.random().toString(36).slice(2)}`
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

    @query('.container')
    protected readonly rootElement!: HTMLElement | null

    @query('.indicator')
    private indicatorElement!: HTMLElement | null

    @query('.label')
    private labelElement!: HTMLLabelElement

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

    private readonly selectionController = new SelectionController(this, {
        multiple: false,
        canCancel: false,
        preventSelectionDuringInitialFocus: true,
        preventSelectionDuringSwitching: true,
        dispatchNavigationClick: false,
        dispatchInputChangeEvents: false,
        getFocusableElement: (host) => host,
        onBeforeSelect: () => {
            this.selectionHandledByController = true
            this.checkedBeforeControllerSelection = this.checked
        },
        onAfterSelected: () => {
            const changed = this.checkedBeforeControllerSelection !== this.checked
            this.handleControllerSelection(changed)
        },
    })

    private readonly opacityController = new OpacityTransitionController(this, {
        target:  () => this.labelElement
    })

    private readonly widthController = new MeasuredDimensionController(this, {
        target: () => this.labelElement
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

        // Custom element constructors must not set attributes, so the initial
        // roving `tabindex` is applied once the element connects. Never
        // override a `tabindex` the author set explicitly.
        if (!this.hasAttribute('tabindex')) {
            this.tabIndex = 0
        }

        // Only direct text nodes name the tab. A slotted
        // `<mdc-icon>settings</mdc-icon>` carries the icon name as text and
        // must not turn an icon-only destination into a labelled one.
        if (!this.label) {
            const directLabel = readDirectLabel(this.childNodes)
            if (directLabel) {
                this.label = directLabel
            }
        }

        // An icon-only tab may rely on an author-supplied `aria-label`, so an
        // empty label must not clear it or create an empty attribute.
        if (this.label.length > 0) {
            this.setAttribute('aria-label', this.label)
        }

        this.subscribeScope()
    }

    public override disconnectedCallback(): void {
        this.unsubscribeScope?.()
        this.unsubscribeScope = null
        super.disconnectedCallback()
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        if (changedProperties.has('checked')) {
            this.selectionController.handleCheckedChange()
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)

        if (changedProperties.has('defaultChecked') && this.defaultChecked) {
            this.checked = true
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

        if (changedProperties.has('navigationScope') && this.isConnected) {
            this.subscribeScope()
        }

        if (changedProperties.has('value') && this.isConnected) {
            this.syncWithScopeState()
        }
    }

    public override [getFormValue]() {
        return this.checked ? this.value : null
    }

    public override [getFormState]() {
        return String(this.checked)
    }

    public override formResetCallback(): void {
        this.checked = this.hasAttribute('default-checked')
    }

    public override formStateRestoreCallback(state: string | null): void {
        this.checked = state === 'true'
    }

    public override [createValidator]() {
        return new RadioValidator(() => {
            if (!this.selectionController) {
                return [this] as [MDCNavigationTab]
            }
            return this.selectionController.controls as [MDCNavigationTab, ...MDCNavigationTab[]]
        })
    }

    public override [getValidityAnchor]() {
        return this.rootElement ?? this
    }

    @state()
    protected hasDefaultIcon: boolean = false

    @state()
    protected hasActiveIcon: boolean = false

    @state()
    protected hasInactiveIcon: boolean = false

    protected getRenderClasses() {
        return ({
            'container': true,
            [this.variant]: true,
            'has-default-icon': this.hasDefaultIcon,
            'has-active-icon': this.hasActiveIcon,
            'has-inactive-icon': this.hasInactiveIcon,
            'disabled': this.disabled,
        })
    }

    protected override render(): TemplateResult {
        const classes = classMap(this.getRenderClasses())
        // A navigation tab is a navigation destination, not an ARIA tab. The
        // inner native `<a>`/`<button>` is the accessible control: it carries
        // the name (an author `aria-label` for icon-only tabs, otherwise the
        // label), marks the selected destination with `aria-current="page"`,
        // and stays out of the tab order so it only serves as the focus
        // delegation target. No `tablist`/`tab`/`aria-selected` relationship is
        // implied.
        const accessibleLabel = this.getAttribute('aria-label') || this.label || nothing
        const content = html`
            <div aria-hidden="true" class="indicator">
                <div aria-hidden="true" class="ripple-layer">
                    ${this.renderRipple()}
                </div>
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
                    tabindex="-1"
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
                tabindex="-1"
                @click=${this.handleClick}
            >
                ${content}
            </button>
        `
    }

    protected renderBadgeSlot() {
        return html`
            <slot name="badge">
                ${this.badge ? html`<span class="badge-label">${this.badge}</span>` : nothing}
            </slot>
        `
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
        if (!KEYBOARD_SELECTION_KEYS.has(event.key)) return

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
}
