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
 *   const tab = document.querySelector('mdc-navigation-tab')
 *   tab?.addEventListener('change', (event) => {
 *     console.log(event.detail.value, event.detail.source, event.detail.trigger)
 *   })
 * </script>
 * ```
 */
import { html, isServer, LitElement, type PropertyValues } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { SelectionController } from '../../utils/controller/selection-controller'
import {
    GlobalNavigationStateStore,
    type NavigationEventSource,
    type NavigationEventTrigger,
    type NavigationScopeMutation,
} from '../../utils/navigation/navigation-state-store'
import type { INavigationTab, NavigationTabVariant } from './navigation-tab.interface'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { mixinRippleOptions } from '../ripple/mixin-ripple-options'
import { mixinFocusRingOptions } from '../focus-ring/mixin-focus-ring-options'
import { mixinElementInternals } from '../../utils/behaviors/element-internals'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { NavigationTabStyles } from './navigation-tab.style'
import { classMap } from 'lit/directives/class-map.js'
import { OpacityTransitionController } from '../../utils/controller/opacity-transition-controller'
import { MeasuredDimensionController } from '../../utils/controller/measured-dimension-controller'

const KEYBOARD_SELECTION_KEYS = new Set([' ', 'Enter', 'Spacebar'])

function createNavigationTabId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return `mdc-navigation-tab-${Math.random().toString(36).slice(2)}`
}

export interface NavigationTabEventDetail {
    /** Business navigation key for this tab, used for cross-container sync. */
    value: string
    /** Whether the event originated from user interaction or external sync. */
    source: NavigationEventSource
    /** Interaction trigger that caused this event. */
    trigger: NavigationEventTrigger
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
    mixinElementInternals,
    mixinDelegatesAria,
    mixinRippleOptions,
    mixinFocusRingOptions
)(LitElement) implements INavigationTab {

    static override shadowRootOptions = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: true,
    }

    static override styles = NavigationTabStyles

    @property({ type: String, reflect: true })
    public label: string = ''

    @property({ type: String, reflect: true })
    public name: string = ''

    @property({ type: String })
    public value: string = ''

    @property({ type: String })
    public href: string | null = null

    @property({ type: String, reflect: true, attribute: 'navigation-scope' })
    public navigationScope: string = 'global'

    @property({ type: Boolean, reflect: true })
    public checked: boolean = false

    @property({ type: Boolean, reflect: true })
    public disabled: boolean = false

    /**
     * horizontal is not available for bar-xr and rail-xr types.
     */
    @property({ type: String, reflect: true })
    public variant: NavigationTabVariant = 'bar-vertical'

    @query('#touch-target')
    private inputElement!: HTMLInputElement

    @query('.indicator')
    private indicatorElement!: HTMLElement | null

    @query('.label')
    private labelElement!: HTMLLabelElement

    public override get rippleControl(): HTMLElement | null {
        // Use the host as control so pointer clicks and synthetic keyboard clicks
        // both trigger ripple, while the ripple visual remains clipped by indicator.
        return this.inputElement
    }
    public override get focusRingControl() { return this.inputElement }
    public override focusRingInward: boolean = true

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

        this.role = 'tab'
        this.tabIndex = 0
        this.setAttribute('aria-label', this.label)
        this.setAttribute('aria-selected', String(this.checked))
        this.setAttribute('aria-disabled', String(this.disabled))

        this.addEventListener('pointerdown', this.handlePointerDownCapture, { capture: true })
        this.addEventListener('keydown', this.handleKeyDownCapture, { capture: true })
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (isServer) return
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

        if (changedProperties.has('checked')) {
            this.setAttribute('aria-selected', String(this.checked))
            this.handleCheckedMutation()
        }

        if (changedProperties.has('disabled')) {
            this.setAttribute('aria-disabled', String(this.disabled))
        }

        if (changedProperties.has('navigationScope') && this.isConnected) {
            this.subscribeScope()
        }

        if (changedProperties.has('value') && this.isConnected) {
            this.syncWithScopeState()
        }
    }

    protected getRenderClasses() {
        return ({
            'container': true,
            [this.variant]: true,
        })
    }

    /**
     * Render logic intentionally uses a native input element to mirror
     * input-like semantics (`name`, `checked`, `disabled`) for the tab control.
     */
    protected override render(): unknown {
        return html`
            <button class="${classMap(this.getRenderClasses())}">
                <div aria-hidden="true" class="indicator">
                    <div aria-hidden="true" class="ripple-layer">
                        ${this.renderRipple()}
                    </div>
                </div>

                <div class="icon-container">
                    <span class="icon inactive-icon">
                        ${this.renderInactiveIconSlot()}
                    </span>
                    <span class="icon active-icon">
                        ${this.renderActiveIconSlot()}
                    </span>
                    <div class="label in-icon-container">${this.label}</div>
                </div>
                <div class="label out-icon-container">${this.label}</div>
                ${this.renderInput()}
                ${this.renderFocusRing()}
            </button>
        `
    }
    protected renderInactiveIconSlot() {
        return html`<slot name="inactive-icon"></slot>`
    }
    protected renderActiveIconSlot() {
        return html`<slot name="active-icon"></slot>`
    }
    protected renderInput() {
        return html`
            <input
                id="touch-target"
                tabindex="-1"
                type="radio"
                name=${this.name}
                .value=${this.value}
                .checked=${this.checked}
                ?disabled=${this.disabled}
                @input=${this.stopNativeInputAndChange}
                @change=${this.stopNativeInputAndChange}
            />
        `
    }

    private readonly handlePointerDownCapture = () => {
        if (this.disabled) return
        this.pendingUserTrigger = 'pointer'
    }

    private readonly handleKeyDownCapture = (event: KeyboardEvent) => {
        if (this.disabled) return
        if (!KEYBOARD_SELECTION_KEYS.has(event.key)) return
        this.pendingUserTrigger = 'keyboard'
    }

    private readonly stopNativeInputAndChange = (event: Event) => {
        event.stopPropagation()
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

        if (!shouldActivate) return

        this.dispatchNavigationInput('external', mutation.trigger)

        if (mutation.changed) {
            this.dispatchNavigationChange('external', mutation.trigger)
        }
    }

    private handleControllerSelection(changed: boolean): void {
        const trigger = this.pendingUserTrigger ?? 'programmatic'
        this.pendingUserTrigger = null

        if (this.checked && !this.disabled) {
            const mutation = GlobalNavigationStateStore.setActive(this.normalizedScope, this.value, {
                source: 'user',
                trigger,
                originId: this.tabId,
            })

            this.dispatchNavigationInput('user', trigger)

            if (mutation.changed) {
                this.dispatchNavigationChange('user', trigger)
            }
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

        if (!this.checked || this.disabled) {
            return
        }

        const mutation = GlobalNavigationStateStore.setActive(this.normalizedScope, this.value, {
            source: 'external',
            trigger: 'programmatic',
            originId: this.tabId,
        })

        this.dispatchNavigationInput('external', 'programmatic')

        if (mutation.changed) {
            this.dispatchNavigationChange('external', 'programmatic')
        }
    }

    private subscribeScope(): void {
        this.unsubscribeScope?.()
        this.unsubscribeScope = GlobalNavigationStateStore.subscribe(this.normalizedScope, this.handleScopeMutation)
        this.syncWithScopeState()
    }

    private syncWithScopeState(): void {
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

    private dispatchNavigationInput(source: NavigationEventSource, trigger: NavigationEventTrigger): void {
        this.dispatchEvent(new CustomEvent<NavigationTabEventDetail>('input', {
            bubbles: true,
            composed: true,
            detail: {
                value: this.value,
                source,
                trigger,
            },
        }))
    }

    private dispatchNavigationChange(source: NavigationEventSource, trigger: NavigationEventTrigger): void {
        this.dispatchEvent(new CustomEvent<NavigationTabEventDetail>('change', {
            bubbles: true,
            composed: true,
            detail: {
                value: this.value,
                source,
                trigger,
            },
        }))
    }

    private get normalizedScope(): string {
        const scope = this.navigationScope.trim()
        return scope.length > 0 ? scope : 'global'
    }
}
