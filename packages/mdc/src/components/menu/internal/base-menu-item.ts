/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-menu-item` — a single Material Design 3
 * Expressive menu row (render + activation logic).
 *
 * The item renders one of three native roots depending on `type`:
 *
 * - `link`   → `<a>` (navigates to `href`, forced when `href` is set)
 * - `button` → `<button>` (activates on Enter / Space / click)
 * - `text`   → `<li>` (non-interactive label row)
 *
 * Expressive metrics: 48dp single-line container, 16dp horizontal padding,
 * 4dp corners, label-large label, 20dp leading / trailing icons with a 12dp
 * icon gap. Selected items use the tertiary-container fill with
 * on-tertiary-container content in both color-styles (packet C3); the parent
 * `mdc-menu` propagates its color-style through the reflected `variant`
 * attribute (M4 wires the propagation, static shells accept it directly).
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import '../../badge/badge'
import type {
    IMDCMenuItem,
    IMDCMenuItemActivatedDetail,
    IMDCMenuItemRequestActivationDetail,
    MenuColorStyle,
    MenuItemType,
} from '../menu.interface'
import { MenuItemStyles } from '../menu-item.style'

const ValidVariants: readonly string[] = ['standard', 'vibrant']
const ValidTypes: readonly string[] = ['text', 'button', 'link']

export abstract class BaseMenuItem extends composeMixin(
    mixinDelegatesAria,
    mixinRippleOptions,
    mixinFocusRingOptions
)(LitElement) implements IMDCMenuItem {

    static override styles = MenuItemStyles

    static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }

    /** The interactive role of the item. Defaults to `button`. */
    @property({ type: String, reflect: true })
    public type: MenuItemType = 'button'

    /** Disables the item. Link items are never disabled. */
    @property({ type: Boolean, reflect: true })
    public disabled = false

    /** The destination URL. Forces `type` to `link` when set. */
    @property({ type: String, reflect: true })
    public href = ''

    /** The target of the link (e.g. `_blank`). */
    @property({ type: String, reflect: true })
    public target = ''

    /** Marks the item as selected (M3E tertiary-container highlight). */
    @property({ type: Boolean, reflect: true })
    public selected = false

    /** Whether the item is checkable (menuitemcheckbox role). */
    @property({ type: Boolean, reflect: true })
    public checkable = false

    /** Whether the item is a radio option (menuitemradio role). */
    @property({ type: Boolean, reflect: true })
    public radio = false

    /** Selection value emitted with activation. */
    @property({ type: String })
    public value = ''

    /** Keyboard shortcut hint (aria-keyshortcuts). */
    @property({ type: String })
    public shortcut: string | null = null

    /** Badge text displayed in the trailing slot. */
    @property()
    public badge: string | number | null = null

    /** Roving tabindex value assigned by the parent `mdc-menu`. */
    @property({ type: Number })
    public listTabIndex = 0

    /**
     * Expressive color-style axis inherited from the parent menu.
     * `standard` (default) or `vibrant`.
     */
    @property({ type: String, reflect: true })
    public variant: MenuColorStyle = 'standard'

    /** Set when the `leading` slot is populated. */
    @state()
    protected hasLeading = false
    /** Set when the `trailing` slot is populated. */
    @state()
    protected hasTrailing = false
    /** Set when the `supporting` slot is populated. */
    @state()
    protected hasSupporting = false

    @query('.container')
    protected readonly rootElement!: HTMLElement | null
    @queryAssignedElements({ slot: 'leading', flatten: true })
    private readonly assignedLeading!: HTMLElement[]
    @queryAssignedElements({ slot: 'trailing', flatten: true })
    private readonly assignedTrailing!: HTMLElement[]
    @queryAssignedElements({ slot: 'supporting', flatten: true })
    private readonly assignedSupporting!: HTMLElement[]

    /** Whether the item is interactive (`button` or `link` type). */
    public get isInteractive(): boolean {
        return this.type !== 'text'
    }

    /** Whether the item is disabled (always false for `link` items). */
    public get isDisabled(): boolean {
        return this.disabled && this.type !== 'link'
    }

    /** The ARIA menuitem role for the current flags. */
    public get itemRole(): string {
        if (this.checkable) {
            return 'menuitemcheckbox'
        }
        if (this.radio) {
            return 'menuitemradio'
        }
        return 'menuitem'
    }

    public override get rippleControl(): HTMLElement | null {
        return this.isInteractive ? this.rootElement : null
    }
    public override get focusRingControl(): HTMLElement | null {
        return this.isInteractive ? this.rootElement : null
    }

    public constructor() {
        super()
        if (isServer) {
            return
        }
        this.focusRingInward = true
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (this.href) {
            this.type = 'link'
        }
        if (!ValidTypes.includes(this.type)) {
            throw new Error(`[mdc-menu-item] Unsupported type "${String(this.type)}". Menu items support only "text" | "button" | "link".`)
        }
        if (!ValidVariants.includes(this.variant)) {
            throw new Error(`[mdc-menu-item] Unsupported variant "${String(this.variant)}". Expressive menu items support only "standard" | "vibrant".`)
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        const hostClasses = this.getHostClasses()
        for (const [name, active] of Object.entries(hostClasses)) {
            this.classList.toggle(name, active)
        }
    }

    /** Host-level classes mirroring the reflected state attributes. */
    protected getHostClasses(): Record<string, boolean> {
        return {
            [`type-${this.type}`]: true,
            'disabled': this.isDisabled,
            'selected': this.selected,
        }
    }

    /** Render-root classes for the item row (non-host, used with classMap). */
    protected getRenderClasses(): Record<string, boolean> {
        return {
            'container': true,
            [this.type]: true,
            'disabled': this.isDisabled,
            'selected': this.selected,
            'checkable': this.checkable,
            'radio': this.radio,
            'has-leading': this.hasLeading || ((this.checkable || this.radio) && this.selected),
            'has-trailing': this.hasTrailing || (this.shortcut !== null && this.shortcut !== '') || (this.badge !== null && this.badge !== undefined && this.badge !== ''),
            'has-supporting': this.hasSupporting,
            [`variant-${this.variant}`]: true,
        }
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        const classes = classMap(this.getRenderClasses())
        const tabIndex = this.isDisabled || !this.isInteractive ? -1 : this.listTabIndex
        const role = this.itemRole
        const isCheckable = this.checkable || this.radio
        const checked = isCheckable ? String(this.selected) : nothing
        const selectedAttr = !isCheckable && this.selected ? 'true' : nothing
        const disabledAttr = this.isDisabled ? 'true' : nothing
        const keyshortcuts = this.shortcut || nothing

        if (this.type === 'link') {
            return html`
                <a
                    class="${classes}"
                    role=${role}
                    href=${this.href || nothing}
                    target=${this.target || nothing}
                    aria-label=${ariaLabel || nothing}
                    aria-checked=${checked}
                    aria-selected=${selectedAttr}
                    aria-disabled=${disabledAttr}
                    aria-keyshortcuts=${keyshortcuts}
                    tabindex=${tabIndex}
                    @click=${this.handleActivation}
                    @keydown=${this.handleKeydown}
                    @keyup=${this.handleKeyup}
                >
                    ${this.renderSurface()}
                    ${this.renderBody()}
                    ${this.renderTouchTarget()}
                </a>
            `
        }

        if (this.type === 'button') {
            return html`
                <button
                    class="${classes}"
                    type="button"
                    role=${role}
                    ?disabled=${this.isDisabled}
                    aria-label=${ariaLabel || nothing}
                    aria-checked=${checked}
                    aria-selected=${selectedAttr}
                    aria-disabled=${disabledAttr}
                    aria-keyshortcuts=${keyshortcuts}
                    tabindex=${tabIndex}
                    @click=${this.handleActivation}
                    @keydown=${this.handleKeydown}
                    @keyup=${this.handleKeyup}
                >
                    ${this.renderSurface()}
                    ${this.renderBody()}
                    ${this.renderTouchTarget()}
                </button>
            `
        }

        return html`
            <li
                class="${classes}"
                role=${role}
                tabindex="-1"
                aria-label=${ariaLabel || nothing}
                aria-checked=${checked}
                aria-selected=${selectedAttr}
                aria-keyshortcuts=${keyshortcuts}
            >
                ${this.renderBody()}
                ${this.renderTouchTarget()}
            </li>
        `
    }

    /** Ripple + focus-ring, rendered only on interactive (button / link) roots. */
    protected renderSurface(): TemplateResult {
        return html`
            ${this.renderFocusRing()}
            ${this.renderRipple()}
        `
    }

    /** Leading / content / trailing body of the 48dp expressive row. */
    protected renderBody(): TemplateResult {
        const showDefaultCheck = (this.checkable || this.radio) && this.selected && !this.hasLeading
        return html`
            <div class="item">
                <span class="leading">
                    ${showDefaultCheck
                        ? html`<svg class="check-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.55 18.2 3.65 12.3l1.425-1.425L9.55 15.35l9.175-9.175L20.15 7.6Z"/></svg>`
                        : nothing}
                    <slot name="leading" @slotchange=${this.handleLeadingSlotChange}></slot>
                </span>
                <span class="content">
                    <span class="label"><slot></slot></span>
                    <span class="supporting"><slot name="supporting" @slotchange=${this.handleSupportingSlotChange}></slot></span>
                </span>
                <span class="trailing">
                    <slot name="trailing" @slotchange=${this.handleTrailingSlotChange}></slot>
                    ${this.shortcut !== null && this.shortcut !== '' ? html`<span class="shortcut">${this.shortcut}</span>` : nothing}
                    ${this.badge !== null && this.badge !== undefined && this.badge !== '' ? html`<mdc-badge class="badge" size="large" .value=${this.badge}></mdc-badge>` : nothing}
                </span>
            </div>
        `
    }

    protected renderTouchTarget(): TemplateResult {
        return html`
            <span class="touch-target" aria-hidden="true"></span>
        `
    }

    public override focus(): void {
        this.rootElement?.focus()
    }
    public override click(): void {
        this.rootElement?.click()
    }

    private readonly handleLeadingSlotChange = (): void => {
        this.hasLeading = this.assignedLeading.length > 0
    }
    private readonly handleTrailingSlotChange = (): void => {
        this.hasTrailing = this.assignedTrailing.length > 0
    }
    private readonly handleSupportingSlotChange = (): void => {
        this.hasSupporting = this.assignedSupporting.length > 0
    }

    private readonly handleActivation = (event: Event): void => {
        if (this.isDisabled) {
            event.preventDefault()
            return
        }
        if (!this.isInteractive) {
            return
        }
        if (this.checkable) {
            this.selected = !this.selected
        } else if (this.radio) {
            this.selected = true
        }
        this.dispatchEvent(new CustomEvent<IMDCMenuItemRequestActivationDetail>(
            'request-activation',
            {
                detail: { item: this },
                bubbles: true,
                composed: true,
            }
        ))
        this.dispatchEvent(new CustomEvent<IMDCMenuItemActivatedDetail & { value: string }>(
            'item-activated',
            {
                detail: { item: this, value: this.value },
                bubbles: true,
                composed: true,
            }
        ))
    }

    private readonly handleKeydown = (event: KeyboardEvent): void => {
        if (!this.isInteractive || this.isDisabled) {
            return
        }
        // Links activate natively on Enter (click covers keyboard); an explicit
        // dispatch here would double-fire alongside the native click, and
        // preventing the default would block navigation.
        if (this.type === 'link') {
            return
        }
        if (event.key === 'Enter') {
            event.preventDefault()
            this.handleActivation(event)
        } else if (event.key === ' ') {
            // Prevent scrolling; Space activation follows on keyup (native timing).
            event.preventDefault()
        }
    }

    private readonly handleKeyup = (event: KeyboardEvent): void => {
        if (!this.isInteractive || this.isDisabled) {
            return
        }
        if (this.type !== 'button') {
            return
        }
        if (event.key === ' ') {
            event.preventDefault()
            this.handleActivation(event)
        }
    }
}
