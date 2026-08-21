/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, isServer, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, state } from 'lit/decorators.js'
import { live } from 'lit/directives/live.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import {
    createValidator,
    getValidityAnchor,
    mixinConstraintValidation,
} from '../../../utils/behaviors/constraint-validation'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import {
    type InputState,
    type TextAreaState,
    TextFieldValidator,
} from '../../../utils/behaviors/validators/text-field-validator'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import { redispatchEvent } from '../../../utils/event/redispatch-event'
import {
    getFormState,
    getFormValue,
    mixinFormAssociated,
} from '../../../utils/form/form-associated'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import type { MDCField } from '../../field/field'
import '../../field/field'
import {
    type FieldVariant,
    type FloatingLabelBehavior,
    type ITextField,
    type TextFieldType,
} from '../text-field.interface'
import { textFieldStyles } from '../text-field.style'

/**
 * Abstract base for `mdc-text-field`.
 *
 * Implements full form-association, constraint validation, standard input
 * properties, methods, and renders native `<input>` or `<textarea>` inside
 * `mdc-field` chrome.
 *
 * Mixin composition (abstract -> concrete):
 * - `mixinDelegatesAria`
 * - `mixinConstraintValidation`
 * - `mixinFormAssociated`
 * - `mixinElementInternals`
 * - `mixinFocusRingOptions`
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/text-fields/overview
 */
