/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { autoUpdate, computePosition, flip, offset, shift, size, type Middleware } from '@floating-ui/dom'
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../../utils/aria/aria'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import {
    CreateValidator,
    GetValidityAnchor,
    mixinConstraintValidation,
} from '../../../utils/behaviors/constraint-validation'
import { mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { SelectValidator } from '../../../utils/behaviors/validators/select-validator'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import {
    GetFormState,
    GetFormValue,
    mixinFormAssociated,
} from '../../../utils/form'
import { mixinElevationOptions } from '../../elevation/elevation-options.mixin'
import '../../field/field'
import type { MDCField } from '../../field/field'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import {
    type FieldVariant,
    type FloatingLabelBehavior,
    type IMDCSelect,
    type IMDCSelectMenuEventDetail,
    type IMDCSelectOption,
    SelectMenuColorStyle,
    SelectMenuPlacement,
    SelectOptionRequestSelectionEvent,
} from '../select.interface'
import { SelectStyles } from '../select.style'

const ValidVariants: readonly string[] = ['filled', 'outlined']
const ValidMenuPlacements: readonly string[] = Object.values(SelectMenuPlacement)
const ValidMenuColorStyles: readonly string[] = Object.values(SelectMenuColorStyle)

const MenuOffsetPx = 4
const MenuShiftPaddingPx = 8
const MenuMaxHeightPx = 320

/**
 * Abstract base for `mdc-select`.
 *
 * Implements Material Design 3 / Android Exposed Dropdown Menu semantics:
 * `mdc-field` chrome, `role="combobox"` trigger, floating `role="listbox"`
 * menu positioned via `@floating-ui/dom`, keyboard navigation + typeahead,
 * form association, and constraint validation via `SelectValidator`.
 */
export abstract class BaseSelect extends composeMixin(
    mixinDelegatesAria,
    mixinConstraintValidation,
    mixinFormAssociated,
    mixinElementInternals,
    mixinFocusRingOptions,
    mixinElevationOptions,
)(LitElement) implements IMDCSelect {

    public static override styles = SelectStyles

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

    @property({ type: Number, attribute: 'selected-index' })
    public selectedIndex: number = -1

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

    @property({ type: Boolean, reflect: true })
    public open: boolean = false

    @property({ type: Boolean, reflect: true })
    public quick: boolean = false

    @property({ type: String, attribute: 'floating-label-behavior' })
    public floatingLabelBehavior: FloatingLabelBehavior = 'auto'

    @property({ type: Boolean, attribute: 'align-end', reflect: true })
    public alignEnd: boolean = false

    @property({ type: Boolean, attribute: 'clamp-menu-width', reflect: true })
    public clampMenuWidth: boolean = false

    @property({ type: String, attribute: 'menu-placement', reflect: true })
    public menuPlacement: SelectMenuPlacement = SelectMenuPlacement.BottomStart

    @property({ type: String, attribute: 'menu-color-style', reflect: true })
    public menuColorStyle: SelectMenuColorStyle = SelectMenuColorStyle.Standard

    @property({ type: Number, attribute: 'typeahead-delay' })
    public typeaheadDelay: number = 500

    @property({ type: Boolean, attribute: 'auto-validate' })
    public autoValidate: boolean = false

    @state()
    protected focused: boolean = false

    @state()
    protected nativeError: boolean = false

    @state()
    protected displayTextState: string = ''

    @state()
    protected activeIndex: number = -1

    @state()
    private resolvedPlacement: string = SelectMenuPlacement.BottomStart

    @query('.field')
    protected readonly fieldElement!: MDCField | null

    @query('.field-trigger')
    protected readonly triggerElement!: HTMLElement | null

    @query('.menu')
    protected readonly menuElement!: HTMLElement | null

    @queryAssignedElements({ flatten: true })
    private readonly assignedOptions!: HTMLElement[]

    private cleanupAutoUpdate: (() => void) | null = null
    private dismissAttached = false
    private typeaheadBuffer = ''
    private typeaheadTimer: ReturnType<typeof setTimeout> | null = null
    private initialValue: string | null = null
    private hasInitializedOptions = false

    public override get focusRingControl(): HTMLElement | null {
        return this.triggerElement ?? null
    }

    public get options(): IMDCSelectOption[] {
        const directChildren = Array.from(this.children).filter(
            (el): el is HTMLElement & IMDCSelectOption => el.tagName === 'MDC-SELECT-OPTION',
        )
        if (directChildren.length > 0) {
            return directChildren
        }
        return (this.assignedOptions ?? []).filter(
            (el): el is HTMLElement & IMDCSelectOption => el.tagName === 'MDC-SELECT-OPTION',
        )
    }

    public get selectedOptions(): IMDCSelectOption[] {
        return this.options.filter((option) => option.selected)
    }

    public get displayText(): string {
        return this.displayTextState
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        if (this.initialValue === null) {
            this.initialValue = this.getAttribute('value')
        }
        if (this.hasAttribute('value') && !this.value) {
            this.value = this.getAttribute('value') ?? ''
        }
        this.addEventListener(SelectOptionRequestSelectionEvent, this.handleOptionRequestSelection)
    }

    public override disconnectedCallback(): void {
        super.disconnectedCallback()
        this.removeEventListener(SelectOptionRequestSelectionEvent, this.handleOptionRequestSelection)
        this.stopPositionTracking()
        this.detachDismissListeners()
        this.clearTypeahead()
    }

    public override focus(options?: FocusOptions): void {
        this.triggerElement?.focus(options)
    }

    public override blur(): void {
        this.triggerElement?.blur()
    }

    public async show(): Promise<void> {
        if (this.open || this.disabled) {
            return
        }
        const opening = new CustomEvent<IMDCSelectMenuEventDetail>('opening', {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: { select: this },
        })
        this.dispatchEvent(opening)
        if (opening.defaultPrevented) {
            return
        }

        this.open = true
        if (this.isConnected) {
            await this.updateComplete
        }
        this.setInitialActiveOption()
        this.startPositionTracking()
        this.attachDismissListeners()
        this.scrollActiveOptionIntoView()

        this.dispatchEvent(new CustomEvent<IMDCSelectMenuEventDetail>('opened', {
            bubbles: true,
            composed: true,
            detail: { select: this },
        }))
    }

    public async close(): Promise<void> {
        if (!this.open) {
            return
        }
        const closing = new CustomEvent<IMDCSelectMenuEventDetail>('closing', {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: { select: this },
        })
        this.dispatchEvent(closing)
        if (closing.defaultPrevented) {
            return
        }

        this.open = false
        this.clearActiveOption()
        this.stopPositionTracking()
        this.detachDismissListeners()
        if (this.isConnected) {
            await this.updateComplete
        }

        this.dispatchEvent(new CustomEvent<IMDCSelectMenuEventDetail>('closed', {
            bubbles: true,
            composed: true,
            detail: { select: this },
        }))
    }

    public selectIndex(index: number): void {
        const opts = this.options
        if (index < 0 || index >= opts.length) {
            this.applySelection(-1, false)
            return
        }
        this.applySelection(index, false)
    }

    public select(value: string): void {
        const opts = this.options
        const index = opts.findIndex((option) => option.value === value)
        this.applySelection(index, false)
    }

    public reset(): void {
        const opts = this.options
        if (this.initialValue !== null) {
            const idx = opts.findIndex((option) => option.value === this.initialValue)
            if (idx >= 0) {
                this.applySelection(idx, false)
            } else {
                this.value = this.initialValue
                this.selectedIndex = -1
                this.displayTextState = ''
                this.syncOptionsFromValue()
            }
        } else {
            this.value = ''
            this.selectedIndex = -1
            this.displayTextState = ''
            for (const option of opts) {
                option.selected = false
            }
        }
        this.nativeError = false
    }

    // ── Form Association ────────────────────────────────────────────────────

    public override [GetFormValue](): string | null {
        return this.disabled ? null : this.value
    }

    public override [GetFormState](): string {
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

    public override [CreateValidator](): SelectValidator {
        return new SelectValidator(() => ({
            value: this.value,
            required: this.required,
        }))
    }

    public override [GetValidityAnchor](): HTMLElement | null {
        return this.triggerElement ?? null
    }

    // ── Lifecycle ───────────────────────────────────────────────────────────

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)

        if (!ValidVariants.includes(this.variant)) {
            throw new Error(`[mdc-select] Unsupported variant "${String(this.variant)}". Supported variants are "filled" | "outlined".`)
        }
        if (!ValidMenuPlacements.includes(this.menuPlacement)) {
            throw new Error(`[mdc-select] Unsupported menuPlacement "${String(this.menuPlacement)}".`)
        }
        if (!ValidMenuColorStyles.includes(this.menuColorStyle)) {
            throw new Error(`[mdc-select] Unsupported menuColorStyle "${String(this.menuColorStyle)}". Supported values are "standard" | "vibrant".`)
        }

        if (this.hasUpdated) {
            if (changedProperties.has('value') && !changedProperties.has('selectedIndex')) {
                this.syncOptionsFromValue()
            } else if (changedProperties.has('selectedIndex')) {
                this.syncOptionsFromIndex()
            }
        }

        if (changedProperties.has('disabled') && this.disabled && this.open) {
            void this.close()
        }
    }

    protected override firstUpdated(changedProperties: PropertyValues<this>): void {
        super.firstUpdated(changedProperties)
        this.handleSlotChange()
    }

    protected override updated(changedProperties: PropertyValues<this>): void {
        super.updated(changedProperties)

        if (changedProperties.has('menuColorStyle')) {
            this.propagateColorStyleToOptions()
        }
        if (changedProperties.has('open')) {
            if (this.open) {
                this.showMenuPopover()
                this.startPositionTracking()
                this.attachDismissListeners()
            } else {
                this.hideMenuPopover()
                this.stopPositionTracking()
                this.detachDismissListeners()
            }
        }
    }

    // ── Computed Helpers ───────────────────────────────────────────────────

    public isPopulated(): boolean {
        return this.displayTextState.length > 0 || this.value.length > 0 || this.open
    }

    public isInvalid(): boolean {
        return this.error || this.nativeError || (this.autoValidate && !this.validity.valid)
    }

    public getErrorText(): string {
        if (this.errorText) {
            return this.errorText
        }
        if (!this.validity.valid) {
            return this.validationMessage
        }
        return ''
    }

    // ── Render ──────────────────────────────────────────────────────────────

    protected override render(): TemplateResult {
        const { ariaInvalid, ariaLabel } = this as AriaMixinStrict
        const showPlaceholder = !this.displayTextState && Boolean(this.placeholder)
        const textToShow = this.displayTextState || (this.open || this.floatingLabelBehavior === 'always' ? this.placeholder : '')

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
                .disabled=${this.disabled}
                .required=${this.required}
                .noAsterisk=${this.noAsterisk}
                .populated=${this.isPopulated()}
                .focused=${this.focused || this.open}
                .invalid=${this.isInvalid()}
                .floatingLabelBehavior=${this.floatingLabelBehavior}
                .alignEnd=${this.alignEnd}
                @click=${this.handleFieldClick}
                @field-label-pointer=${this.handleFieldLabelPointer}
            >
                <slot name="leading-icon" slot="leading-icon"></slot>
                <slot name="prefix" slot="prefix"></slot>

                <div
                    id="trigger"
                    class="field-trigger"
                    part="trigger"
                    role="combobox"
                    tabindex=${this.disabled ? -1 : 0}
                    aria-haspopup="listbox"
                    aria-expanded=${this.open ? 'true' : 'false'}
                    aria-controls="listbox"
                    aria-disabled=${this.disabled ? 'true' : 'false'}
                    aria-required=${this.required ? 'true' : 'false'}
                    aria-invalid=${ariaInvalid || (this.isInvalid() ? 'true' : nothing)}
                    aria-label=${ariaLabel || this.label || nothing}
                    @focus=${this.handleTriggerFocus}
                    @blur=${this.handleTriggerBlur}
                    @keydown=${this.handleTriggerKeydown}
                >
                    <span class="display-text ${classMap({ placeholder: showPlaceholder })}">
                        ${textToShow}
                    </span>
                </div>

                <slot name="suffix" slot="suffix"></slot>
                <span class="dropdown-icon-slot" slot="trailing-icon">
                    <slot name="trailing-icon">
                        ${this.renderDropdownArrow()}
                    </slot>
                </span>
                <slot name="supporting-text" slot="supporting-text"></slot>
            </mdc-field>

            <div
                id="listbox"
                class="menu ${classMap({ open: this.open, quick: this.quick })}"
                part="menu"
                role="listbox"
                popover="manual"
                data-placement=${this.resolvedPlacement}
                aria-label=${ariaLabel || this.label || nothing}
            >
                ${this.renderElevation()}
                <div class="menu-items">
                    <slot @slotchange=${this.handleSlotChange}></slot>
                </div>
            </div>
        `
    }

    protected renderDropdownArrow(): TemplateResult {
        return html`
            <svg class="dropdown-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 10l5 5 5-5z" />
            </svg>
        `
    }

    // ── Option Synchronization ──────────────────────────────────────────────

    private readonly handleSlotChange = (): void => {
        const opts = this.options
        this.propagateColorStyleToOptions()
        if (this.open) {
            this.setInitialActiveOption()
        }

        if (!this.hasInitializedOptions) {
            this.hasInitializedOptions = true
            if (this.value) {
                this.syncOptionsFromValue()
                return
            }
            if (this.selectedIndex >= 0) {
                this.syncOptionsFromIndex()
                return
            }
            const preselectedIndex = opts.findIndex((option) => option.selected)
            if (preselectedIndex >= 0) {
                this.applySelection(preselectedIndex, false)
            }
            return
        }

        if (this.value) {
            this.syncOptionsFromValue()
        } else if (this.selectedIndex >= 0) {
            this.syncOptionsFromIndex()
        }
    }

    private syncOptionsFromValue(): void {
        const opts = this.options
        if (opts.length === 0) {
            this.displayTextState = ''
            return
        }
        let matchedIndex = -1
        for (let i = 0; i < opts.length; i++) {
            const isMatch = opts[i].value === this.value && matchedIndex === -1
            opts[i].selected = isMatch
            if (isMatch) {
                matchedIndex = i
            }
        }
        this.selectedIndex = matchedIndex
        this.displayTextState = matchedIndex >= 0 ? opts[matchedIndex].headlineText : ''
    }

    private syncOptionsFromIndex(): void {
        const opts = this.options
        if (opts.length === 0) {
            this.displayTextState = ''
            return
        }
        const index = this.selectedIndex
        if (index < 0 || index >= opts.length) {
            for (const opt of opts) {
                opt.selected = false
            }
            this.selectedIndex = -1
            this.value = ''
            this.displayTextState = ''
            return
        }
        for (let i = 0; i < opts.length; i++) {
            opts[i].selected = i === index
        }
        this.value = opts[index].value
        this.displayTextState = opts[index].headlineText
    }

    private applySelection(index: number, dispatchEvents: boolean): void {
        const opts = this.options
        const previousValue = this.value
        const previousIndex = this.selectedIndex

        for (let i = 0; i < opts.length; i++) {
            opts[i].selected = i === index
        }

        if (index >= 0 && index < opts.length) {
            this.selectedIndex = index
            this.value = opts[index].value
            this.displayTextState = opts[index].headlineText
        } else {
            this.selectedIndex = -1
            this.value = ''
            this.displayTextState = ''
        }

        if (this.autoValidate) {
            this.nativeError = !this.checkValidity()
        }

        if (dispatchEvents && (previousValue !== this.value || previousIndex !== this.selectedIndex)) {
            this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
            this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
        }
    }

    private propagateColorStyleToOptions(): void {
        for (const option of this.options) {
            option.variant = this.menuColorStyle
        }
    }

    // ── Active Option & Keyboard Navigation ─────────────────────────────────

    private setInitialActiveOption(): void {
        const opts = this.options
        if (this.selectedIndex >= 0 && this.selectedIndex < opts.length && !opts[this.selectedIndex].disabled) {
            this.setActiveIndex(this.selectedIndex)
            return
        }
        const firstEnabled = opts.findIndex((option) => !option.disabled)
        this.setActiveIndex(firstEnabled)
    }

    private setActiveIndex(index: number): void {
        const opts = this.options
        this.activeIndex = index
        if (this.triggerElement) {
            this.triggerElement.ariaActiveDescendantElement = opts[index] ?? null
        }
        for (let i = 0; i < opts.length; i++) {
            opts[i].active = i === index
        }
    }

    private clearActiveOption(): void {
        this.activeIndex = -1
        if (this.triggerElement) {
            this.triggerElement.ariaActiveDescendantElement = null
        }
        for (const option of this.options) {
            option.active = false
        }
    }

    private moveActiveOption(delta: 1 | -1): void {
        const opts = this.options
        const enabledIndices = opts
            .map((opt, idx) => (opt.disabled ? -1 : idx))
            .filter((idx) => idx !== -1)

        if (enabledIndices.length === 0) {
            return
        }

        const currentPos = enabledIndices.indexOf(this.activeIndex)
        let nextPos: number
        if (currentPos === -1) {
            nextPos = delta === 1 ? 0 : enabledIndices.length - 1
        } else {
            nextPos = (currentPos + delta + enabledIndices.length) % enabledIndices.length
        }

        this.setActiveIndex(enabledIndices[nextPos])
        this.scrollActiveOptionIntoView()
    }

    private moveActiveToEdge(edge: 'first' | 'last'): void {
        const opts = this.options
        const enabledIndices = opts
            .map((opt, idx) => (opt.disabled ? -1 : idx))
            .filter((idx) => idx !== -1)

        if (enabledIndices.length === 0) {
            return
        }
        const target = edge === 'first' ? enabledIndices[0] : enabledIndices[enabledIndices.length - 1]
        this.setActiveIndex(target)
        this.scrollActiveOptionIntoView()
    }

    private scrollActiveOptionIntoView(): void {
        const opts = this.options
        if (this.activeIndex >= 0 && this.activeIndex < opts.length) {
            opts[this.activeIndex].scrollIntoView?.({ block: 'nearest' })
        }
    }

    private handleTypeahead(key: string): void {
        this.typeaheadBuffer += key.toLowerCase()
        if (this.typeaheadTimer !== null) {
            clearTimeout(this.typeaheadTimer)
        }
        this.typeaheadTimer = setTimeout(() => {
            this.typeaheadBuffer = ''
            this.typeaheadTimer = null
        }, this.typeaheadDelay)

        const opts = this.options
        const start = this.activeIndex >= 0 ? this.activeIndex : 0
        for (let offsetIdx = 0; offsetIdx < opts.length; offsetIdx++) {
            const idx = (start + offsetIdx) % opts.length
            const opt = opts[idx]
            if (opt.disabled) {
                continue
            }
            if (opt.headlineText.toLowerCase().startsWith(this.typeaheadBuffer)) {
                if (this.open) {
                    this.setActiveIndex(idx)
                    this.scrollActiveOptionIntoView()
                } else {
                    this.applySelection(idx, true)
                }
                break
            }
        }
    }

    private clearTypeahead(): void {
        if (this.typeaheadTimer !== null) {
            clearTimeout(this.typeaheadTimer)
            this.typeaheadTimer = null
        }
        this.typeaheadBuffer = ''
    }

    // ── Event Handlers ──────────────────────────────────────────────────────

    private readonly handleFieldClick = (event: MouseEvent): void => {
        if (this.disabled) {
            return
        }
        event.stopPropagation()
        this.triggerElement?.focus()
        if (this.open) {
            void this.close()
        } else {
            void this.show()
        }
    }

    private readonly handleFieldLabelPointer = (): void => {
        if (this.disabled) {
            return
        }
        this.triggerElement?.focus()
    }

    private readonly handleTriggerFocus = (): void => {
        this.focused = true
    }

    private readonly handleTriggerBlur = (): void => {
        this.focused = false
        if (this.autoValidate && !this.open) {
            this.nativeError = !this.checkValidity()
        }
    }

    private readonly handleTriggerKeydown = (event: KeyboardEvent): void => {
        if (this.disabled) {
            return
        }

        if (!this.open) {
            if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault()
                void this.show()
                return
            }
            if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                this.handleTypeahead(event.key)
            }
            return
        }

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                this.moveActiveOption(1)
                break
            case 'ArrowUp':
                event.preventDefault()
                this.moveActiveOption(-1)
                break
            case 'Home':
                event.preventDefault()
                this.moveActiveToEdge('first')
                break
            case 'End':
                event.preventDefault()
                this.moveActiveToEdge('last')
                break
            case 'Enter':
            case ' ':
                event.preventDefault()
                if (this.activeIndex >= 0 && !this.options[this.activeIndex]?.disabled) {
                    this.applySelection(this.activeIndex, true)
                }
                void this.close()
                this.triggerElement?.focus()
                break
            case 'Escape':
                event.preventDefault()
                void this.close()
                this.triggerElement?.focus()
                break
            case 'Tab':
                void this.close()
                break
            default:
                if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                    this.handleTypeahead(event.key)
                }
                break
        }
    }

    private readonly handleOptionRequestSelection = (event: Event): void => {
        const option = (event as CustomEvent<{ option: IMDCSelectOption }>).detail?.option
        if (!option || option.disabled) {
            return
        }
        event.stopPropagation()
        const index = this.options.indexOf(option)
        if (index >= 0) {
            this.applySelection(index, true)
        }
        void this.close()
        this.triggerElement?.focus()
    }

    private readonly handleDocumentPointerdown = (event: PointerEvent): void => {
        if (!this.open) {
            return
        }
        const path = event.composedPath()
        if (!path.includes(this)) {
            void this.close()
        }
    }

    // ── Floating UI Positioning & Top Layer Popover ─────────────────────────

    private showMenuPopover(): void {
        const menu = this.menuElement
        if (!menu || typeof menu.showPopover !== 'function') {
            return
        }
        try {
            if (!menu.matches(':popover-open')) {
                menu.showPopover()
            }
        } catch {
            // Ignore when disconnected or unsupported in test DOM.
        }
    }

    private hideMenuPopover(): void {
        const menu = this.menuElement
        if (!menu || typeof menu.hidePopover !== 'function') {
            return
        }
        try {
            if (menu.matches(':popover-open')) {
                menu.hidePopover()
            }
        } catch {
            // Ignore when disconnected or unsupported in test DOM.
        }
    }

    private startPositionTracking(): void {
        this.stopPositionTracking()
        const anchor = this.fieldElement ?? this.triggerElement
        const menu = this.menuElement
        if (!anchor || !menu) {
            return
        }
        this.cleanupAutoUpdate = autoUpdate(anchor, menu, () => {
            void this.updatePosition()
        })
    }

    private stopPositionTracking(): void {
        this.cleanupAutoUpdate?.()
        this.cleanupAutoUpdate = null
    }

    public async updatePosition(): Promise<void> {
        const anchor = this.fieldElement ?? this.triggerElement
        const menu = this.menuElement
        if (!anchor || !menu) {
            return
        }
        const { x, y, placement } = await computePosition(anchor, menu, {
            strategy: 'fixed',
            placement: this.menuPlacement,
            middleware: this.createPositionMiddleware(),
        })
        this.resolvedPlacement = placement
        menu.style?.setProperty('left', `${x}px`)
        menu.style?.setProperty('top', `${y}px`)
    }

    protected createPositionMiddleware(): Middleware[] {
        return [
            offset(MenuOffsetPx),
            flip(),
            shift({ padding: MenuShiftPaddingPx }),
            size({
                padding: MenuShiftPaddingPx,
                apply: ({ rects, availableHeight, elements }) => {
                    const floating = elements.floating
                    const anchorWidth = rects.reference.width
                    if (anchorWidth > 0) {
                        floating.style.minWidth = `${anchorWidth}px`
                        if (this.clampMenuWidth) {
                            floating.style.width = `${anchorWidth}px`
                        } else {
                            floating.style.removeProperty('width')
                        }
                    }
                    const maxHeight = Math.max(120, Math.min(MenuMaxHeightPx, availableHeight))
                    floating.style.maxHeight = `${maxHeight}px`
                },
            }),
        ]
    }

    private attachDismissListeners(): void {
        if (this.dismissAttached || typeof document === 'undefined') {
            return
        }
        document.addEventListener('pointerdown', this.handleDocumentPointerdown, true)
        this.dismissAttached = true
    }

    private detachDismissListeners(): void {
        if (!this.dismissAttached || typeof document === 'undefined') {
            return
        }
        document.removeEventListener('pointerdown', this.handleDocumentPointerdown, true)
        this.dismissAttached = false
    }
}
