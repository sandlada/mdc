/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import '../../focus-ring/focus-ring'
import '../../icon/icon'
import '../../menu/menu'
import '../../menu/menu-item'
import '../../ripple/ripple'
import type { IMDCMenu } from '../../menu/menu.interface'
import {
    BreadcrumbSelectEvent,
    BreadcrumbsCollapseMode,
    BreadcrumbsExpandEvent,
    BreadcrumbsSeparator,
    BreadcrumbsShape,
    BreadcrumbsSize,
    BreadcrumbsVariant,
    type IBreadcrumbDataItem,
    type IMDCBreadcrumbItem,
    type IMDCBreadcrumbSelectDetail,
    type IMDCBreadcrumbs,
    type IMDCBreadcrumbsExpandDetail,
} from '../breadcrumbs.interface'
import { BreadcrumbsStyles } from '../breadcrumbs.style'
import { computeBreadcrumbSegments } from './breadcrumbs-collapse'

interface IResolvedBreadcrumbEntry {
    index: number
    label: string
    href: string | null
    target: string | null
    icon: string | null
    value: string | null
    disabled: boolean
    current: boolean
    element: IMDCBreadcrumbItem | null
}

export abstract class BaseBreadcrumbs extends composeMixin(
    mixinDelegatesAria
)(LitElement) implements IMDCBreadcrumbs {
    static override styles = BreadcrumbsStyles

    @property({ type: String, reflect: true })
    public variant: BreadcrumbsVariant = BreadcrumbsVariant.Standard

    @property({ type: String, reflect: true })
    public size: BreadcrumbsSize = BreadcrumbsSize.Medium

    @property({ type: String, reflect: true })
    public shape: BreadcrumbsShape = BreadcrumbsShape.Round

    @property({ type: String, reflect: true })
    public separator: BreadcrumbsSeparator | (string & {}) = BreadcrumbsSeparator.Chevron

    @property({ type: Number, attribute: 'max-items', reflect: true })
    public maxItems = 0

    @property({ type: Number, attribute: 'items-before-collapse', reflect: true })
    public itemsBeforeCollapse = 1

    @property({ type: Number, attribute: 'items-after-collapse', reflect: true })
    public itemsAfterCollapse = 2

    @property({ type: String, attribute: 'collapse-mode', reflect: true })
    public collapseMode: BreadcrumbsCollapseMode = BreadcrumbsCollapseMode.Menu

    @property({ type: String })
    public label = 'Breadcrumb'

    @property({ type: String, attribute: 'expand-label' })
    public expandLabel = 'Show collapsed breadcrumbs'

    @property({ type: Array })
    public items: IBreadcrumbDataItem[] = []

    @state()
    private isExpanded = false

    @state()
    private slottedItems: IMDCBreadcrumbItem[] = []

    private childObserver: MutationObserver | null = null

    public get expanded(): boolean {
        return this.isExpanded
    }

    public expand(): void {
        if (this.isExpanded) {
            return
        }
        const entries = this.getResolvedEntries()
        const segments = computeBreadcrumbSegments({
            totalItems: entries.length,
            maxItems: this.maxItems,
            itemsBeforeCollapse: this.itemsBeforeCollapse,
            itemsAfterCollapse: this.itemsAfterCollapse,
            expanded: false,
        })
        const collapsedSegment = segments.find((s) => s.type === 'ellipsis')
        const expandedCount = collapsedSegment?.collapsedIndices?.length ?? 0

        this.isExpanded = true
        this.syncSlottedAttributes()

        if (expandedCount > 0) {
            this.dispatchEvent(new CustomEvent<IMDCBreadcrumbsExpandDetail>(BreadcrumbsExpandEvent, {
                bubbles: true,
                composed: true,
                detail: { expandedCount },
            }))
        }
    }

    public collapse(): void {
        if (!this.isExpanded) {
            return
        }
        this.isExpanded = false
        this.syncSlottedAttributes()
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        this.collectSlottedItems()
        if (typeof MutationObserver !== 'undefined') {
            this.childObserver = new MutationObserver(() => {
                this.collectSlottedItems()
            })
            this.childObserver.observe(this, {
                childList: true,
                attributes: true,
                attributeFilter: ['current', 'disabled', 'href', 'value', 'icon'],
                characterData: true,
                subtree: true,
            })
        }
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.childObserver?.disconnect()
        this.childObserver = null
    }

    protected override willUpdate(changed: PropertyValues): void {
        super.willUpdate(changed)
        if (this.slottedItems.length === 0 && this.children.length > 0) {
            this.collectSlottedItems()
        }
    }

    protected override updated(changed: PropertyValues): void {
        super.updated(changed)
        if (
            changed.has('variant') ||
            changed.has('size') ||
            changed.has('shape') ||
            changed.has('maxItems') ||
            changed.has('itemsBeforeCollapse') ||
            changed.has('itemsAfterCollapse')
        ) {
            this.syncSlottedAttributes()
        }
    }

    protected override render(): TemplateResult {
        const entries = this.getResolvedEntries()
        const segments = computeBreadcrumbSegments({
            totalItems: entries.length,
            maxItems: this.maxItems,
            itemsBeforeCollapse: this.itemsBeforeCollapse,
            itemsAfterCollapse: this.itemsAfterCollapse,
            expanded: this.isExpanded,
        })

        const usingData = this.items.length > 0

        return html`
            <nav class="nav" aria-label=${this.label}>
                <ol class="list">
                    ${segments.map((segment, segIdx) => {
                        const isLast = segIdx === segments.length - 1
                        const sep = !isLast ? this.renderSeparator() : nothing

                        if (segment.type === 'ellipsis') {
                            const hiddenEntries = (segment.collapsedIndices ?? []).map((idx) => entries[idx])
                            return html`
                                <li class="entry">
                                    ${this.renderEllipsis(hiddenEntries)}
                                </li>
                                ${sep}
                            `
                        }

                        const entry = entries[segment.index!]
                        return html`
                            <li class="entry">
                                ${usingData
                                    ? this.renderDataItem(entry)
                                    : html`<slot name=${`item-${entry.index}`}></slot>`}
                            </li>
                            ${sep}
                        `
                    })}
                </ol>
            </nav>
            <div class="hidden-slot" aria-hidden="true">
                <slot @slotchange=${this.handleSlotChange}></slot>
            </div>
        `
    }

    private renderSeparator(): TemplateResult {
        return html`
            <li class="separator" aria-hidden="true">
                <slot name="separator">
                    ${this.renderSeparatorIcon()}
                </slot>
            </li>
        `
    }

    private renderSeparatorIcon(): TemplateResult {
        if (this.separator === BreadcrumbsSeparator.Chevron) {
            return html`<mdc-icon name="chevron_right"></mdc-icon>`
        }
        if (this.separator === BreadcrumbsSeparator.Arrow) {
            return html`<mdc-icon name="arrow_forward_ios"></mdc-icon>`
        }
        if (this.separator === BreadcrumbsSeparator.Slash) {
            return html`<span>/</span>`
        }
        return html`<span>${this.separator}</span>`
    }

    private renderEllipsis(hiddenEntries: IResolvedBreadcrumbEntry[]): TemplateResult {
        if (this.collapseMode === BreadcrumbsCollapseMode.Expand) {
            return html`
                <button
                    type="button"
                    class="overflow-button"
                    aria-label=${this.expandLabel}
                    @click=${this.handleExpandClick}
                >
                    <mdc-ripple></mdc-ripple>
                    <mdc-focus-ring></mdc-focus-ring>
                    <mdc-icon name="more_horiz"></mdc-icon>
                </button>
            `
        }

        return html`
            <div class="overflow-wrapper">
                <mdc-menu placement="bottom-start">
                    <button
                        slot="trigger"
                        type="button"
                        class="overflow-button"
                        aria-label=${this.expandLabel}
                        aria-haspopup="menu"
                    >
                        <mdc-ripple></mdc-ripple>
                        <mdc-focus-ring></mdc-focus-ring>
                        <mdc-icon name="more_horiz"></mdc-icon>
                    </button>
                    ${hiddenEntries.map((entry) => html`
                        <mdc-menu-item
                            type=${entry.href ? 'link' : 'button'}
                            href=${ifDefined(entry.href ?? undefined)}
                            target=${ifDefined(entry.target ?? undefined)}
                            ?disabled=${entry.disabled}
                            @click=${(e: Event) => this.handleMenuEntryClick(e, entry)}
                        >
                            ${entry.icon ? html`<mdc-icon slot="leading" name=${entry.icon}></mdc-icon>` : nothing}
                            ${entry.label}
                        </mdc-menu-item>
                    `)}
                </mdc-menu>
            </div>
        `
    }

    private renderDataItem(entry: IResolvedBreadcrumbEntry): TemplateResult {
        const isInteractive = !entry.current && !entry.disabled
        const classes = {
            'data-item': true,
            current: entry.current,
            disabled: entry.disabled && !entry.current,
        }

        const content = html`
            ${isInteractive ? html`<mdc-ripple></mdc-ripple><mdc-focus-ring></mdc-focus-ring>` : nothing}
            ${entry.icon ? html`<mdc-icon name=${entry.icon} aria-hidden="true"></mdc-icon>` : nothing}
            <span>${entry.label}</span>
        `

        if (entry.current) {
            return html`
                <span class=${classMap(classes)} aria-current="page">
                    ${content}
                </span>
            `
        }

        if (entry.href && !entry.disabled) {
            return html`
                <a
                    class=${classMap(classes)}
                    href=${entry.href}
                    target=${ifDefined(entry.target ?? undefined)}
                    @click=${(e: Event) => this.handleEntrySelect(e, entry)}
                >
                    ${content}
                </a>
            `
        }

        return html`
            <button
                type="button"
                class=${classMap(classes)}
                ?disabled=${entry.disabled}
                @click=${(e: Event) => this.handleEntrySelect(e, entry)}
            >
                ${content}
            </button>
        `
    }

    private handleSlotChange(): void {
        this.collectSlottedItems()
    }

    private collectSlottedItems(): void {
        const items = Array.from(this.children).filter(
            (el): el is IMDCBreadcrumbItem => el.tagName.toLowerCase() === 'mdc-breadcrumb-item'
        )
        this.slottedItems = items
        this.syncSlottedAttributes()
    }

    private syncSlottedAttributes(): void {
        const total = this.slottedItems.length
        if (total === 0) {
            return
        }

        const hasExplicitCurrent = this.slottedItems.some((item) => item.hasAttribute('current'))
        const segments = computeBreadcrumbSegments({
            totalItems: total,
            maxItems: this.maxItems,
            itemsBeforeCollapse: this.itemsBeforeCollapse,
            itemsAfterCollapse: this.itemsAfterCollapse,
            expanded: this.isExpanded,
        })
        const visibleIndices = new Set<number>()
        for (const seg of segments) {
            if (seg.type === 'item' && seg.index !== undefined) {
                visibleIndices.add(seg.index)
            }
        }

        this.slottedItems.forEach((item, index) => {
            item.variant = this.variant
            item.size = this.size
            item.shape = this.shape

            if (!hasExplicitCurrent) {
                item.current = index === total - 1
            }

            if (visibleIndices.has(index)) {
                item.slot = `item-${index}`
            } else {
                item.removeAttribute('slot')
            }

            item.onclick = (e: MouseEvent) => {
                if (item.current || item.disabled) {
                    return
                }
                const entry: IResolvedBreadcrumbEntry = {
                    index,
                    label: (item.textContent ?? '').trim(),
                    href: item.href,
                    target: item.target,
                    icon: item.icon,
                    value: item.value,
                    disabled: item.disabled,
                    current: item.current,
                    element: item,
                }
                this.handleEntrySelect(e, entry)
            }
        })
    }

    private getResolvedEntries(): IResolvedBreadcrumbEntry[] {
        if (this.items.length > 0) {
            const total = this.items.length
            return this.items.map((item, index) => ({
                index,
                label: item.label,
                href: item.href ?? null,
                target: item.target ?? null,
                icon: item.icon ?? null,
                value: item.value ?? null,
                disabled: Boolean(item.disabled),
                current: index === total - 1,
                element: null,
            }))
        }

        const total = this.slottedItems.length
        const hasExplicitCurrent = this.slottedItems.some((item) => item.hasAttribute('current'))
        return this.slottedItems.map((item, index) => ({
            index,
            label: (item.textContent ?? '').trim(),
            href: item.href,
            target: item.target,
            icon: item.icon,
            value: item.value,
            disabled: item.disabled,
            current: hasExplicitCurrent ? item.current : index === total - 1,
            element: item,
        }))
    }

    private handleExpandClick(): void {
        this.expand()
    }

    private handleMenuEntryClick(e: Event, entry: IResolvedBreadcrumbEntry): void {
        this.handleEntrySelect(e, entry)
        const target = e.currentTarget as HTMLElement | null
        const menu = target?.closest('mdc-menu') as IMDCMenu | null
        if (menu) {
            void menu.hide()
        }
    }

    private handleEntrySelect(e: Event, entry: IResolvedBreadcrumbEntry): void {
        if (entry.disabled || entry.current) {
            return
        }
        const selectEvent = new CustomEvent<IMDCBreadcrumbSelectDetail>(BreadcrumbSelectEvent, {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: {
                index: entry.index,
                label: entry.label,
                href: entry.href,
                value: entry.value,
                item: entry.element,
            },
        })
        const notCanceled = this.dispatchEvent(selectEvent)
        if (!notCanceled) {
            e.preventDefault()
        }
    }
}
