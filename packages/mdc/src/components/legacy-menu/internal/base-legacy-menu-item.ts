/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-legacy-menu-item` — a single MD3 Baseline menu row.
 *
 * Static render plus M4 activation logic: a one-line 48dp shell with leading /
 * content / end zones, `label-large` type, 20dp icons, and a secondary-container
 * selected state. Tri-state `text` / `button` / `link` (`href` forces `link`,
 * links are never disabled), `selected` + `checkable` / `radio`
 * (`menuitemcheckbox` / `menuitemradio` roles with `aria-checked`, otherwise
 * `aria-selected`), `value` / `shortcut` (`aria-keyshortcuts`) / `badge`,
 * `request-activation` + `item-activated` composed events on click and
 * Enter / Space (buttons only; links rely on native Enter-to-click so
 * navigation is never blocked), disabled blocks activation, and
 * `listTabIndex` roving-tabindex support.
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import {
    LEGACY_MENU_REQUEST_ACTIVATION_EVENT,
    type IMDCLegacyMenuItem,
    type IMDCLegacyMenuItemActivatedDetail,
    type IMDCLegacyMenuItemRequestActivationDetail,
    type LegacyMenuItemType,
} from '../legacy-menu.interface'
import { LegacyMenuItemStyles } from '../legacy-menu-item.style'

const VALID_TYPES: readonly string[] = ['text', 'button', 'link']

export abstract class BaseLegacyMenuItem extends composeMixin(
    mixinDelegatesAria,
    mixinRippleOptions,
    mixinFocusRingOptions,
)(LitElement) implements IMDCLegacyMenuItem {

    public static override styles = LegacyMenuItemStyles

    static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }

    /** The interactive role of the item. */
    @property({ type: String, reflect: true })
    public type: LegacyMenuItemType = 'button'

    /** Disables the item. Link items are never disabled. */
    @property({ type: Boolean, reflect: true })
    public disabled = false

    /** The destination URL. Forces `type` to `link` when set. */
    @property({ type: String, reflect: true })
    public href = ''

    /** The target of the link (e.g. `_blank`). */
    @property({ type: String, reflect: true })
    public target = ''

    /** Marks the item as selected (secondary-container highlight). */
    @property({ type: Boolean, reflect: true })
    public selected = false

    /** Renders the item with a checkbox role (`menuitemcheckbox`). */
    @property({ type: Boolean, reflect: true })
    public checkable = false

    /** Renders the item with a radio role (`menuitemradio`). */
    @property({ type: Boolean, reflect: true })
    public radio = false

    /** The selection value reported on activation. */
    @property({ type: String, reflect: true })
    public value = ''

    /** Trailing keyboard-shortcut hint (empty when absent). */
    @property({ type: String, reflect: true })
    public shortcut = ''

    /** Trailing badge text (`null` when absent). */
    @property()
    public badge: string | number | null = null

    /** Roving tabindex value assigned by the parent `mdc-legacy-menu`. */
    @property({ type: Number })
    public listTabIndex = 0

    /** Whether selecting this item keeps the parent menu open. */
    @property({ type: Boolean, attribute: 'keep-open', reflect: true })
    public keepOpen = false

    /** Group name for mutually-exclusive radio items. */
    @property({ type: String, reflect: true })
    public name = ''

    /** Explicit text label of the item. */
    @property({ type: String, reflect: true })
    public label = ''

    /** Custom text used for typeahead matching (defaults to label or textContent). */
    @property({ type: String, attribute: 'typeahead-text' })
    public typeaheadText = ''

    @state()
    protected hasLeading = false

    @state()
    protected hasTrailing = false

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
        if (this.radio) {
            return 'menuitemradio'
        }
        if (this.checkable) {
            return 'menuitemcheckbox'
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
        if (!VALID_TYPES.includes(this.type)) {
            throw new Error(`[mdc-legacy-menu-item] Unsupported type "${String(this.type)}". Menu items support only "text" | "button" | "link".`)
        }
    }

    protected override firstUpdated(changedProperties: PropertyValues<this>): void {
        super.firstUpdated(changedProperties)
        this.handleLeadingSlotChange()
        this.handleTrailingSlotChange()
        this.handleSupportingSlotChange()
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
        const hasEnd = this.hasTrailing || Boolean(this.shortcut) || (this.badge !== null && this.badge !== '')
        return {
            [`type-${this.type}`]: true,
            'disabled': this.isDisabled,
            'selected': this.selected,
            'has-leading': this.hasLeading,
            'has-trailing': this.hasTrailing,
            'has-supporting': this.hasSupporting,
            'has-end': hasEnd,
        }
    }

    /** Render-root classes for the item row (non-host, used with classMap). */
    protected getRenderClasses(): Record<string, boolean> {
        return {
            'container': true,
            [this.type]: true,
            'disabled': this.isDisabled,
            'selected': this.selected,
        }
    }

    protected override render(): TemplateResult {
        const { ariaLabel } = this as AriaMixinStrict
        const labelAttr = ariaLabel || this.label || nothing
        const classes = classMap(this.getRenderClasses())
        const tabIndex = this.isDisabled || !this.isInteractive ? -1 : this.listTabIndex
        const role = this.itemRole
        const isCheckable = this.checkable || this.radio
        const checked = isCheckable ? String(this.selected) : nothing
        const selectedAttr = !isCheckable && this.selected ? 'true' : nothing
        const disabledAttr = this.isDisabled ? 'true' : nothing
        const keyshortcuts = this.shortcut ? this.shortcut : nothing

        if (this.type === 'link') {
            return html`
                <a
                    class="${classes}"
                    role=${role}
                    href=${this.href || nothing}
                    target=${this.target || nothing}
                    aria-label=${labelAttr}
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
                    aria-label=${labelAttr}
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
                aria-label=${labelAttr}
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

    /** The three-part body: leading / content / end. */
    protected renderBody(): TemplateResult {
        return html`
            <div class="item">
                <div class="leading">
                    <slot name="leading" @slotchange=${this.handleLeadingSlotChange}></slot>
                </div>
                <div class="content">
                    <div class="label">
                        <slot>${this.label}</slot>
                    </div>
                    <div class="supporting">
                        <slot name="supporting" @slotchange=${this.handleSupportingSlotChange}></slot>
                    </div>
                </div>
                <div class="end">
                    <slot name="trailing" @slotchange=${this.handleTrailingSlotChange}></slot>
                    ${this.shortcut ? html`<span class="shortcut">${this.shortcut}</span>` : nothing}
                    ${this.badge !== null && this.badge !== '' ? html`<span class="badge">${this.badge}</span>` : nothing}
                </div>
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
        this.hasLeading = (this.assignedLeading?.length ?? 0) > 0
    }

    private readonly handleTrailingSlotChange = (): void => {
        this.hasTrailing = (this.assignedTrailing?.length ?? 0) > 0
    }

    private readonly handleSupportingSlotChange = (): void => {
        this.hasSupporting = (this.assignedSupporting?.length ?? 0) > 0
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
        this.dispatchEvent(new CustomEvent<IMDCLegacyMenuItemRequestActivationDetail>(
            LEGACY_MENU_REQUEST_ACTIVATION_EVENT,
            {
                detail: { item: this },
                bubbles: true,
                composed: true,
            }
        ))
        this.dispatchEvent(new CustomEvent<IMDCLegacyMenuItemActivatedDetail>(
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
