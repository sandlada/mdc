import { html, isServer, LitElement, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { SelectionController } from '../../utils/controller/selection-controller'
import { mixinXROptions } from '../../utils/xr/mixin-xr-options'
import { mixinRippleOptions } from '../ripple/mixin-ripple-options'
import { navigationTabStyle } from './navigation-tab.style'

const SChecked = Symbol('checked')

/**
 * @version
 * Material Design 3 - Expressive
 */
export class MDCBaseNavigationTab extends composeMixin(mixinXROptions, mixinRippleOptions)(LitElement) {

    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    @property({ type: String, reflect: true })
    public type: 'bar' | 'tail' = 'bar'

    @property({ type: String })
    public direction: 'vertical' | 'horizonal' = 'vertical'

    @property({ type: Boolean })
    public round: boolean = false

    private [SChecked]: boolean = false
    private readonly selectionController = new SelectionController(this, { multiple: false })

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

    public constructor() {
        super()
        this.addController(this.selectionController)
        if(isServer) {
            return
        }
    }

    public override getRenderClasses() {
        return ({
            ...super.getRenderClasses(),
            'has-label': this.hasLabel,
            'has-active-icon': this.hasActiveIcon,
            'has-inactive-icon': this.hasInactiveIcon,
            'has-badge': this.hasBadge,
            // 'active': this.checked,
            // 'inactive': !this.checked,
            'vertical': this.direction === 'vertical',
            'horizonal': this.direction !== 'vertical',
            'round': this.round,
            [this.type]: true,
            'container': true,
        })
    }

    protected override render(): TemplateResult {
        return html`
            <button id="button" class=${classMap(this.getRenderClasses())}>
                ${this.renderLabel()}
                ${this.renderIcon()}
                ${this.renderIndicator()}
                ${this.renderFocusRing()}
            </button>
        `
    }

    protected renderBackground() {
        return html`<span class="background" aria-hidden="true"></span>`
    }

    protected renderLabel() {
        return html`<span class="label">
            <slot name="label" @slotchange=${this.handleLabelSlotChange}></slot>
        </span>`
    }

    protected renderFocusRing() {
        return html`<mdc-focus-ring inward for="button" part="focus-ring"></mdc-focus-ring>`
    }

    protected renderBadge() {
        return html`
            <span class="badge">
                <slot name="badge" @slotchange=${this.handleBadgeSlotChange}></slot>
            </span>
        `
    }

    override rippleHtmlFor: string | null = 'button'
    protected renderIndicator() {
        return html`
            <span class="indicator" aria-hidden="true">
                ${this.renderBackground()}
                ${this.renderRipple()}
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

    @state()
    protected hasLabel: boolean = false
    @state()
    protected hasActiveIcon: boolean = false
    @state()
    protected hasInactiveIcon: boolean = false
    @state()
    protected hasBadge: boolean = false

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

@customElement('mdc-navigation-tab')
export class MDCNavigationTab extends MDCBaseNavigationTab {
     static override styles = navigationTabStyle
}
