/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, type TemplateResult } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { internals, mixinElementInternals } from '../../utils/behaviors/element-internals'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { SelectionController } from '../../utils/controller/selection-controller'
import { isActivationClick } from '../../utils/event/form-label-activation'

const SChecked = Symbol('active')

export type TNavigationTabDirection = 'vertical' | 'horizonal'

/**
 *
 * Our design wish is: through this navigation-tab component, it can be used in bar, rail, and xr style bar and rail.
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://www.figma.com/design/4GM7ohCF2Qtjzs7Fra6jlp/Material-3-Design-Kit--Community-?node-id=55141-14251&p=f&t=Lo93bap9LHFqZ0Q1-0
 *
 * @todo
 * XR
 */
export abstract class BaseNavigationTab extends composeMixin(
    mixinElementInternals
)(LitElement) {

    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    /**
     * In XR mode, only 'vertical' is valid.
     */
    // @property({ type: String })
    // public direction: TNavigationDirection = 'vertical'

    /**
     * In design principle, only vertical navigation-rail tabs are allowed to hide the label.
     */
    // @property({ type: Boolean, attribute: 'hide-label' })
    // public hideLabel: boolean = false

    /**
     * To distinguish between tabs of different navigations. Should be managed by navigation components.
     */
    @property({ type: String, noAccessor: true })
    public get name() {
        return this.getAttribute('name') ?? ''
    }
    public set name(name: string) {
        this.setAttribute('name', name)
    }

    @property({ type: Boolean, attribute: 'checked', noAccessor: true })
    public get checked() {
        return this[SChecked]
    }
    public set checked(value: boolean) {
        if(value === this[SChecked]) {
            return
        }
        const oldValue = this[SChecked]
        this[SChecked] = value
        this.requestUpdate('checked', oldValue)
        this.selectionController.handleCheckedChange()
    }

    @state()
    protected hasLabel: boolean = false
    @state()
    protected hasActiveIcon: boolean = false
    @state()
    protected hasInactiveIcon: boolean = false
    @state()
    protected hasBadge: boolean = false

    @query('button')
    private buttonElement!: HTMLButtonElement | null

    private [SChecked]: boolean = false
    private readonly selectionController = new SelectionController(this)

    constructor() {
        super()
        if(isServer) {
            return
        }
        this.addController(this.selectionController)
        this[internals].role = 'tab'
        this.addEventListener('click', this.handleClick.bind(this))
        this.addEventListener('keydown', this.handleKeydown.bind(this))
    }

    protected override render(): TemplateResult {
        return html`
            <button id="button" class=${classMap(this.getRenderClasses())}>
                ${this.renderLabel()}
                ${this.renderIcon()}
                ${this.renderIndicator()}

                <mdc-focus-ring inward for="button" part="focus-ring"></mdc-focus-ring>
            </button>
        `
    }

    protected renderIndicator() {
        return html`
            <span class="indicator">
                <span class="background"></span>
                <mdc-ripple for="button" part="ripple"></mdc-ripple>
            </span>
        `
    }

    protected renderLabel() {
        return html`
            <span class="label">
                <slot @slotchange=${this.handleLabelSlotChange}></slot>
            </span>
        `
    }

    protected renderIcon() {
        return html`
            <span class="icon active-icon">
                <slot name="active-icon" @slotchange=${this.handleActiveIconSlotChange}></slot>
            </span>
            <span class="icon inactive-icon">
                <slot name="inactive-icon" @slotchange=${this.handleInactiveIconSlotChange}></slot>
            </span>
        `
    }

    protected renderBadge() {
        return html`
            <span class="badge">
                <slot name="badge" @slotchange=${this.handleBadgeSlotChange}></slot>
            </span>
        `
    }

    protected getRenderClasses() {
        return ({
            'has-label': this.hasLabel,
            'has-active-icon': this.hasActiveIcon,
            'has-inactive-icon': this.hasInactiveIcon,
            'has-badge': this.hasBadge,
            'active': this.checked,
            'inactive': !this.checked,
        })
    }

    private async handleClick(e: Event) {
        if(!this.buttonElement) {
            return
        }
        await 0
        if (e.defaultPrevented) {
            return
        }
        if (isActivationClick(e)) {
            this.focus()
            // return
        }
        this.checked = true
        this.dispatchEvent(new Event('change', { bubbles: true }))
        this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }))

    }

    private async handleKeydown(event: KeyboardEvent) {
        // allow event to propagate to user code after a microtask.
        await 0
        // if (!['Enter', 'Space'].includes(event.code) || event.defaultPrevented) {
        //     return
        // }
        // this.click()
    }

    private handleLabelSlotChange(event: Event) {
        this.hasLabel = (event.target as HTMLSlotElement).assignedElements().length > 0
    }
    private handleActiveIconSlotChange(event: Event) {
        this.hasLabel = (event.target as HTMLSlotElement).assignedElements().length > 0
    }
    private handleInactiveIconSlotChange(event: Event) {
        this.hasInactiveIcon = (event.target as HTMLSlotElement).assignedElements().length > 0
    }
    private handleBadgeSlotChange(event: Event) {
        this.hasBadge = (event.target as HTMLSlotElement).assignedElements().length > 0
    }
}
