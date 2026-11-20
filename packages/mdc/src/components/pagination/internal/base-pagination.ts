/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit'
import { property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import '../../focus-ring/focus-ring'
import '../../icon/icon'
import '../../ripple/ripple'
import '../../select/select'
import '../../select/select-option'
import type { IMDCSelect } from '../../select/select.interface'
import {
    PaginationPageChangeEvent,
    PaginationPageSizeChangeEvent,
    type IMDCPagination,
    type IMDCPaginationPageChangeDetail,
    type IMDCPaginationPageSizeChangeDetail,
    type PaginationPageAriaLabelFormatter,
    type PaginationPageTextFormatter,
    type PaginationRangeFormatter,
    type PaginationShape,
    type PaginationSize,
    type PaginationVariant,
} from '../pagination.interface'
import { PaginationStyles } from '../pagination.style'
import {
    clampPage,
    computeDotsWindow,
    computeItemRange,
    computePaginationItems,
    resolveTotalPages,
} from './pagination-range'

const DefaultPageSizeOptions = [10, 25, 50, 100]

export abstract class BasePagination extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals
)(LitElement) implements IMDCPagination {

    public static override styles = PaginationStyles

    @property({ type: String, reflect: true })
    public variant: PaginationVariant = 'standard'

    @property({ type: String, reflect: true })
    public size: PaginationSize = 'medium'

    @property({ type: String, reflect: true })
    public shape: PaginationShape = 'round'

    @property({ type: Number, reflect: true })
    public page: number = 1

    @property({ type: Number, attribute: 'total-pages', reflect: true })
    public totalPages: number = 1

    @property({ type: Number, attribute: 'total-items', reflect: true })
    public totalItems: number | null = null

    @property({ type: Number, attribute: 'page-size', reflect: true })
    public pageSize: number = 10

    @property({
        type: Array,
        attribute: 'page-size-options',
        converter: {
            fromAttribute: (value: string | null): number[] => {
                if (!value) return DefaultPageSizeOptions
                return value
                    .split(',')
                    .map((v) => Number(v.trim()))
                    .filter((n) => Number.isFinite(n) && n > 0)
            },
        },
    })
    public pageSizeOptions: number[] = DefaultPageSizeOptions

    @property({ type: Number, attribute: 'sibling-count', reflect: true })
    public siblingCount: number = 1

    @property({ type: Number, attribute: 'boundary-count', reflect: true })
    public boundaryCount: number = 1

    @property({ type: Number, attribute: 'max-dots', reflect: true })
    public maxDots: number = 7

    @property({ type: Boolean, attribute: 'show-edges', reflect: true })
    public showEdges: boolean = false

    @property({ type: Boolean, attribute: 'show-controls', reflect: true })
    public showControls: boolean = true

    @property({ type: Boolean, attribute: 'show-range', reflect: true })
    public showRange: boolean = false

    @property({ type: Boolean, attribute: 'show-page-size', reflect: true })
    public showPageSize: boolean = false

    @property({ type: Boolean, attribute: 'show-quick-jumper', reflect: true })
    public showQuickJumper: boolean = false

    @property({ type: Boolean, reflect: true })
    public disabled: boolean = false

    @property({ type: String, reflect: true })
    public label: string = 'Pagination'

    @property({ type: String, attribute: 'prev-label' })
    public prevLabel: string = 'Previous page'

    @property({ type: String, attribute: 'next-label' })
    public nextLabel: string = 'Next page'

    @property({ type: String, attribute: 'first-label' })
    public firstLabel: string = 'First page'

    @property({ type: String, attribute: 'last-label' })
    public lastLabel: string = 'Last page'

    @property({ type: String, attribute: 'items-per-page-label' })
    public itemsPerPageLabel: string = 'Rows per page:'

    @property({ type: String, attribute: 'go-to-label' })
    public goToLabel: string = 'Go to'

    @property({ attribute: false })
    public rangeFormatter: PaginationRangeFormatter | null = null

    @property({ attribute: false })
    public pageAriaLabelFormatter: PaginationPageAriaLabelFormatter | null = null

    @property({ attribute: false })
    public pageTextFormatter: PaginationPageTextFormatter | null = null

    @state()
    private jumperDraft: string = ''

    public get effectiveTotalPages(): number {
        return resolveTotalPages(this.totalPages, this.totalItems, this.pageSize)
    }

    protected get currentPage(): number {
        const total = this.effectiveTotalPages
        if (total === 0) return 0
        return clampPage(total)(this.page)
    }

    public get hasPreviousPage(): boolean {
        return this.effectiveTotalPages > 0 && this.currentPage > 1
    }

    public get hasNextPage(): boolean {
        return this.effectiveTotalPages > 0 && this.currentPage < this.effectiveTotalPages
    }

    public goToPage(targetPage: number): boolean {
        if (this.disabled) return false
        const total = this.effectiveTotalPages
        if (total <= 0) return false

        const next = clampPage(total)(targetPage)
        const oldPage = this.currentPage
        if (next === oldPage) return false

        const event = new CustomEvent<IMDCPaginationPageChangeDetail>(PaginationPageChangeEvent, {
            detail: {
                page: next,
                oldPage,
                pageSize: this.pageSize,
                totalPages: total,
            },
            bubbles: true,
            composed: true,
            cancelable: true,
        })

        if (!this.dispatchEvent(event)) {
            return false
        }

        this.page = next
        return true
    }

    public previous(): boolean {
        return this.hasPreviousPage ? this.goToPage(this.currentPage - 1) : false
    }

    public next(): boolean {
        return this.hasNextPage ? this.goToPage(this.currentPage + 1) : false
    }

    public first(): boolean {
        return this.hasPreviousPage ? this.goToPage(1) : false
    }

    public last(): boolean {
        return this.hasNextPage ? this.goToPage(this.effectiveTotalPages) : false
    }

    private formatRangeSummary(): string {
        const totalPages = this.effectiveTotalPages
        const current = this.currentPage

        if (this.totalItems !== null) {
            const { start, end, total } = computeItemRange(this.pageSize, this.totalItems)(current)
            if (this.rangeFormatter) {
                return this.rangeFormatter({
                    start,
                    end,
                    total,
                    page: current,
                    totalPages,
                    pageSize: this.pageSize,
                })
            }
            return total === 0 ? '0 of 0' : `${start}–${end} of ${total}`
        }

        if (this.rangeFormatter) {
            return this.rangeFormatter({
                start: current,
                end: current,
                total: totalPages,
                page: current,
                totalPages,
                pageSize: this.pageSize,
            })
        }

        return totalPages === 0 ? '0 / 0' : `${current} / ${totalPages}`
    }

    private formatPageAriaLabel(page: number, selected: boolean, totalPages: number): string {
        if (this.pageAriaLabelFormatter) {
            return this.pageAriaLabelFormatter(page, selected, totalPages)
        }
        return selected ? `Page ${page}, current page` : `Go to page ${page}`
    }

    private formatPageText(page: number): string {
        if (this.pageTextFormatter) {
            return this.pageTextFormatter(page)
        }
        return String(page)
    }

    private handlePageSizeChange(event: Event): void {
        const select = event.currentTarget as IMDCSelect
        const nextSize = Number(select.value)
        if (!Number.isFinite(nextSize) || nextSize <= 0 || nextSize === this.pageSize) return

        const oldPageSize = this.pageSize
        this.pageSize = nextSize
        const nextTotal = this.effectiveTotalPages
        const nextPage = nextTotal > 0 ? clampPage(nextTotal)(this.page) : 1
        this.page = nextPage

        this.dispatchEvent(new CustomEvent<IMDCPaginationPageSizeChangeDetail>(PaginationPageSizeChangeEvent, {
            detail: {
                pageSize: nextSize,
                oldPageSize,
                page: nextPage,
                totalPages: nextTotal,
            },
            bubbles: true,
            composed: true,
        }))
    }

    private handleJumperInput(event: Event): void {
        const input = event.currentTarget as HTMLInputElement
        this.jumperDraft = input.value
    }

    private handleJumperKeyDown(event: KeyboardEvent): void {
        if (event.key !== 'Enter') return
        event.preventDefault()
        this.commitJumper()
    }

    private commitJumper(): void {
        const parsed = Number(this.jumperDraft.trim())
        if (Number.isFinite(parsed) && parsed >= 1) {
            this.goToPage(parsed)
        }
        this.jumperDraft = ''
    }

    private handleListKeyDown(event: KeyboardEvent): void {
        const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
        if (!keys.includes(event.key)) return

        const container = event.currentTarget as HTMLElement
        const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
        if (buttons.length === 0) return

        const active = this.shadowRoot?.activeElement as HTMLButtonElement | null
        const currentIndex = active ? buttons.indexOf(active) : -1
        let nextIndex = currentIndex

        if (event.key === 'ArrowRight') {
            nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % buttons.length
        } else if (event.key === 'ArrowLeft') {
            nextIndex = currentIndex < 0 ? buttons.length - 1 : (currentIndex - 1 + buttons.length) % buttons.length
        } else if (event.key === 'Home') {
            nextIndex = 0
        } else if (event.key === 'End') {
            nextIndex = buttons.length - 1
        }

        if (nextIndex !== currentIndex && buttons[nextIndex]) {
            event.preventDefault()
            buttons[nextIndex].focus()
        }
    }

    protected renderControlButton(
        iconName: string,
        ariaLabel: string,
        isDisabled: boolean,
        onClick: () => void
    ): TemplateResult {
        return html`
            <button
                type="button"
                class="control-button"
                part="control-button"
                aria-label=${ariaLabel}
                ?disabled=${this.disabled || isDisabled}
                @click=${onClick}
            >
                <mdc-ripple></mdc-ripple>
                <mdc-focus-ring></mdc-focus-ring>
                <mdc-icon name=${iconName} aria-hidden="true"></mdc-icon>
            </button>
        `
    }

    protected renderRangeSummary(): TemplateResult | typeof nothing {
        const shouldShow = this.showRange || this.variant === 'compact'
        if (!shouldShow) return nothing
        return html`<span class="range-text" part="range">${this.formatRangeSummary()}</span>`
    }

    protected renderPageSizeSelector(): TemplateResult | typeof nothing {
        const shouldShow = this.showPageSize || (this.variant === 'compact' && this.totalItems !== null)
        if (!shouldShow) return nothing

        const options = this.pageSizeOptions.length > 0 ? this.pageSizeOptions : DefaultPageSizeOptions
        return html`
            <div class="page-size-group" part="page-size">
                <span class="page-size-label">${this.itemsPerPageLabel}</span>
                <mdc-select
                    class="page-size-select"
                    variant="outlined"
                    .value=${String(this.pageSize)}
                    ?disabled=${this.disabled}
                    aria-label=${this.itemsPerPageLabel}
                    @change=${this.handlePageSizeChange}
                >
                    ${options.map((opt) => html`
                        <mdc-select-option value=${String(opt)} ?selected=${opt === this.pageSize}>
                            ${opt}
                        </mdc-select-option>
                    `)}
                </mdc-select>
            </div>
        `
    }

    protected renderQuickJumper(): TemplateResult | typeof nothing {
        if (!this.showQuickJumper || this.variant !== 'standard') return nothing
        return html`
            <label class="jumper-group" part="jumper">
                <span class="jumper-label">${this.goToLabel}</span>
                <input
                    class="jumper-input"
                    type="number"
                    min="1"
                    max=${Math.max(1, this.effectiveTotalPages)}
                    .value=${this.jumperDraft}
                    placeholder=${String(this.currentPage || 1)}
                    ?disabled=${this.disabled || this.effectiveTotalPages <= 1}
                    aria-label=${this.goToLabel}
                    @input=${this.handleJumperInput}
                    @keydown=${this.handleJumperKeyDown}
                    @blur=${this.commitJumper}
                />
            </label>
        `
    }

    protected renderStandard(): TemplateResult {
        const total = this.effectiveTotalPages
        const current = this.currentPage
        const items = computePaginationItems({
            page: current || 1,
            totalPages: total,
            siblingCount: this.siblingCount,
            boundaryCount: this.boundaryCount,
        })

        return html`
            ${this.renderRangeSummary()}
            <ul class="page-list" part="list" @keydown=${this.handleListKeyDown}>
                ${this.showEdges ? html`
                    <li>${this.renderControlButton('first_page', this.firstLabel, !this.hasPreviousPage, () => this.first())}</li>
                ` : nothing}
                ${this.showControls ? html`
                    <li>${this.renderControlButton('chevron_left', this.prevLabel, !this.hasPreviousPage, () => this.previous())}</li>
                ` : nothing}
                ${items.map((item) => {
                    if (item.type === 'ellipsis') {
                        return html`
                            <li>
                                <span class="ellipsis" part="ellipsis" aria-hidden="true">
                                    <mdc-icon name="more_horiz"></mdc-icon>
                                </span>
                            </li>
                        `
                    }
                    return html`
                        <li>
                            <button
                                type="button"
                                class=${classMap({ 'page-button': true, selected: item.selected })}
                                part=${item.selected ? 'page-button selected' : 'page-button'}
                                aria-label=${this.formatPageAriaLabel(item.page, item.selected, total)}
                                aria-current=${item.selected ? 'page' : nothing}
                                ?disabled=${this.disabled}
                                @click=${() => this.goToPage(item.page)}
                            >
                                <mdc-ripple></mdc-ripple>
                                <mdc-focus-ring></mdc-focus-ring>
                                <span>${this.formatPageText(item.page)}</span>
                            </button>
                        </li>
                    `
                })}
                ${this.showControls ? html`
                    <li>${this.renderControlButton('chevron_right', this.nextLabel, !this.hasNextPage, () => this.next())}</li>
                ` : nothing}
                ${this.showEdges ? html`
                    <li>${this.renderControlButton('last_page', this.lastLabel, !this.hasNextPage, () => this.last())}</li>
                ` : nothing}
            </ul>
            ${this.renderPageSizeSelector()}
            ${this.renderQuickJumper()}
        `
    }

    protected renderCompact(): TemplateResult {
        const showEdgeControls = this.showEdges || this.variant === 'compact'
        return html`
            ${this.renderPageSizeSelector()}
            ${this.renderRangeSummary()}
            <ul class="page-list" part="list" @keydown=${this.handleListKeyDown}>
                ${showEdgeControls ? html`
                    <li>${this.renderControlButton('first_page', this.firstLabel, !this.hasPreviousPage, () => this.first())}</li>
                ` : nothing}
                <li>${this.renderControlButton('chevron_left', this.prevLabel, !this.hasPreviousPage, () => this.previous())}</li>
                <li>${this.renderControlButton('chevron_right', this.nextLabel, !this.hasNextPage, () => this.next())}</li>
                ${showEdgeControls ? html`
                    <li>${this.renderControlButton('last_page', this.lastLabel, !this.hasNextPage, () => this.last())}</li>
                ` : nothing}
            </ul>
        `
    }

    protected renderSimple(): TemplateResult {
        const total = this.effectiveTotalPages
        const current = this.currentPage
        return html`
            <ul class="page-list" part="list" @keydown=${this.handleListKeyDown}>
                <li>${this.renderControlButton('chevron_left', this.prevLabel, !this.hasPreviousPage, () => this.previous())}</li>
                <li>
                    <span class="simple-status" part="status" aria-live="polite">
                        ${total === 0 ? '0 / 0' : `${current} / ${total}`}
                    </span>
                </li>
                <li>${this.renderControlButton('chevron_right', this.nextLabel, !this.hasNextPage, () => this.next())}</li>
            </ul>
        `
    }

    protected renderDots(): TemplateResult {
        const total = this.effectiveTotalPages
        const current = this.currentPage
        const dots = computeDotsWindow(this.maxDots)({
            page: current || 1,
            totalPages: total,
        })

        return html`
            <ul class="dots-list" part="dots" @keydown=${this.handleListKeyDown}>
                ${dots.map((dot) => html`
                    <li>
                        <button
                            type="button"
                            class=${classMap({
                                'dot-button': true,
                                [`scale-${dot.scale}`]: true,
                            })}
                            part=${dot.active ? 'dot active' : 'dot'}
                            aria-label=${this.formatPageAriaLabel(dot.page, dot.active, total)}
                            aria-current=${dot.active ? 'page' : nothing}
                            ?disabled=${this.disabled}
                            @click=${() => this.goToPage(dot.page)}
                        >
                            <mdc-focus-ring></mdc-focus-ring>
                        </button>
                    </li>
                `)}
            </ul>
        `
    }

    protected override render(): TemplateResult {
        let body: TemplateResult
        switch (this.variant) {
            case 'compact':
                body = this.renderCompact()
                break
            case 'simple':
                body = this.renderSimple()
                break
            case 'dots':
                body = this.renderDots()
                break
            case 'standard':
            default:
                body = this.renderStandard()
                break
        }

        return html`
            <nav class="nav" part="nav" aria-label=${this.ariaLabel || this.label}>
                ${body}
            </nav>
        `
    }
}
