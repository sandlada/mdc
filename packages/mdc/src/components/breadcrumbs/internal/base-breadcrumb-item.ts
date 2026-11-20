/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import '../../focus-ring/focus-ring'
import '../../icon/icon'
import '../../ripple/ripple'
import {
    BreadcrumbsShape,
    BreadcrumbsSize,
    BreadcrumbsVariant,
    type IMDCBreadcrumbItem,
} from '../breadcrumbs.interface'
import { BreadcrumbItemStyles } from '../breadcrumbs.style'

export abstract class BaseBreadcrumbItem extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements IMDCBreadcrumbItem {
    static override styles = BreadcrumbItemStyles

    @property({ type: String })
    public href: string | null = null

    @property({ type: String })
    public target: string | null = null

    @property({ type: String })
    public rel: string | null = null

    @property({ type: String })
    public icon: string | null = null

    @property({ type: String })
    public value: string | null = null

    @property({ type: Boolean, reflect: true })
    public current = false

    @property({ type: Boolean, reflect: true })
    public disabled = false

    @property({ type: String, reflect: true })
    public variant: BreadcrumbsVariant = BreadcrumbsVariant.Standard

    @property({ type: String, reflect: true })
    public size: BreadcrumbsSize = BreadcrumbsSize.Medium

    @property({ type: String, reflect: true })
    public shape: BreadcrumbsShape = BreadcrumbsShape.Round

    @state()
    private hasSlottedIcon = false

    protected override render(): TemplateResult {
        const isInteractive = !this.current && !this.disabled
        const classes = {
            item: true,
            current: this.current,
            disabled: this.disabled && !this.current,
        }

        const content = html`
            ${isInteractive ? html`<mdc-ripple></mdc-ripple><mdc-focus-ring></mdc-focus-ring>` : nothing}
            ${this.renderLeadingIcon()}
            <span class="label"><slot></slot></span>
        `

        if (this.current) {
            return html`
                <span class=${classMap(classes)} aria-current="page">
                    ${content}
                </span>
            `
        }

        if (this.href !== null && this.href !== '' && !this.disabled) {
            return html`
                <a
                    class=${classMap(classes)}
                    href=${this.href}
                    target=${ifDefined(this.target ?? undefined)}
                    rel=${ifDefined(this.rel ?? undefined)}
                >
                    ${content}
                </a>
            `
        }

        return html`
            <button
                type="button"
                class=${classMap(classes)}
                ?disabled=${this.disabled}
            >
                ${content}
            </button>
        `
    }

    private renderLeadingIcon(): TemplateResult {
        const hasIcon = Boolean(this.icon) || this.hasSlottedIcon
        return html`
            <span class="icon" ?hidden=${!hasIcon} aria-hidden="true">
                <slot name="icon" @slotchange=${this.handleIconSlotChange}>
                    ${this.icon ? html`<mdc-icon name=${this.icon}></mdc-icon>` : nothing}
                </slot>
            </span>
        `
    }

    private handleIconSlotChange(e: Event): void {
        const slot = e.target as HTMLSlotElement
        this.hasSlottedIcon = slot.assignedElements({ flatten: true }).length > 0
    }
}
