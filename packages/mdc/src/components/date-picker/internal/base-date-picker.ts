/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import type { PropertyValues } from 'lit'
import { html, isServer, LitElement, nothing } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinElevationOptions } from '../../elevation/elevation-options.mixin'
import type { DateDisplayMode, DatePickerVariant, DateSelectionMode } from '../date-picker.interface'
import { addMonths, buildMonthGrid, buildYearList, clampDay, formatISODate, formatLocaleDate, fromUTCMidnight, isInRange, parseDateInput, parseISODate, toUTCMidnight } from './date-utils'
import '../../button/index'
import '../../icon-button/index'
import '../../ripple/index'

export abstract class BaseDatePicker extends composeMixin(
    mixinElevationOptions,
)(LitElement) {
    public static readonly formAssociated = true

    @property({ type: String, reflect: true })
    public variant: DatePickerVariant = 'modal'

    @property({ type: String, reflect: true })
    public selection: DateSelectionMode = 'single'

    @property({ type: String, reflect: true, attribute: 'display-mode' })
    public displayMode: DateDisplayMode = 'calendar'

    @property({ type: Boolean, reflect: true })
    public open = false

    @property({ type: Boolean })
    public quick = false

    @property({ type: String })
    public headline = ''

    @property({ type: String, attribute: 'supporting-text' })
    public supportingText = 'Select date'

    @property({ type: String, attribute: 'confirm-label' })
    public confirmLabel = 'OK'

    @property({ type: String, attribute: 'dismiss-label' })
    public dismissLabel = 'Cancel'

    @property({ type: String, attribute: 'clear-label' })
    public clearLabel = 'Clear'

    @property({ type: Number })
    public value: number | null = null

    @property({ type: Number, attribute: 'range-start' })
    public rangeStart: number | null = null

    @property({ type: Number, attribute: 'range-end' })
    public rangeEnd: number | null = null

    @property({ type: Number, attribute: 'displayed-month' })
    public displayedMonth: number | null = null

    @property({ type: Number })
    public min: number | null = null

    @property({ type: Number })
    public max: number | null = null

    @property({ type: Boolean, reflect: true })
    public disabled = false

    @property({ type: Boolean, reflect: true })
    public required = false

    @property({ type: String, reflect: true })
    public name = ''

    @property({ type: Number, attribute: 'first-day-of-week' })
    public firstDayOfWeek = 0

    @property({ type: Boolean, attribute: 'show-mode-toggle' })
    public showModeToggle = true

    @property({ type: Boolean, attribute: 'no-focus-trap', reflect: true })
    public noFocusTrap = false

    @state()
    protected pendingValue: number | null = null

    @state()
    protected pendingStart: number | null = null

    @state()
    protected pendingEnd: number | null = null

    @state()
    protected pendingMonth: number = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)

    @state()
    protected inputText = ''

    @state()
    protected inputEndText = ''

    @state()
    protected openSubMenu: 'month' | 'year' | null = null

    @query('dialog')
    protected declare readonly dialog: HTMLDialogElement | null

    @query('.docked-field')
    protected declare readonly dockedField: HTMLElement | null

    @query('.docked-menu')
    protected declare readonly dockedMenu: HTMLElement | null

    private dockedPositionCleanup?: () => void

    private formInternals: ElementInternals | null = null

    protected ensureFormInternals(): ElementInternals | null {
        if (isServer) return null
        if (this.formInternals) return this.formInternals
        try {
            this.formInternals = this.attachInternals()
        } catch {
            this.formInternals = null
        }
        return this.formInternals
    }

    protected getSubmitValue(): string | null {
        if (this.selection === 'range') {
            if (this.rangeStart !== null && this.rangeEnd !== null) return `${formatISODate(this.rangeStart)},${formatISODate(this.rangeEnd)}`
            return null
        }
        return this.value !== null ? formatISODate(this.value) : null
    }

    protected syncFormValue(): void {
        const internals = this.ensureFormInternals()
        if (!internals) return
        const submit = this.getSubmitValue()
        internals.setFormValue(submit)
        if (this.required && (submit === null || submit === '')) {
            internals.setValidity({ valueMissing: true }, 'Please select a date')
        } else {
            internals.setValidity({})
        }
    }

    public formResetCallback(): void {
        this.value = null
        this.rangeStart = null
        this.rangeEnd = null
        this.pendingValue = null
        this.pendingStart = null
        this.pendingEnd = null
        this.syncInputText()
        this.syncFormValue()
    }

    public formStateRestoreCallback(state: string | File | FormData | null): void {
        if (typeof state !== 'string' || state === '') {
            this.formResetCallback()
            return
        }
        try {
            const parts = state.split(',')
            if (this.selection === 'range' && parts.length === 2 && parts[0] !== undefined && parts[1] !== undefined) {
                const start = parseISODate(parts[0])
                const end = parseISODate(parts[1])
                if (start > end) return
                this.rangeStart = start
                this.rangeEnd = end
                this.pendingStart = start
                this.pendingEnd = end
            } else {
                const millis = parseISODate(parts[0] ?? '')
                this.value = millis
                this.pendingValue = millis
            }
            this.syncInputText()
            this.syncFormValue()
        } catch {
            return
        }
    }

    protected override updated(changed: PropertyValues): void {
        super.updated(changed)
        if (changed.has('value') || changed.has('rangeStart') || changed.has('rangeEnd') || changed.has('required')) this.syncFormValue()
    }

    protected getRenderClasses(): Record<string, boolean> {
        return {
            'container': true,
        }
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (this.value !== null) this.pendingValue = this.value
        if (this.rangeStart !== null) this.pendingStart = this.rangeStart
        if (this.rangeEnd !== null) this.pendingEnd = this.rangeEnd
        const anchor = this.value ?? this.rangeStart ?? Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)
        this.pendingMonth = Date.UTC(fromUTCMidnight(anchor).year, fromUTCMidnight(anchor).month - 1, 1)
        if (this.displayedMonth !== null) this.pendingMonth = this.displayedMonth
        this.syncInputText()
        this.syncFormValue()
    }

    public async show(): Promise<void> {
        if (this.open || this.disabled) return
        const event = new CustomEvent('open', { cancelable: true, bubbles: true, composed: true })
        this.dispatchEvent(event)
        if (event.defaultPrevented) return
        this.open = true
        this.syncInputText()
        await this.updateComplete
        if (this.variant === 'docked') this.startDockedPositioning()
        else if (this.dialog && !this.dialog.open) this.dialog.showModal()
        this.dispatchEvent(new CustomEvent('opened', { bubbles: true, composed: true }))
    }

    public async close(returnValue?: string): Promise<void> {
        if (!this.open) return
        const event = new CustomEvent('close', { cancelable: true, bubbles: true, composed: true })
        this.dispatchEvent(event)
        if (event.defaultPrevented) return
        if (this.variant === 'docked') this.stopDockedPositioning()
        else if (this.dialog?.open) {
            if (returnValue !== undefined) this.dialog.returnValue = returnValue
            this.dialog.close(returnValue)
        }
        this.open = false
        await this.updateComplete
        this.dispatchEvent(new CustomEvent('closed', { bubbles: true, composed: true }))
    }

    public override disconnectedCallback(): void {
        this.stopDockedPositioning()
        super.disconnectedCallback()
    }

    protected startDockedPositioning(): void {
        if (isServer || !this.dockedField || !this.dockedMenu) return
        this.stopDockedPositioning()
        const update = async (): Promise<void> => {
            if (!this.dockedField || !this.dockedMenu) return
            const { x, y } = await computePosition(this.dockedField, this.dockedMenu, {
                placement: 'bottom-start',
                middleware: [offset(6), flip(), shift({ padding: 8 })],
            })
            Object.assign(this.dockedMenu.style, { left: `${x}px`, top: `${y}px` })
        }
        this.dockedPositionCleanup = autoUpdate(this.dockedField, this.dockedMenu, () => { void update() })
        document.addEventListener('pointerdown', this.handleDockedOutside, true)
        document.addEventListener('keydown', this.handleDockedKeydown, true)
    }

    protected stopDockedPositioning(): void {
        this.dockedPositionCleanup?.()
        this.dockedPositionCleanup = undefined
        if (!isServer) {
            document.removeEventListener('pointerdown', this.handleDockedOutside, true)
            document.removeEventListener('keydown', this.handleDockedKeydown, true)
        }
    }

    private readonly handleDockedOutside = (event: Event): void => {
        if (!this.open || this.variant !== 'docked') return
        const path = event.composedPath()
        if (!path.includes(this)) void this.close('dismissed')
    }

    private readonly handleDockedKeydown = (event: KeyboardEvent): void => {
        if (!this.open || this.variant !== 'docked') return
        if (event.key !== 'Escape') return
        if (this.openSubMenu !== null) {
            this.openSubMenu = null
            return
        }
        void this.close('dismissed')
    }

    public async confirm(): Promise<void> {
        if (this.disabled) throw new Error('Date picker is disabled')
        if (this.displayMode === 'input') this.commitInputText()
        if (this.selection === 'range') {
            if (this.required && (this.pendingStart === null || this.pendingEnd === null)) throw new Error('Range start and end are required')
            this.rangeStart = this.pendingStart
            this.rangeEnd = this.pendingEnd
            this.dispatchEvent(new CustomEvent('range-change', { detail: { start: this.pendingStart, end: this.pendingEnd }, bubbles: true, composed: true }))
            this.dispatchEvent(new CustomEvent('confirm', { detail: { value: null, start: this.pendingStart, end: this.pendingEnd }, bubbles: true, composed: true }))
        } else {
            if (this.required && this.pendingValue === null) throw new Error('Date value is required')
            this.value = this.pendingValue
            this.dispatchEvent(new CustomEvent('date-change', { detail: { value: this.pendingValue }, bubbles: true, composed: true }))
            this.dispatchEvent(new CustomEvent('confirm', { detail: { value: this.pendingValue, start: null, end: null }, bubbles: true, composed: true }))
        }
        this.syncFormValue()
        await this.close('confirmed')
    }

    protected isDayDisabled(millis: number): boolean {
        if (this.disabled) return true
        if (this.min !== null && millis < this.min) return true
        if (this.max !== null && millis > this.max) return true
        return false
    }

    protected syncInputText(): void {
        this.inputText = this.pendingValue !== null ? formatLocaleDate(this.pendingValue) : ''
        this.inputEndText = this.pendingEnd !== null ? formatLocaleDate(this.pendingEnd) : ''
        if (this.selection === 'range' && this.pendingStart !== null) this.inputText = formatLocaleDate(this.pendingStart)
    }

    protected commitInputText(): void {
        try {
            if (this.selection === 'range') {
                const start = this.inputText.trim() === '' ? null : parseDateInput(this.inputText)
                const end = this.inputEndText.trim() === '' ? null : parseDateInput(this.inputEndText)
                if (start !== null && !isInRange(start)(this.min, this.max)) throw new Error('Start date out of range')
                if (end !== null && !isInRange(end)(this.min, this.max)) throw new Error('End date out of range')
                if (start !== null && end !== null && start > end) throw new Error('Start must be <= end')
                this.pendingStart = start
                this.pendingEnd = end
            } else {
                if (this.inputText.trim() === '') {
                    this.pendingValue = null
                    return
                }
                const millis = parseDateInput(this.inputText)
                if (!isInRange(millis)(this.min, this.max)) throw new Error('Date out of range')
                this.pendingValue = millis
            }
        } catch (error) {
            throw error instanceof Error ? error : new Error('Invalid date input')
        }
    }

    protected handleDayClick(millis: number): void {
        if (this.isDayDisabled(millis)) return
        if (this.selection === 'range') {
            if (this.pendingStart === null || (this.pendingStart !== null && this.pendingEnd !== null)) {
                this.pendingStart = millis
                this.pendingEnd = null
            } else if (millis === this.pendingStart) {
                this.pendingStart = null
            } else if (millis < this.pendingStart) {
                this.pendingEnd = this.pendingStart
                this.pendingStart = millis
            } else {
                this.pendingEnd = millis
            }
            this.requestUpdate()
            return
        }
        this.pendingValue = millis
        this.dispatchEvent(new CustomEvent('date-change', { detail: { value: millis }, bubbles: true, composed: true }))
        this.requestUpdate()
    }

    protected handlePrevMonth(): void {
        const parts = fromUTCMidnight(this.pendingMonth)
        this.pendingMonth = toUTCMidnight({ year: parts.year, month: parts.month, day: 1 }) - 1 * 86400000
        const prev = fromUTCMidnight(this.pendingMonth)
        this.pendingMonth = toUTCMidnight({ year: prev.year, month: prev.month, day: 1 })
    }

    protected handleNextMonth(): void {
        const parts = fromUTCMidnight(this.pendingMonth)
        const nextMonth = parts.month === 12 ? 1 : parts.month + 1
        const nextYear = parts.month === 12 ? parts.year + 1 : parts.year
        this.pendingMonth = toUTCMidnight({ year: nextYear, month: nextMonth, day: 1 })
    }

    protected handleToggleMode(): void {
        if (this.displayMode === 'calendar') this.displayMode = 'input'
        else if (this.displayMode === 'input') this.displayMode = 'calendar'
        else this.displayMode = 'calendar'
        this.syncInputText()
    }

    protected handleShowYear(): void {
        this.displayMode = 'year'
        this.scrollSelectedIntoView()
    }

    protected scrollSelectedIntoView(): void {
        if (isServer) return
        void this.updateComplete.then(() => {
            this.shadowRoot?.querySelector('.menu-item.selected, .year.selected')?.scrollIntoView({ block: 'center' })
        })
    }

    protected handleShowCalendar(): void {
        this.displayMode = 'calendar'
    }

    protected handleClear(): void {
        if (this.disabled) return
        if (this.selection === 'range') {
            this.pendingStart = null
            this.pendingEnd = null
            this.dispatchEvent(new CustomEvent('range-change', { detail: { start: null, end: null }, bubbles: true, composed: true }))
        } else {
            this.pendingValue = null
            this.dispatchEvent(new CustomEvent('date-change', { detail: { value: null }, bubbles: true, composed: true }))
        }
        this.syncInputText()
        this.requestUpdate()
    }

    protected handleDockedMonthClick(month: number): void {
        const parts = fromUTCMidnight(this.pendingMonth)
        this.pendingMonth = clampDay(toUTCMidnight({ year: parts.year, month, day: 1 }))(this.min, this.max)
        this.openSubMenu = null
    }

    protected handleDockedYearClick(year: number): void {
        const parts = fromUTCMidnight(this.pendingMonth)
        this.pendingMonth = clampDay(toUTCMidnight({ year, month: parts.month, day: 1 }))(this.min, this.max)
        this.openSubMenu = null
    }

    protected toggleSubMenu(which: 'month' | 'year'): void {
        this.openSubMenu = this.openSubMenu === which ? null : which
        if (this.openSubMenu !== null) this.scrollSelectedIntoView()
    }

    protected handleYearClick(year: number): void {
        const parts = fromUTCMidnight(this.pendingMonth)
        const day = 1
        this.pendingMonth = clampDay(toUTCMidnight({ year, month: parts.month, day }))(this.min, this.max)
        const clampedParts = fromUTCMidnight(this.pendingMonth)
        if (clampedParts.year !== year) this.pendingMonth = toUTCMidnight({ year, month: clampedParts.month, day: 1 })
        this.displayMode = 'calendar'
    }

    protected handleDismiss(): void {
        this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }))
        void this.close('dismissed')
    }

    protected handleTriggerClick(): void {
        if (this.disabled) return
        if (this.open) {
            this.openSubMenu = null
            void this.close('dismissed')
        } else void this.show()
    }

    protected renderFieldText(): string {
        if (this.selection === 'range') {
            if (this.pendingStart !== null && this.pendingEnd !== null) return `${formatLocaleDate(this.pendingStart)} – ${formatLocaleDate(this.pendingEnd)}`
            return this.supportingText
        }
        if (this.pendingValue !== null) return formatLocaleDate(this.pendingValue)
        return this.supportingText
    }

    protected renderDocked(): unknown {
        return html`
            <div class="docked-wrap">
                <button class="docked-field" @click=${this.handleTriggerClick} ?disabled=${this.disabled} aria-haspopup="dialog" aria-expanded=${this.open ? 'true' : 'false'}>
                    <span class="field-notch">Date</span>
                    <span class="field-value">${this.renderFieldText()}</span>
                    <span class="field-trailing">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V8h14zM7 10h5v5H7z"/></svg>
                    </span>
                </button>
                <span class="field-supporting">MM/DD/YYYY</span>
            </div>
            <div class="docked-menu" ?hidden=${!this.open}>
                <div class=${classMap({ ...this.getRenderClasses(), 'docked': true })} role="dialog" aria-label=${this.supportingText}>
                    ${this.renderElevation()}
                    ${this.displayMode === 'year' ? this.renderYears() : this.displayMode === 'input' ? this.renderInputs() : this.renderCalendar('docked')}
                    ${this.renderActions()}
                </div>
            </div>
        `
    }

    protected handleDialogCancel(event: Event): void {
        event.preventDefault()
        this.handleDismiss()
    }

    protected renderHeadlineText(): string {
        if (this.headline !== '') return this.headline
        if (this.selection === 'range') {
            const short = (millis: number): string => new Date(millis).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
            if (this.pendingStart !== null && this.pendingEnd !== null) return `${short(this.pendingStart)} – ${short(this.pendingEnd)}`
            if (this.pendingStart !== null) return `${short(this.pendingStart)} – …`
            return fromUTCMidnight(this.pendingMonth).year.toString()
        }
        if (this.pendingValue !== null) {
            return new Date(this.pendingValue).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
        }
        const monthParts = fromUTCMidnight(this.pendingMonth)
        return new Date(Date.UTC(monthParts.year, monthParts.month - 1, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    }

    protected renderInputHeadlineText(): string {
        if (this.headline !== '') return this.headline
        return this.selection === 'range' ? 'Enter dates' : 'Enter date'
    }

    protected handleDialogKeydown(event: KeyboardEvent): void {
        if (this.noFocusTrap) return
        if (event.key !== 'Tab' || !this.dialog) return
        const candidates = Array.from(this.dialog.querySelectorAll<HTMLElement>(
            'mdc-button, mdc-icon-button, button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )).filter((el) => el.offsetParent !== null || el === this.dialog?.querySelector('.grid'))
        if (candidates.length === 0) return
        const first = candidates[0]
        const last = candidates[candidates.length - 1]
        if (first === undefined || last === undefined) return
        const active = this.shadowRoot?.activeElement as HTMLElement | null
        if (event.shiftKey && (active === first || active === null)) {
            last.focus()
            event.preventDefault()
        } else if (!event.shiftKey && active === last) {
            first.focus()
            event.preventDefault()
        }
    }

    protected handleGridKeydown(event: KeyboardEvent): void {
        const target = event.target as HTMLElement | null
        const millisAttr = target?.closest?.('[data-millis]')?.getAttribute('data-millis')
        if (millisAttr === null || millisAttr === undefined) return
        const current = Number(millisAttr)
        if (!Number.isInteger(current)) return
        let next: number | null = null
        if (event.key === 'ArrowLeft') next = current - 86400000
        else if (event.key === 'ArrowRight') next = current + 86400000
        else if (event.key === 'ArrowUp') next = current - 7 * 86400000
        else if (event.key === 'ArrowDown') next = current + 7 * 86400000
        else if (event.key === 'Home') next = current - ((new Date(current).getUTCDay() - this.firstDayOfWeek + 7) % 7) * 86400000
        else if (event.key === 'End') next = current + (6 - ((new Date(current).getUTCDay() - this.firstDayOfWeek + 7) % 7)) * 86400000
        else if (event.key === 'PageUp') next = this.pendingMonth
        else if (event.key === 'PageDown') next = this.pendingMonth
        else if (event.key === 'Enter' || event.key === ' ') {
            this.handleDayClick(current)
            event.preventDefault()
            return
        } else return
        if (event.key === 'PageUp' || event.key === 'PageDown') {
            if (event.key === 'PageUp') this.handlePrevMonth()
            else this.handleNextMonth()
            event.preventDefault()
            this.updateComplete.then(() => {
                const firstCell = this.shadowRoot?.querySelector<HTMLElement>('.day:not([disabled])')
                firstCell?.focus()
            })
            return
        }
        if (next === null || !isInRange(next)(this.min, this.max)) return
        event.preventDefault()
        this.updateComplete.then(() => {
            const cell = this.shadowRoot?.querySelector<HTMLElement>(`[data-millis="${next}"]`)
            cell?.focus()
        })
    }

    protected shortMonthName(monthMillis: number): string {
        const parts = fromUTCMidnight(monthMillis)
        return new Date(Date.UTC(parts.year, parts.month - 1, 1)).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
    }

    protected longMonthName(monthMillis: number): string {
        const parts = fromUTCMidnight(monthMillis)
        return new Date(Date.UTC(parts.year, parts.month - 1, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    }

    protected renderModalNav(): unknown {
        return html`
            <div class="nav-row">
                <mdc-button class="menu-button" variant="text" trailing-icon @click=${this.handleShowYear} aria-label="Select year" aria-haspopup="listbox">
                    <span>${this.longMonthName(this.pendingMonth)}</span>
                    <svg slot="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z"/></svg>
                </mdc-button>
                <div class="nav-buttons">
                    <mdc-icon-button variant="standard" @click=${this.handlePrevMonth} aria-label="Previous month">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    </mdc-icon-button>
                    <mdc-icon-button variant="standard" @click=${this.handleNextMonth} aria-label="Next month">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
                    </mdc-icon-button>
                </div>
            </div>
        `
    }

    protected renderDockedNav(): unknown {
        const parts = fromUTCMidnight(this.pendingMonth)
        const currentYear = new Date().getUTCFullYear()
        const minYear = this.min !== null ? fromUTCMidnight(this.min).year : currentYear - 100
        const maxYear = this.max !== null ? fromUTCMidnight(this.max).year : currentYear + 100
        const months: string[] = []
        for (let m = 1; m <= 12; m++) months.push(new Date(Date.UTC(2026, m - 1, 1)).toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' }))
        const years = buildYearList(minYear)(maxYear)
        const isOpen = this.openSubMenu !== null
        const monthActive = this.openSubMenu === 'month'
        const yearActive = this.openSubMenu === 'year'
        const monthGroup = monthActive || !isOpen
            ? html`
                <mdc-button class="menu-button" variant="text" trailing-icon @click=${() => this.toggleSubMenu('month')} aria-label="Select month" aria-haspopup="listbox" aria-expanded=${monthActive ? 'true' : 'false'}>
                    <span>${this.shortMonthName(this.pendingMonth)}</span>
                    <svg slot="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z"/></svg>
                </mdc-button>
            `
            : html`<span class="menu-group-label">${this.shortMonthName(this.pendingMonth)}</span>`
        const yearGroup = yearActive || !isOpen
            ? html`
                <mdc-button class="menu-button" variant="text" trailing-icon @click=${() => this.toggleSubMenu('year')} aria-label="Select year" aria-haspopup="listbox" aria-expanded=${yearActive ? 'true' : 'false'}>
                    <span>${parts.year}</span>
                    <svg slot="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z"/></svg>
                </mdc-button>
            `
            : html`<span class="menu-group-label">${parts.year}</span>`
        return html`
            <div class="nav-row docked-nav">
                <div class="menu-group">
                    ${isOpen ? nothing : html`
                        <mdc-icon-button variant="standard" @click=${this.handlePrevMonth} aria-label="Previous month">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                        </mdc-icon-button>
                    `}
                    ${monthGroup}
                    ${isOpen ? nothing : html`
                        <mdc-icon-button variant="standard" @click=${this.handleNextMonth} aria-label="Next month">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
                        </mdc-icon-button>
                    `}
                </div>
                <div class="menu-group">
                    ${isOpen ? nothing : html`
                        <mdc-icon-button variant="standard" @click=${this.handlePrevYear} aria-label="Previous year">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                        </mdc-icon-button>
                    `}
                    ${yearGroup}
                    ${isOpen ? nothing : html`
                        <mdc-icon-button variant="standard" @click=${this.handleNextYear} aria-label="Next year">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
                        </mdc-icon-button>
                    `}
                </div>
                ${isOpen ? html`
                    <div class="menu" role="listbox" aria-label=${monthActive ? 'Select month' : 'Select year'}>
                        ${monthActive ? months.map((name, index) => {
                            const selected = parts.month === index + 1
                            return html`
                                <button class=${classMap({ 'menu-item': true, 'selected': selected })} @click=${() => this.handleDockedMonthClick(index + 1)} role="option" aria-selected=${selected ? 'true' : 'false'}>
                                    <mdc-ripple></mdc-ripple>
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                    <span>${name}</span>
                                </button>
                            `
                        }) : years.map((year) => {
                            const selected = parts.year === year
                            return html`
                                <button class=${classMap({ 'menu-item': true, 'selected': selected })} @click=${() => this.handleDockedYearClick(year)} role="option" aria-selected=${selected ? 'true' : 'false'}>
                                    <mdc-ripple></mdc-ripple>
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                    <span>${year}</span>
                                </button>
                            `
                        })}
                    </div>
                ` : nothing}
            </div>
        `
    }

    protected handlePrevYear(): void {
        const parts = fromUTCMidnight(this.pendingMonth)
        this.pendingMonth = clampDay(toUTCMidnight({ year: parts.year - 1, month: parts.month, day: 1 }))(this.min, this.max)
    }

    protected handleNextYear(): void {
        const parts = fromUTCMidnight(this.pendingMonth)
        this.pendingMonth = clampDay(toUTCMidnight({ year: parts.year + 1, month: parts.month, day: 1 }))(this.min, this.max)
    }

    protected renderWeekdays(): unknown {
        const weekdayNames: string[] = []
        const baseSunday = Date.UTC(2026, 0, 4)
        for (let i = 0; i < 7; i++) {
            const d = new Date(baseSunday + ((this.firstDayOfWeek + i) % 7) * 86400000)
            weekdayNames.push(d.toLocaleDateString('en-US', { weekday: 'narrow', timeZone: 'UTC' }))
        }
        return html`<div class="weekdays" role="row">${weekdayNames.map((name) => html`<span class="weekday" role="columnheader">${name}</span>`)}</div>`
    }

    protected renderDayGrid(monthMillis: number): unknown {
        const weeks = buildMonthGrid(monthMillis)(this.firstDayOfWeek)((millis) => this.isDayDisabled(millis))
        const label = this.longMonthName(monthMillis)
        return html`
            <div class="grid" role="grid" aria-label=${label} @keydown=${this.handleGridKeydown}>
                ${weeks.map((week) => week.map((cell) => {
            const parts = fromUTCMidnight(cell.millis)
            const column = (new Date(cell.millis).getUTCDay() - this.firstDayOfWeek + 7) % 7
            const isSelected = this.selection === 'single' ? this.pendingValue === cell.millis : cell.millis === this.pendingStart || cell.millis === this.pendingEnd
            const inRange = this.selection === 'range' && this.pendingStart !== null && this.pendingEnd !== null && cell.millis > this.pendingStart && cell.millis < this.pendingEnd
            const isStart = this.selection === 'range' && cell.millis === this.pendingStart
            const isEnd = this.selection === 'range' && cell.millis === this.pendingEnd
            const rangePending = this.selection === 'range' && this.pendingStart !== null && this.pendingEnd === null
            const todayMillis = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())
            const classes = {
                'day': true,
                'outside': !cell.inMonth,
                'selected': isSelected,
                'today': cell.millis === todayMillis,
                'in-range': inRange,
                'range-start': isStart,
                'range-end': isEnd,
                'range-pending': rangePending,
                'col-first': column === 0,
                'col-last': column === 6,
            }
            return html`
                        <button class=${classMap(classes)} data-millis=${cell.millis} ?disabled=${cell.disabled} @click=${() => this.handleDayClick(cell.millis)} role="gridcell" aria-selected=${isSelected ? 'true' : 'false'} aria-label=${`${parts.month}/${parts.day}/${parts.year}`} tabindex=${isSelected || cell.millis === todayMillis ? '0' : '-1'}>
                            <mdc-ripple></mdc-ripple>
                            <span class="day-inner">${parts.day}</span>
                        </button>
                    `
        }))}
            </div>
        `
    }

    protected renderCalendar(mode: 'modal' | 'docked' = 'modal'): unknown {
        return html`
            ${mode === 'docked' ? this.renderDockedNav() : this.renderModalNav()}
            ${this.renderWeekdays()}
            ${this.renderDayGrid(this.pendingMonth)}
        `
    }

    protected renderStackedMonths(count = 6): unknown {
        const months: number[] = []
        for (let i = 0; i < count; i++) months.push(addMonths(this.pendingMonth)(i))
        return html`
            ${months.map((month) => html`
                <p class="stack-month-label">${this.longMonthName(month)}</p>
                ${this.renderDayGrid(month)}
            `)}
        `
    }

    protected renderYears(): unknown {
        const currentYear = new Date().getUTCFullYear()
        const minYear = this.min !== null ? fromUTCMidnight(this.min).year : currentYear - 100
        const maxYear = this.max !== null ? fromUTCMidnight(this.max).year : currentYear + 100
        const years = buildYearList(minYear)(maxYear)
        return html`
            <div class="nav-row">
                <mdc-button class="menu-button" variant="text" trailing-icon @click=${this.handleShowCalendar} aria-label="Back to calendar">
                    <span>${this.longMonthName(this.pendingMonth)}</span>
                    <svg slot="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14l5-5 5 5z"/></svg>
                </mdc-button>
            </div>
            <div class="years" role="listbox" aria-label="Select year">
                ${years.map((year) => {
            const selected = fromUTCMidnight(this.pendingMonth).year === year
            return html`
                        <button class=${classMap({ 'year': true, 'selected': selected, 'today': year === currentYear })} @click=${() => this.handleYearClick(year)} role="option" aria-selected=${selected ? 'true' : 'false'}>
                            <mdc-ripple></mdc-ripple>
                            <span class="year-inner">${year}</span>
                        </button>
                    `
        })}
            </div>
        `
    }

    protected renderInputField(label: string, field: 'start' | 'end'): unknown {
        const text = field === 'start' ? this.inputText : this.inputEndText
        return html`
            <label class="input-field">
                <span class="input-label">${label}</span>
                <input .value=${text} @input=${(e: Event) => {
                if (field === 'start') this.inputText = (e.target as HTMLInputElement).value
                else this.inputEndText = (e.target as HTMLInputElement).value
            }} placeholder="mm/dd/yyyy" aria-label=${label} inputmode="numeric" />
            </label>
        `
    }

    protected renderInputs(): unknown {
        if (this.selection === 'range') {
            return html`
                <div class="input-row">
                    ${this.renderInputField('Date', 'start')}
                    ${this.renderInputField('End date', 'end')}
                </div>
            `
        }
        return html`
            <div class="input-row">
                ${this.renderInputField('Date', 'start')}
            </div>
        `
    }

    protected shouldShowClear(): boolean {
        return this.variant !== 'docked' && this.displayMode !== 'input'
    }

    protected renderActions(): unknown {
        const end = html`
            <span class="actions-end">
                <mdc-button variant="text" @click=${this.handleDismiss}><span>${this.dismissLabel}</span></mdc-button>
                <mdc-button variant="text" @click=${() => { void this.confirm() }}><span>${this.confirmLabel}</span></mdc-button>
            </span>
        `
        if (!this.shouldShowClear()) return html`<div class="actions">${end}</div>`
        return html`
            <div class="actions actions-split">
                <mdc-button variant="text" @click=${this.handleClear}><span>${this.clearLabel}</span></mdc-button>
                ${end}
            </div>
        `
    }

    protected renderDialogBody(): unknown {
        if (this.displayMode === 'year') return this.renderYears()
        if (this.displayMode === 'input') return this.renderInputs()
        return this.renderCalendar('modal')
    }

    protected renderFullscreen(headlineText: string): unknown {
        return html`
            <span aria-hidden="true" class="scrim"></span>
            <dialog class="fullscreen" @cancel=${this.handleDialogCancel} @keydown=${this.handleDialogKeydown} aria-label=${this.supportingText}>
                <div class=${classMap({ ...this.getRenderClasses(), 'fullscreen': true })}>
                    ${this.renderElevation()}
                    <div class="top-bar">
                        <mdc-icon-button variant="standard" @click=${this.handleDismiss} aria-label="Close">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </mdc-icon-button>
                        <mdc-button variant="text" @click=${() => { void this.confirm() }}><span>${this.confirmLabel === 'OK' ? 'Save' : this.confirmLabel}</span></mdc-button>
                    </div>
                    <div class="header header-center">
                        <p class="supporting-text">${this.supportingText}</p>
                        <h2 class="headline">
                            <span>${headlineText}</span>
                            ${this.showModeToggle && this.displayMode !== 'input' ? html`
                                <mdc-icon-button variant="standard" @click=${this.handleToggleMode} aria-label="Switch to input">
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"/></svg>
                                </mdc-icon-button>
                            ` : nothing}
                        </h2>
                    </div>
                    <div class="divider" role="separator"></div>
                    <div class="months">
                        ${this.displayMode === 'input' ? this.renderInputs() : html`
                            ${this.renderWeekdays()}
                            ${this.renderStackedMonths()}
                        `}
                    </div>
                    <div class="divider" role="separator"></div>
                    ${this.renderActions()}
                </div>
            </dialog>
        `
    }

    protected override render(): unknown {
        if (this.variant === 'docked') return this.renderDocked()
        const isInput = this.displayMode === 'input'
        const headlineText = isInput ? this.renderInputHeadlineText() : this.renderHeadlineText()
        if (this.variant === 'fullscreen') return this.renderFullscreen(headlineText)
        return html`
            <span aria-hidden="true" class="scrim"></span>
            <dialog @cancel=${this.handleDialogCancel} @keydown=${this.handleDialogKeydown} aria-label=${this.supportingText}>
                <div class=${classMap(this.getRenderClasses())}>
                    ${this.renderElevation()}
                    <div class="header">
                        <p class="supporting-text">${this.supportingText}</p>
                        <h2 class="headline">
                            <span>${headlineText}</span>
                            ${this.showModeToggle ? html`
                                <mdc-icon-button variant="standard" @click=${this.handleToggleMode} aria-label=${this.displayMode === 'input' ? 'Switch to calendar' : 'Switch to input'}>
                                    ${this.displayMode === 'input' ? html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V8h14z"/></svg>` : html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"/></svg>`}
                                </mdc-icon-button>
                            ` : nothing}
                        </h2>
                    </div>
                    <div class="divider" role="separator"></div>
                    ${this.renderDialogBody()}
                    ${this.renderActions()}
                </div>
            </dialog>
        `
    }
}
