/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinElevationOptions } from '../../elevation/elevation-options.mixin'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import {
    FabMenuItemSelectEvent,
    type FabMenuVariants,
    type IMDCFabMenuItem,
} from '../fab-menu.interface'

export abstract class BaseFabMenuItem extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
    mixinRippleOptions,
    mixinElevationOptions,
    mixinFocusRingOptions,
)(LitElement) implements IMDCFabMenuItem {

    @query('.item')
    protected readonly itemElement!: HTMLElement | null

    public override get focusRingControl() {
        return this.itemElement
    }

    @property({ type: String, reflect: true })
    public variant: FabMenuVariants = 'primary'

    @property({ type: Boolean, reflect: true })
    public disabled = false

    @property({ type: String, reflect: true })
    public href: string | null = null

    @property({ type: String, reflect: true })
    public target: string | null = null

    @property({ type: Boolean, reflect: true, attribute: 'keep-open' })
    public keepOpen = false

    @state()
    private hasIcon = false

    public hasExplicitVariant = false

    public constructor() {
        super()
        if (typeof document === 'undefined') {
            return
        }
    }

    public override connectedCallback(): void {
        if (!this.hasExplicitVariant) {
            this.hasExplicitVariant = this.hasAttribute('variant')
        }
        super.connectedCallback()
    }

    public override focus(options?: FocusOptions): void {
        this.itemElement?.focus(options)
    }

    protected getRenderClasses(): Record<string, boolean> {
        return {
            'item': true,
            'disabled': this.disabled,
            'has-icon': this.hasIcon,
            [this.variant]: true,
        }
    }

    protected override render(): unknown {
        const classes = classMap(this.getRenderClasses())
        const { ariaLabel } = this as AriaMixinStrict
        const content = html`
            ${this.renderRipple()}
            ${this.renderFocusRing()}
            ${this.renderElevation()}
            <span class="icon" aria-hidden="true">
                <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
            </span>
            <span class="label">
                <slot></slot>
            </span>
        `

        if (this.href && !this.disabled) {
            return html`
                <a
                    class=${classes}
                    role="menuitem"
                    href=${this.href}
                    target=${ifDefined(this.target ?? undefined)}
                    aria-label=${ifDefined(ariaLabel ?? undefined)}
                    @click=${this.handleItemClick}
                >
                    ${content}
                </a>
            `
        }

        return html`
            <button
                class=${classes}
                type="button"
                role="menuitem"
                ?disabled=${this.disabled}
                aria-disabled=${this.disabled ? 'true' : 'false'}
                aria-label=${ifDefined(ariaLabel ?? undefined)}
                @click=${this.handleItemClick}
            >
                ${content}
            </button>
        `
    }

    private handleIconSlotChange(e: Event): void {
        const slot = e.target as HTMLSlotElement
        this.hasIcon = slot.assignedElements({ flatten: true }).length > 0
    }

    private handleItemClick(e: Event): void {
        if (this.disabled) {
            e.preventDefault()
            e.stopPropagation()
            return
        }

        const selectEvent = new CustomEvent<{ item: IMDCFabMenuItem }>(FabMenuItemSelectEvent, {
            detail: { item: this },
            bubbles: true,
            composed: true,
            cancelable: true,
        })

        if (!this.dispatchEvent(selectEvent)) {
            e.preventDefault()
        }
    }
}
