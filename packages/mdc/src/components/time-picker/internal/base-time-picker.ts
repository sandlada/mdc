/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
import type { PropertyValues } from 'lit'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { mixinElevationOptions } from '../../elevation/elevation-options.mixin'
import type { TimePickerOrientation, TimePickerVariant, TimeSelection } from '../time-picker.interface'
import { angleForHour, angleForMinute, angleFromOffset, assertTimeOfDay, formatTimeOfDay, hourFromAngle, hourOfPeriod, isValidHourInput, isValidMinuteInput, minuteFromAngle, pad2, periodOf, withHourOfPeriod, withPeriod, type DayPeriod } from './time-utils'
import { Easing } from '@sandlada/mdk'
import '../../button/index'
import '../../icon-button/index'
import '../../ripple/index'

const HANDLE_SIZE = 48
const RADIUS = 104

const positionForAngle = (angle: number, radius: number): { x: number, y: number } => {
    const theta = (angle * Math.PI) / 180
    return { x: Math.sin(theta) * radius, y: -Math.cos(theta) * radius }
}

export abstract class BaseTimePicker extends composeMixin(
    mixinElevationOptions,
)(LitElement) {
    public static readonly formAssociated = true

    @property({ type: String, reflect: true })
    public variant: TimePickerVariant = 'dial'

    @property({ type: String, reflect: true })
    public orientation: TimePickerOrientation = 'vertical'

    @property({ type: Boolean, reflect: true })
    public open = false

    @property({ type: Boolean })
    public quick = false

    @property({ type: String })
    public headline = 'Select time'

    @property({ type: String, attribute: 'confirm-label' })
    public confirmLabel = 'OK'

    @property({ type: String, attribute: 'dismiss-label' })
    public dismissLabel = 'Cancel'

    @property({ type: Number })
    public hour = 12

    @property({ type: Number })
    public minute = 0

    @property({ type: Boolean, reflect: true, attribute: 'is-24-hour' })
    public is24Hour = false

    @property({ type: String })
    public selection: TimeSelection = 'hour'

    @property({ type: String })
    public period: DayPeriod = 'am'

    @property({ type: Boolean, reflect: true })
    public disabled = false

    @property({ type: String, reflect: true })
    public name = ''

    @property({ type: Boolean, attribute: 'no-focus-trap', reflect: true })
    public noFocusTrap = false

    @state()
    protected pendingHour = 12

    @state()
    protected pendingMinute = 0

    @state()
    protected hourText = '12'

    @state()
    protected minuteText = '00'

    @state()
    protected dragging = false

    /**
     * Accumulated hand rotation in degrees. Unbounded so that CSS
     * transitions always interpolate along the shortest arc between two
     * consecutive positions.
     */
    private runningHandAngle: number | null = null

    @query('dialog')
    protected declare readonly dialog: HTMLDialogElement | null

    @query('.dial')
    protected declare readonly dial: HTMLElement | null

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

    protected getSubmitValue(): string {
        return `${pad2(this.hour)}:${pad2(this.minute)}`
    }

    protected syncFormValue(): void {
        const internals = this.ensureFormInternals()
        if (!internals) return
        internals.setFormValue(this.getSubmitValue())
        internals.setValidity({})
    }

    public formResetCallback(): void {
        this.hour = 12
        this.minute = 0
        this.pendingHour = 12
        this.pendingMinute = 0
        this.period = periodOf(12)
        this.syncTexts()
        this.syncFormValue()
    }

    public formStateRestoreCallback(state: string | File | FormData | null): void {
        if (typeof state !== 'string') return
        const match = /^(\d{1,2}):(\d{2})$/.exec(state.trim())
        if (!match || match[1] === undefined || match[2] === undefined) return
        const hour = Number(match[1])
        const minute = Number(match[2])
        try {
            assertTimeOfDay({ hour, minute })
        } catch {
            return
        }
        this.hour = hour
        this.minute = minute
        this.pendingHour = hour
        this.pendingMinute = minute
        this.period = periodOf(hour)
        this.syncTexts()
        this.syncFormValue()
    }

    protected override updated(changed: PropertyValues): void {
        super.updated(changed)
        if (changed.has('hour') || changed.has('minute')) this.syncFormValue()
    }

    protected getRenderClasses(): Record<string, boolean> {
        return { 'container': true }
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        assertTimeOfDay({ hour: this.hour, minute: this.minute })
        this.pendingHour = this.hour
        this.pendingMinute = this.minute
        this.period = periodOf(this.pendingHour)
        this.syncTexts()
        this.syncFormValue()
    }

    public async show(): Promise<void> {
        if (this.open) return
        const event = new CustomEvent('open', { cancelable: true, bubbles: true, composed: true })
        this.dispatchEvent(event)
        if (event.defaultPrevented) return
        this.open = true
        await this.updateComplete
        if (this.dialog && !this.dialog.open) this.dialog.showModal()
        this.dispatchEvent(new CustomEvent('opened', { bubbles: true, composed: true }))
    }

    public async close(returnValue?: string): Promise<void> {
        if (!this.open) return
        const event = new CustomEvent('close', { cancelable: true, bubbles: true, composed: true })
        this.dispatchEvent(event)
        if (event.defaultPrevented) return
        if (this.dialog?.open) {
            if (returnValue !== undefined) this.dialog.returnValue = returnValue
            this.dialog.close(returnValue)
        }
        this.open = false
        await this.updateComplete
        this.dispatchEvent(new CustomEvent('closed', { bubbles: true, composed: true }))
    }

    public async confirm(): Promise<void> {
        if (this.disabled) throw new Error('Time picker is disabled')
        if (this.variant === 'input') this.commitInputTexts()
        this.hour = this.pendingHour
        this.minute = this.pendingMinute
        this.syncFormValue()
        this.dispatchEvent(new CustomEvent('time-change', { detail: { hour: this.pendingHour, minute: this.pendingMinute }, bubbles: true, composed: true }))
        this.dispatchEvent(new CustomEvent('confirm', { detail: { hour: this.pendingHour, minute: this.pendingMinute }, bubbles: true, composed: true }))
        await this.close('confirmed')
    }

    protected syncTexts(): void {
        if (this.is24Hour) this.hourText = pad2(this.pendingHour)
        else this.hourText = String(hourOfPeriod(this.pendingHour))
        this.minuteText = pad2(this.pendingMinute)
    }

    protected commitInputTexts(): void {
        const hourNum = Number(this.hourText)
        const minuteNum = Number(this.minuteText)
        if (!Number.isInteger(hourNum) || !isValidHourInput(hourNum)(this.is24Hour)) throw new Error('Invalid hour input')
        if (!Number.isInteger(minuteNum) || !isValidMinuteInput(minuteNum)) throw new Error('Invalid minute input')
        if (this.is24Hour) {
            this.pendingHour = hourNum
        } else {
            const base = { hour: this.pendingHour, minute: this.pendingMinute }
            const withH = withHourOfPeriod(base)(hourNum)
            this.pendingHour = withPeriod({ hour: withH.hour, minute: minuteNum })(this.period).hour
        }
        this.pendingMinute = minuteNum
        this.period = periodOf(this.pendingHour)
    }

    protected handlePeriodClick(period: DayPeriod): void {
        if (this.is24Hour) return
        this.period = period
        this.pendingHour = withPeriod({ hour: this.pendingHour, minute: this.pendingMinute })(period).hour
        this.syncTexts()
        this.requestUpdate()
    }

    protected handleSelectionClick(selection: TimeSelection): void {
        this.selection = selection
    }

    protected handleToggleEntry(): void {
        if (this.variant === 'dial') {
            this.syncTexts()
            this.variant = 'input'
        } else {
            this.variant = 'dial'
        }
        this.dispatchEvent(new CustomEvent('entry-mode-change', { detail: { variant: this.variant }, bubbles: true, composed: true }))
    }

    protected handleDismiss(): void {
        this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }))
        void this.close('dismissed')
    }

    protected handleDialogCancel(event: Event): void {
        event.preventDefault()
        this.handleDismiss()
    }

    protected handleDialogKeydown(event: KeyboardEvent): void {
        if (this.noFocusTrap) return
        if (event.key !== 'Tab' || !this.dialog) return
        const candidates = Array.from(this.dialog.querySelectorAll<HTMLElement>(
            'mdc-button, mdc-icon-button, button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )).filter((el) => el.offsetParent !== null)
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

    protected dialValueFromEvent(event: PointerEvent): void {
        if (!this.dial || this.disabled) return
        const rect = this.dial.getBoundingClientRect()
        const x = event.clientX - (rect.left + rect.width / 2)
        const y = event.clientY - (rect.top + rect.height / 2)
        const angle = angleFromOffset(x)(y)
        const dist = Math.hypot(x, y)
        if (this.selection === 'minute') {
            this.pendingMinute = minuteFromAngle(angle)
            this.syncTexts()
        } else {
            if (this.is24Hour) {
                const isInner = dist < RADIUS * 0.72
                this.pendingHour = hourFromAngle(angle)(true, isInner)
            } else {
                this.pendingHour = withHourOfPeriod({ hour: this.pendingHour, minute: this.pendingMinute })(hourFromAngle(angle)(false, false)).hour
                this.period = periodOf(this.pendingHour)
            }
            this.syncTexts()
            if (!this.dragging) this.selection = 'minute'
        }
        this.dispatchEvent(new CustomEvent('time-change', { detail: { hour: this.pendingHour, minute: this.pendingMinute }, bubbles: true, composed: true }))
        this.requestUpdate()
    }

    protected handleDialPointerDown(event: PointerEvent): void {
        if (this.disabled) return
        this.dragging = true
        this.dial?.setPointerCapture(event.pointerId)
        this.dialValueFromEvent(event)
    }

    protected handleDialPointerMove(event: PointerEvent): void {
        if (!this.dragging) return
        this.dialValueFromEvent(event)
    }

    protected handleDialPointerUp(): void {
        this.dragging = false
    }

    protected handleDialKeydown(event: KeyboardEvent): void {
        const step = event.shiftKey ? 6 : 1
        if (this.selection === 'minute') {
            if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
                this.pendingMinute = (this.pendingMinute + step) % 60
                event.preventDefault()
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
                this.pendingMinute = (this.pendingMinute - step + 60) % 60
                event.preventDefault()
            }
        } else {
            if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
                this.pendingHour = (this.pendingHour + 1) % 24
                event.preventDefault()
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
                this.pendingHour = (this.pendingHour + 24 - 1) % 24
                event.preventDefault()
            }
        }
        this.period = periodOf(this.pendingHour)
        this.syncTexts()
        this.requestUpdate()
    }

    protected renderDialLabels(): unknown {
        if (this.selection === 'minute') {
            const labels: number[] = []
            for (let m = 0; m < 60; m += 5) labels.push(m)
            return labels.map((m) => {
                const angle = angleForMinute(m)
                const pos = positionForAngle(angle, RADIUS)
                const selected = m === this.pendingMinute
                return html`
                    <button class=${classMap({ 'dial-label': true, 'selected': selected })} style=${styleMap({ left: `calc(50% + ${pos.x}px - ${HANDLE_SIZE / 2}px)`, top: `calc(50% + ${pos.y}px - ${HANDLE_SIZE / 2}px)` })} @click=${() => { this.pendingMinute = m; this.syncTexts(); this.requestUpdate() }} aria-label=${`${m} minutes`} aria-pressed=${selected ? 'true' : 'false'}>
                        <mdc-ripple></mdc-ripple>
                        ${pad2(m)}
                    </button>
                `
            })
        }
        if (this.is24Hour) {
            const outer = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
            const inner = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
            return html`
                ${outer.map((h) => {
                    const angle = angleForHour(h)(true, false)
                    const pos = positionForAngle(angle, RADIUS)
                    const selected = h === this.pendingHour
                    return html`
                        <button class=${classMap({ 'dial-label': true, 'selected': selected })} style=${styleMap({ left: `calc(50% + ${pos.x}px - ${HANDLE_SIZE / 2}px)`, top: `calc(50% + ${pos.y}px - ${HANDLE_SIZE / 2}px)` })} @click=${() => { this.pendingHour = h; this.period = periodOf(h); this.selection = 'minute'; this.syncTexts(); this.requestUpdate() }} aria-label=${`${h} hours`} aria-pressed=${selected ? 'true' : 'false'}>
                            <mdc-ripple></mdc-ripple>
                            ${h}
                        </button>
                    `
                })}
                ${inner.map((h) => {
                    const angle = angleForHour(h)(true, true)
                    const pos = positionForAngle(angle, RADIUS * 0.55)
                    const selected = h === this.pendingHour
                    return html`
                        <button class=${classMap({ 'dial-label': true, 'selected': selected })} style=${styleMap({ left: `calc(50% + ${pos.x}px - ${HANDLE_SIZE / 2}px)`, top: `calc(50% + ${pos.y}px - ${HANDLE_SIZE / 2}px)` })} @click=${() => { this.pendingHour = h; this.period = periodOf(h); this.selection = 'minute'; this.syncTexts(); this.requestUpdate() }} aria-label=${`${h} hours`} aria-pressed=${selected ? 'true' : 'false'}>
                            <mdc-ripple></mdc-ripple>
                            ${h}
                        </button>
                    `
                })}
            `
        }
        const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        return hours.map((h) => {
            const angle = angleForHour(h)(false)
            const pos = positionForAngle(angle, RADIUS)
            const selected = hourOfPeriod(this.pendingHour) === h
            return html`
                <button class=${classMap({ 'dial-label': true, 'selected': selected })} style=${styleMap({ left: `calc(50% + ${pos.x}px - ${HANDLE_SIZE / 2}px)`, top: `calc(50% + ${pos.y}px - ${HANDLE_SIZE / 2}px)` })} @click=${() => { this.pendingHour = withHourOfPeriod({ hour: this.pendingHour, minute: this.pendingMinute })(h).hour; this.selection = 'minute'; this.syncTexts(); this.requestUpdate() }} aria-label=${`${h} o'clock`} aria-pressed=${selected ? 'true' : 'false'}>
                    <mdc-ripple></mdc-ripple>
                    ${h}
                </button>
            `
        })
    }

    protected renderDial(): unknown {
        const hourLabel = this.is24Hour ? pad2(this.pendingHour) : String(hourOfPeriod(this.pendingHour))
        const minuteLabel = pad2(this.pendingMinute)
        const targetAngle = this.selection === 'minute' ? angleForMinute(this.pendingMinute) : angleForHour(this.pendingHour)(this.is24Hour)
        const hand = this.resolveHandAngle(targetAngle)
        // 24h inner-ring hours (1..12) sit closer to the center: the hand
        // must stop at the handle instead of poking out to the outer ring.
        const isInner = this.is24Hour && this.selection === 'hour' && this.pendingHour >= 1 && this.pendingHour <= 12
        const trackLength = isInner ? RADIUS * 0.55 : RADIUS
        return html`
            <div class=${classMap({ 'dial': true, 'dragging': this.dragging })} role="radiogroup" aria-label=${this.selection === 'minute' ? 'Select minutes' : 'Select hours'} tabindex="0"
                @pointerdown=${this.handleDialPointerDown} @pointermove=${this.handleDialPointerMove} @pointerup=${this.handleDialPointerUp} @keydown=${this.handleDialKeydown}>
                <div class="dial-track" style=${styleMap({ height: `${trackLength}px`, transform: `translateX(-50%) rotate(${hand + 180}deg)` })}>
                    <span class="dial-handle" aria-hidden="true" style=${styleMap({ transform: `translateX(-50%) rotate(${-(hand + 180)}deg)` })}>${this.selection === 'minute' ? minuteLabel : hourLabel}</span>
                </div>
                ${this.renderDialLabels()}
                <div class="dial-center"></div>
            </div>
        `
    }

    /**
     * Moves the running hand angle to the closest equivalent of the target
     * angle so that CSS transitions rotate along the shortest arc instead of
     * sweeping the long way around the dial.
     */
    private resolveHandAngle(target: number): number {
        if (this.runningHandAngle === null) {
            this.runningHandAngle = target
            return target
        }
        let delta = (target - this.runningHandAngle) % 360
        if (delta > 180) delta -= 360
        if (delta < -180) delta += 360
        this.runningHandAngle += delta
        return this.runningHandAngle
    }

    protected renderSelectors(): unknown {
        const hourLabel = this.is24Hour ? pad2(this.pendingHour) : String(hourOfPeriod(this.pendingHour))
        const minuteLabel = pad2(this.pendingMinute)
        return html`
            <div class="selectors">
                <div class="time-selectors">
                    <button class=${classMap({ 'time-cell': true, 'selected': this.selection === 'hour' })} @click=${() => this.handleSelectionClick('hour')} aria-label="Select hour" aria-pressed=${this.selection === 'hour' ? 'true' : 'false'}>
                        <mdc-ripple></mdc-ripple>
                        ${hourLabel}
                    </button>
                    <span class="separator" aria-hidden="true">:</span>
                    <button class=${classMap({ 'time-cell': true, 'selected': this.selection === 'minute' })} @click=${() => this.handleSelectionClick('minute')} aria-label="Select minute" aria-pressed=${this.selection === 'minute' ? 'true' : 'false'}>
                        <mdc-ripple></mdc-ripple>
                        ${minuteLabel}
                    </button>
                </div>
                ${this.is24Hour ? nothing : html`
                    <div class="period" role="group" aria-label="Select AM or PM">
                        <button class=${classMap({ 'period-button': true, 'selected': this.period === 'am' })} @click=${() => this.handlePeriodClick('am')} aria-pressed=${this.period === 'am' ? 'true' : 'false'}>
                            <mdc-ripple></mdc-ripple>
                            AM
                        </button>
                        <button class=${classMap({ 'period-button': true, 'selected': this.period === 'pm' })} @click=${() => this.handlePeriodClick('pm')} aria-pressed=${this.period === 'pm' ? 'true' : 'false'}>
                            <mdc-ripple></mdc-ripple>
                            PM
                        </button>
                    </div>
                `}
            </div>
        `
    }

    protected renderInputs(): unknown {
        return html`
            <div class="inputs">
                <div class="input-field">
                    <input class="input-cell" .value=${this.hourText} @input=${(e: Event) => { this.hourText = (e.target as HTMLInputElement).value }} inputmode="numeric" aria-label="Hour" />
                    <span class="input-label">Hour</span>
                </div>
                <span class="separator" aria-hidden="true">:</span>
                <div class="input-field">
                    <input class="input-cell" .value=${this.minuteText} @input=${(e: Event) => { this.minuteText = (e.target as HTMLInputElement).value }} inputmode="numeric" aria-label="Minute" />
                    <span class="input-label">Minute</span>
                </div>
                ${this.is24Hour ? nothing : html`
                    <div class="period" role="group" aria-label="Select AM or PM">
                        <button class=${classMap({ 'period-button': true, 'selected': this.period === 'am' })} @click=${() => this.handlePeriodClick('am')} aria-pressed=${this.period === 'am' ? 'true' : 'false'}>
                            <mdc-ripple></mdc-ripple>
                            AM
                        </button>
                        <button class=${classMap({ 'period-button': true, 'selected': this.period === 'pm' })} @click=${() => this.handlePeriodClick('pm')} aria-pressed=${this.period === 'pm' ? 'true' : 'false'}>
                            <mdc-ripple></mdc-ripple>
                            PM
                        </button>
                    </div>
                `}
            </div>
        `
    }

    protected override render(): unknown {
        return html`
            <span aria-hidden="true" class="scrim"></span>
            <dialog @cancel=${this.handleDialogCancel} @keydown=${this.handleDialogKeydown} aria-label=${this.headline}>
                <div class=${classMap(this.getRenderClasses())}>
                    ${this.renderElevation()}
                    <h2 class="headline">${this.headline}</h2>
                    <div class="body">
                        <div class="selectors-column">
                            ${this.variant === 'input' ? this.renderInputs() : this.renderSelectors()}
                        </div>
                        ${this.variant === 'dial' ? this.renderDial() : nothing}
                    </div>
                    <div class="actions">
                        <mdc-icon-button class="entry-toggle" variant="filled" @click=${this.handleToggleEntry} aria-label=${this.variant === 'dial' ? 'Switch to text input' : 'Switch to dial'}>
                            ${this.variant === 'dial' ? html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V6h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>` : html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`}
                        </mdc-icon-button>
                        <span class="actions-spacer"></span>
                        <mdc-button variant="text" @click=${this.handleDismiss}><span>${this.dismissLabel}</span></mdc-button>
                        <mdc-button variant="text" @click=${() => { void this.confirm() }}><span>${this.confirmLabel}</span></mdc-button>
                    </div>
                </div>
            </dialog>
        `
    }
}
