/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base class for `mdc-on-this-page-item` — an in-page navigation link item.
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import type { IOnThisPageItem } from '../on-this-page.interface'

export const ON_THIS_PAGE_ITEM_REQUEST_ACTIVATE = Symbol('onThisPageItemRequestActivate')

export abstract class BaseOnThisPageItem extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
    mixinRippleOptions,
    mixinFocusRingOptions
)(LitElement) implements IOnThisPageItem {

    static override shadowRootOptions = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: true,
    }

    /** Destination URL/anchor hash, e.g. "#variants" or "variants". */
    @property({ type: String, reflect: true })
    public href: string = ''

    /** Optional anchor target or section ID without leading `#`. */
    @property({ type: String, reflect: true })
    public target: string = ''

    /** Text label for the item. */
    @property({ type: String })
    public label: string = ''

    /** Whether this item is currently active. */
    @property({ type: Boolean, reflect: true })
    public active: boolean = false

    /** Whether this item is disabled. */
    @property({ type: Boolean, reflect: true })
    public disabled: boolean = false

    /** Hierarchy level (1, 2, 3...) for nested headings. */
    @property({ type: Number, reflect: true })
    public level: number = 1

    /** Item index within parent container. */
    @property({ type: Number })
    public index: number = 0

    @query('.item')
    protected readonly itemElement!: HTMLElement | null

    @query('.label')
    protected readonly labelElement!: HTMLElement | null

    public override get rippleControl(): HTMLElement | null {
        return this.disabled ? null : this.itemElement
    }

    public override get focusRingControl(): HTMLElement | null {
        return this.disabled ? null : this.itemElement
    }

    public constructor() {
        super()
        if (isServer) return
        this.focusRingInward = true
    }

    /** Resolves the clean target ID for scrolling. */
    public get targetId(): string {
        if (this.target) return this.target
        if (this.href) {
            const hashIndex = this.href.indexOf('#')
            if (hashIndex !== -1) {
                return decodeURIComponent(this.href.slice(hashIndex + 1))
            }
            return this.href
        }
        return ''
    }

    /** Returns the DOMRect of the item container element. */
    public getItemBounds(): DOMRect | null {
        return this.itemElement?.getBoundingClientRect() ?? this.getBoundingClientRect()
    }

    /** Returns the DOMRect of the text label element inside the item. */
    public getLabelBounds(): DOMRect | null {
        return this.labelElement?.getBoundingClientRect() ?? this.getItemBounds()
    }

    protected getRenderClasses() {
        return {
            'item': true,
            'active': this.active,
            'disabled': this.disabled,
            [`level-${this.level}`]: this.level > 1,
        }
    }

    protected override render(): TemplateResult {
        const resolvedHref = this.href ? (this.href.startsWith('#') ? this.href : `#${this.href}`) : undefined

        return html`
            <a
                class="${classMap(this.getRenderClasses())}"
                href=${resolvedHref ?? nothing}
                role="link"
                aria-current=${this.active ? 'true' : nothing}
                aria-disabled=${this.disabled ? 'true' : nothing}
                tabindex=${this.disabled ? -1 : 0}
                @click=${this.handleClick}
                @keydown=${this.handleKeyDown}
            >
                ${this.renderFocusRing()}
                ${this.renderRipple()}
                <span class="label" part="label">
                    <slot>${this.label}</slot>
                </span>
            </a>
        `
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)
        if (changedProperties.has('active')) {
            this.setAttribute('aria-current', this.active ? 'true' : 'false')
        }
    }

    private readonly handleClick = (event: MouseEvent): void => {
        if (this.disabled) {
            event.preventDefault()
            event.stopImmediatePropagation()
            return
        }

        // Notify parent container of user click
        const customEvent = new CustomEvent('mdc-on-this-page-item-click', {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: { item: this },
        })
        const allowed = this.dispatchEvent(customEvent)
        if (!allowed) {
            event.preventDefault()
        }
    }

    private readonly handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault()
            this.itemElement?.click()
        }
    }
}