export abstract class BaseTextField extends composeMixin(
    mixinDelegatesAria,
    mixinConstraintValidation,
    mixinFormAssociated,
    mixinElementInternals,
    mixinFocusRingOptions,
)(LitElement) implements ITextField {

    public static override styles = textFieldStyles

    public static override shadowRootOptions: ShadowRootInit = {
        mode: 'open',
        delegatesFocus: true,
    }

    declare name: string
    declare disabled: boolean

    @property({ type: String, reflect: true })
    public variant: FieldVariant = 'filled'

    @property({ type: String })
    public value: string = ''

    @property({ type: String, reflect: true })
    public type: TextFieldType = 'text'

    @property({ type: String })
    public label: string = ''

    @property({ type: String })
    public placeholder: string = ''

    @property({ type: String, attribute: 'supporting-text' })
    public supportingText: string = ''

    @property({ type: String, attribute: 'error-text' })
    public errorText: string = ''

    @property({ type: Boolean, reflect: true })
    public error: boolean = false

    @property({ type: String, attribute: 'prefix-text' })
    public prefixText: string = ''

    @property({ type: String, attribute: 'suffix-text' })
    public suffixText: string = ''

    @property({ type: Boolean, reflect: true })
    public required: boolean = false

    @property({ type: Boolean, attribute: 'no-asterisk', reflect: true })
    public noAsterisk: boolean = false

    @property({ type: Boolean, attribute: 'readonly', reflect: true })
    public readOnly: boolean = false

    @property({ type: String })
    public min: string = ''

    @property({ type: String })
    public max: string = ''

    @property({ type: String })
    public step: string = ''

    @property({ type: String })
    public pattern: string = ''

    @property({ type: Number, attribute: 'minlength' })
    public minLength: number = -1

    @property({ type: Number, attribute: 'maxlength' })
    public maxLength: number = -1

    @property({ type: String })
    public autocomplete: string = ''

    @property({ type: Boolean, reflect: true })
    public override autofocus: boolean = false

    @property({ type: String, attribute: 'inputmode' })
    public override inputMode: string = ''

    @property({ type: Number })
    public rows: number = 2

    @property({ type: Number })
    public cols: number = 20

    @property({ type: Boolean, reflect: true })
    public clearable: boolean = false

    @property({ type: Boolean, reflect: true })
    public counter: boolean = false

    @property({ type: String, attribute: 'counter-text' })
    public counterText: string = ''

    @property({ type: String, attribute: 'floating-label-behavior' })
    public floatingLabelBehavior: FloatingLabelBehavior = 'auto'

    @property({ type: Boolean, attribute: 'align-end', reflect: true })
    public alignEnd: boolean = false

    @property({ type: Boolean, attribute: 'auto-validate' })
    public autoValidate: boolean = false

    @state()
    protected focused: boolean = false

    @state()
    protected nativeError: boolean = false

    @query('.input')
    protected readonly inputElement!: HTMLInputElement | HTMLTextAreaElement | null

    @query('.field')
    protected readonly fieldElement!: MDCField | null

    public override get focusRingControl(): HTMLElement | null {
        return this.inputElement ?? null
    }

    public override focus(options?: FocusOptions): void {
        this.inputElement?.focus(options)
    }

    public override blur(): void {
        this.inputElement?.blur()
    }

    public select(): void {
        this.inputElement?.select()
    }

    public setSelectionRange(
        start: number,
        end: number,
        direction?: 'forward' | 'backward' | 'none',
    ): void {
        this.inputElement?.setSelectionRange(start, end, direction)
    }

    public setRangeText(
        replacement: string,
        start?: number,
        end?: number,
        selectionMode?: 'select' | 'start' | 'end' | 'preserve',
    ): void {
        if (!this.inputElement) return
        if (start !== undefined && end !== undefined && selectionMode !== undefined) {
            this.inputElement.setRangeText(replacement, start, end, selectionMode)
        } else if (start !== undefined && end !== undefined) {
            this.inputElement.setRangeText(replacement, start, end)
        } else {
            this.inputElement.setRangeText(replacement)
        }
        this.value = this.inputElement.value
    }

    public stepUp(n?: number): void {
        if (this.inputElement instanceof HTMLInputElement) {
            this.inputElement.stepUp(n)
            this.value = this.inputElement.value
        }
    }

    public stepDown(n?: number): void {
        if (this.inputElement instanceof HTMLInputElement) {
            this.inputElement.stepDown(n)
            this.value = this.inputElement.value
        }
    }

    public showPicker(): void {
        if (this.inputElement instanceof HTMLInputElement && 'showPicker' in this.inputElement) {
            (this.inputElement as HTMLInputElement).showPicker()
        }
    }

    public reset(): void {
        this.value = this.getAttribute('value') ?? ''
        this.nativeError = false
    }

    public get selectionStart(): number | null {
        return this.inputElement?.selectionStart ?? null
    }
    public set selectionStart(value: number | null) {
        if (this.inputElement) {
            this.inputElement.selectionStart = value
        }
    }

    public get selectionEnd(): number | null {
        return this.inputElement?.selectionEnd ?? null
    }
    public set selectionEnd(value: number | null) {
        if (this.inputElement) {
            this.inputElement.selectionEnd = value
        }
    }

    public get selectionDirection(): 'forward' | 'backward' | 'none' | null {
        return (this.inputElement?.selectionDirection as 'forward' | 'backward' | 'none') ?? null
    }
    public set selectionDirection(value: 'forward' | 'backward' | 'none' | null) {
        if (this.inputElement && value) {
            this.inputElement.selectionDirection = value
        }
    }

    public get valueAsNumber(): number {
        if (this.inputElement instanceof HTMLInputElement) {
            return this.inputElement.valueAsNumber
        }
        return Number(this.value)
    }
    public set valueAsNumber(value: number) {
        if (this.inputElement instanceof HTMLInputElement) {
            this.inputElement.valueAsNumber = value
            this.value = this.inputElement.value
        }
    }

    public get valueAsDate(): Date | null {
        if (this.inputElement instanceof HTMLInputElement) {
            return this.inputElement.valueAsDate
        }
        return null
    }
    public set valueAsDate(value: Date | null) {
        if (this.inputElement instanceof HTMLInputElement) {
            this.inputElement.valueAsDate = value
            this.value = this.inputElement.value
        }
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (this.hasAttribute('value') && !this.value) {
            this.value = this.getAttribute('value') ?? ''
        }
    }

    protected override update(changedProperties: PropertyValues<this>): void {
        if (changedProperties.has('value') && this.inputElement) {
            if (this.inputElement.value !== this.value) {
                this.inputElement.value = this.value
            }
        }
        super.update(changedProperties)
    }

    // ── Form Association ────────────────────────────────────────────────────

    public override [getFormValue](): string | null {
        return this.value
    }

    public override [getFormState](): string {
        return this.value
    }

    public override formResetCallback(): void {
        this.reset()
    }

    public override formStateRestoreCallback(state: string): void {
        this.value = state
    }

    public override formDisabledCallback(disabled: boolean): void {
        this.disabled = disabled
    }

    // ── Constraint Validation ───────────────────────────────────────────────

    public override [createValidator](): TextFieldValidator {
        return new TextFieldValidator(() => ({
            state: this.getValidationState(),
            renderedControl: this.inputElement,
        }))
    }

    public override [getValidityAnchor](): HTMLElement | null {
        return this.inputElement
    }

    private getValidationState(): InputState | TextAreaState {
        if (this.type === 'textarea') {
            return {
                type: 'textarea',
                value: this.value,
                required: this.required,
                minLength: this.minLength,
                maxLength: this.maxLength,
            }
        }

        return {
            type: this.type,
            value: this.value,
            required: this.required,
            pattern: this.pattern,
            min: this.min,
            max: this.max,
            step: this.step,
            minLength: this.minLength,
            maxLength: this.maxLength,
        }
    }

    // ── Computed Helpers ───────────────────────────────────────────────────

    public isPopulated(): boolean {
        return this.value.length > 0 || (this.inputElement?.value?.length ?? 0) > 0
    }

    public isInvalid(): boolean {
        return this.error || this.nativeError || (this.autoValidate && !this.validity.valid)
    }

    public getErrorText(): string {
        if (this.errorText) return this.errorText
        if (!this.validity.valid) return this.validationMessage
        return ''
    }

    public getComputedCounterText(): string {
        if (this.counterText) return this.counterText
        if (this.counter && this.maxLength > 0) {
            return `${this.value.length} / ${this.maxLength}`
        }
        if (this.counter) {
            return `${this.value.length}`
        }
        return ''
    }

    // ── Render ─────────────────────────────────────────────────────────────

    protected override render(): TemplateResult {
        return html`
            <mdc-field
                class="field"
                part="field"
                .variant=${this.variant}
                .label=${this.label}
                .supportingText=${this.supportingText}
                .errorText=${this.getErrorText()}
                .prefixText=${this.prefixText}
                .suffixText=${this.suffixText}
                .counterText=${this.getComputedCounterText()}
                .disabled=${this.disabled}
                .required=${this.required}
                .noAsterisk=${this.noAsterisk}
                .populated=${this.isPopulated()}
                .focused=${this.focused}
                .invalid=${this.isInvalid()}
                .floatingLabelBehavior=${this.floatingLabelBehavior}
                .alignEnd=${this.alignEnd}
                .multiline=${this.type === 'textarea'}
                .resizable=${this.type === 'textarea'}
            >
                <slot name="leading-icon" slot="leading-icon"></slot>
                <slot name="prefix" slot="prefix"></slot>

                ${this.renderInputOrTextarea()}

                ${this.clearable && this.value.length > 0 && !this.disabled && !this.readOnly ? html`
                    <span class="clear-button-wrapper" slot="trailing-icon">
                        <button
                            type="button"
                            class="clear-button"
                            aria-label="Clear text"
                            tabindex="-1"
                            @click=${this.handleClearClick}
                        >
                            <svg class="clear-icon" viewBox="0 0 24 24">
                                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </span>
                ` : nothing}

                <slot name="trailing-icon" slot="trailing-icon"></slot>
                <slot name="supporting-text" slot="supporting-text"></slot>
                <slot name="counter" slot="counter"></slot>
            </mdc-field>
        `
    }

    protected renderInputOrTextarea(): TemplateResult {
        const { ariaInvalid, ariaLabel, ariaAutoComplete } = this as AriaMixinStrict

        if (this.type === 'textarea') {
            return html`
                <textarea
                    id="input"
                    class="input"
                    part="input"
                    .value=${live(this.value)}
                    ?disabled=${this.disabled}
                    ?required=${this.required}
                    ?readonly=${this.readOnly}
                    placeholder=${this.placeholder || nothing}
                    minlength=${this.minLength > -1 ? this.minLength : nothing}
                    maxlength=${this.maxLength > -1 ? this.maxLength : nothing}
                    autocomplete=${this.autocomplete || nothing}
                    inputmode=${this.inputMode || nothing}
                    rows=${this.rows}
                    cols=${this.cols}
                    aria-label=${ariaLabel || this.label || nothing}
                    aria-invalid=${ariaInvalid || (this.isInvalid() ? 'true' : nothing)}
                    @input=${this.handleInput}
                    @change=${this.handleChange}
                    @focus=${this.handleFocus}
                    @blur=${this.handleBlur}
                    @select=${this.handleSelect}
                ></textarea>
            `
        }

        return html`
            <input
                id="input"
                class="input"
                part="input"
                type=${this.type}
                .value=${live(this.value)}
                ?disabled=${this.disabled}
                ?required=${this.required}
                ?readonly=${this.readOnly}
                placeholder=${this.placeholder || nothing}
                min=${this.min || nothing}
                max=${this.max || nothing}
                step=${this.step || nothing}
                pattern=${this.pattern || nothing}
                minlength=${this.minLength > -1 ? this.minLength : nothing}
                maxlength=${this.maxLength > -1 ? this.maxLength : nothing}
                autocomplete=${this.autocomplete || nothing}
                ?autofocus=${this.autofocus}
                inputmode=${this.inputMode || nothing}
                aria-label=${ariaLabel || this.label || nothing}
                aria-invalid=${ariaInvalid || (this.isInvalid() ? 'true' : nothing)}
                aria-autocomplete=${ariaAutoComplete || nothing}
                @input=${this.handleInput}
                @change=${this.handleChange}
                @focus=${this.handleFocus}
                @blur=${this.handleBlur}
                @select=${this.handleSelect}
            />
        `
    }

    // ── Event Handlers ─────────────────────────────────────────────────────

    protected handleInput(event: Event): void {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement
        this.value = target.value
        this.nativeError = !this.checkValidity()
    }

    protected handleChange(event: Event): void {
        const target = event.target as HTMLInputElement | HTMLTextAreaElement
        this.value = target.value
        this.nativeError = !this.checkValidity()
        redispatchEvent(this, event)
    }

    protected handleFocus(): void {
        this.focused = true
    }

    protected handleBlur(): void {
        this.focused = false
        if (this.autoValidate) {
            this.nativeError = !this.reportValidity()
        }
    }

    protected handleSelect(event: Event): void {
        redispatchEvent(this, event)
    }

    protected handleClearClick(event: MouseEvent): void {
        event.preventDefault()
        event.stopPropagation()
        this.value = ''
        this.nativeError = false
        this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
        this.dispatchEvent(new Event('change', { bubbles: true }))
        this.focus()
    }
}
