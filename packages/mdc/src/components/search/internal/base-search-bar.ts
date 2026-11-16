/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { live } from 'lit/directives/live.js'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { redispatchEvent } from '../../../utils/event/redispatch-event'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import '../../icon-button/icon-button'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import type { IMDCSearchBar, IMDCSearchView } from '../search.interface'
import { SearchBarStyle } from '../search-bar.style'

/**
 * Internal base class for `mdc-search-bar`.
 */
export abstract class BaseSearchBar extends composeMixin(
    mixinRippleOptions,
    mixinFocusRingOptions
)(LitElement) implements IMDCSearchBar {

    static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    static override styles = SearchBarStyle

    public override focusRingInward: boolean = true
    public override get focusRingControl(): HTMLElement | null { return this.inputElement }
    public override get rippleControl(): HTMLElement | null { return this.inputElement }

    @property({ type: String, attribute: 'supporting-text' })
    public supportingText: string = 'Type here to search'

    @property({ type: Boolean, attribute: 'hide-avatar', reflect: true })
    public hideAvatar: boolean = false

    @property({ type: String })
    public value: string = ''

    @property({ type: String, reflect: true })
    public for: string = ''

    @property({ type: Boolean, reflect: true })
    public disabled: boolean = false

    @state()
    protected hasLeadingIcon: boolean = false

    @state()
    protected hasTrailingIcon: boolean = false

    @state()
    protected hasAvatar: boolean = false

    @state()
    protected viewOpen: boolean = false

    @query('.avatar')
    private avatarElement!: HTMLElement | null

    @query('.input')
    private inputElement!: HTMLInputElement | null

    private searchViewValue: IMDCSearchView | null = null

    public get searchView(): IMDCSearchView | null {
        return this.searchViewValue
    }

    public set searchView(view: IMDCSearchView | null) {
        if (this.searchViewValue === view) {
            return
        }
        const prev = this.searchViewValue
        this.searchViewValue = view
        if (prev && prev.searchBar === this) {
            prev.setupWithSearchBar(null)
        }
        if (view && view.searchBar !== this) {
            view.setupWithSearchBar(this)
        }
        this.viewOpen = Boolean(view?.open)
        this.requestUpdate()
    }

    public syncFromSearchView(value: string, open: boolean): void {
        this.value = value
        this.viewOpen = open
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (!isServer && this.for && !this.searchViewValue) {
            queueMicrotask(() => this.resolveForTarget())
        }
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (!isServer && changedProperties.has('for') && this.for) {
            this.resolveForTarget()
        }
    }

    protected override render(): TemplateResult {
        const isLinked = this.searchViewValue !== null
        return html`
            <div
                role="search"
                class="search ${classMap(this.getRenderClasses())}"
                @click=${this.handleContainerClick}
            >
                <span class="background" aria-hidden="true"></span>
                ${this.disabled ? nothing : this.renderRipple()}
                ${this.renderLeadingIcon()}
                ${this.renderInput(isLinked)}
                ${this.renderTrailingIcon()}
                ${this.renderAvatar()}
                ${this.renderTouchTarget()}
                ${this.disabled ? nothing : this.renderFocusRing()}
            </div>
        `
    }

    protected renderLeadingIcon(): TemplateResult {
        return html`
            <span class="leading-icon icon">
                <slot name="leading-icon" @slotchange=${this.handleLeadingIconSlotChange}></slot>
            </span>
        `
    }

    protected renderTrailingIcon(): TemplateResult {
        return html`
            <span class="trailing-icon icon">
                <slot name="trailing-icon" @slotchange=${this.handleTrailingIconSlotChange}></slot>
            </span>
        `
    }

    protected renderInput(isLinked: boolean): TemplateResult {
        return html`
            <input
                class="input"
                id="input"
                .value=${live(this.value)}
                placeholder=${this.supportingText}
                aria-placeholder=${this.supportingText}
                aria-haspopup=${isLinked ? 'dialog' : nothing}
                aria-expanded=${isLinked ? String(this.viewOpen) : nothing}
                ?readonly=${isLinked}
                ?disabled=${this.disabled}
                @focus=${this.handleInputFocus}
                @input=${this.handleInput}
                @change=${this.handleChange}
                @keydown=${this.handleKeydown}
            />
        `
    }

    protected renderTouchTarget(): TemplateResult {
        return html`<span class="touch-target" aria-hidden="true"></span>`
    }

    protected renderAvatar(): TemplateResult {
        return html`
            <slot name="avatar" @slotchange=${this.handleAvatarSlotChange}>
                ${this.renderDefaultAvatar()}
            </slot>
        `
    }

    protected renderDefaultAvatar(): TemplateResult {
        return html`
            <mdc-icon-button
                class="avatar"
                aria-label="Account"
                ?disabled=${this.disabled}
                @click=${this.handleAvatarClick}
            >
                ${this.renderAvatarIcon()}
            </mdc-icon-button>
        `
    }

    protected renderAvatarIcon(): TemplateResult {
        return html`
            <svg class="avatar-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>
        `
    }

    protected getRenderClasses(): Record<string, boolean> {
        return {
            'has-leading-icon': this.hasLeadingIcon,
            'has-trailing-icon': this.hasTrailingIcon,
            'has-avatar': this.hasAvatar,
            'hide-avatar': this.hideAvatar,
            'is-linked': this.searchViewValue !== null,
            'is-disabled': this.disabled,
        }
    }

    private resolveForTarget(): void {
        if (!this.for || isServer) return
        const root = this.getRootNode()
        const target = root instanceof Document || root instanceof ShadowRoot
            ? root.getElementById(this.for)
            : null
        if (target && 'setupWithSearchBar' in target && typeof (target as IMDCSearchView).setupWithSearchBar === 'function') {
            this.searchView = target as IMDCSearchView
        }
    }

    private handleContainerClick(e: MouseEvent): void {
        if (this.disabled || !this.searchViewValue) return
        const target = e.target as Element | null
        if (target?.closest('.trailing-icon, .avatar, slot[name="avatar"], .leading-icon')) {
            return
        }
        this.searchViewValue.show()
    }

    private handleAvatarClick(e: Event): void {
        e.stopPropagation()
        if (this.disabled) return
        const avatarClickEvent = new CustomEvent('avatar-click', {
            bubbles: true,
            cancelable: false,
            detail: {
                target: this.avatarElement,
                currentTarget: this,
            },
        })
        redispatchEvent(this, avatarClickEvent)
    }

    private handleInputFocus(): void {
        if (!this.focusRingElement || this.disabled) {
            return
        }
        this.focusRingElement.focused = true
    }

    private handleInput(e: Event): void {
        if (this.searchViewValue || this.disabled) return
        this.value = (e.target as HTMLInputElement).value
        e.stopPropagation()
        this.dispatchValueEvent('input')
    }

    private handleChange(e: Event): void {
        if (this.searchViewValue || this.disabled) return
        this.value = (e.target as HTMLInputElement).value
        e.stopPropagation()
        this.dispatchValueEvent('change')
        this.dispatchValueEvent('search')
    }

    private handleKeydown(e: KeyboardEvent): void {
        if (this.disabled) return
        if (this.searchViewValue) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                this.searchViewValue.show()
            }
            return
        }
        if (e.key !== 'Enter' || e.isComposing || e.repeat) {
            return
        }
        this.value = (e.target as HTMLInputElement).value
        this.dispatchValueEvent('search')
    }

    private dispatchValueEvent(type: 'input' | 'change' | 'search'): void {
        this.dispatchEvent(new CustomEvent(type, {
            bubbles: true,
            composed: true,
            detail: {
                value: this.value,
            },
        }))
    }

    private handleLeadingIconSlotChange(e: Event): void {
        this.hasLeadingIcon = (e.target as HTMLSlotElement).assignedElements().length > 0
    }

    private handleTrailingIconSlotChange(e: Event): void {
        this.hasTrailingIcon = (e.target as HTMLSlotElement).assignedElements().length > 0
    }

    private handleAvatarSlotChange(e: Event): void {
        this.hasAvatar = (e.target as HTMLSlotElement).assignedElements().length > 0
    }
}
