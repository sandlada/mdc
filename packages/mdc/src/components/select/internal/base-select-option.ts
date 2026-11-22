/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property, query, queryAssignedElements, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../../utils/aria/delegate'
import { Internals, mixinElementInternals } from '../../../utils/behaviors/element-internals'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'
import '../../focus-ring/focus-ring'
import { mixinFocusRingOptions } from '../../focus-ring/focus-ring-options.mixin'
import '../../ripple/ripple'
import { mixinRippleOptions } from '../../ripple/ripple-options.mixin'
import {
    SelectMenuColorStyle,
    SelectOptionRequestSelectionEvent,
    type IMDCSelectOption,
} from '../select.interface'
import { SelectOptionStyles } from '../select-option.style'

const ValidColorStyles: readonly string[] = [
    SelectMenuColorStyle.Standard,
    SelectMenuColorStyle.Vibrant,
]

/**
 * Abstract base for `mdc-select-option` — a single Material Design 3
 * selectable option inside `mdc-select`.
 *
 * Uses `ElementInternals` to expose `role="option"`, `aria-selected`, and
 * `aria-disabled` directly on the host element for screen-reader listbox
 * semantics.
 */
export abstract class BaseSelectOption extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
    mixinRippleOptions,
    mixinFocusRingOptions,
)(LitElement) implements IMDCSelectOption {

    public static override styles = SelectOptionStyles

    public static override shadowRootOptions: ShadowRootInit = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: true,
    }

    /** Value associated with this option. */
    @property({ type: String })
    public value: string = ''

    /** Whether the option is disabled. */
    @property({ type: Boolean, reflect: true })
    public disabled: boolean = false

    /** Whether the option is currently selected. */
    @property({ type: Boolean, reflect: true })
    public selected: boolean = false

    /** Optional override text shown in the select field when selected. */
    @property({ type: String, attribute: 'display-text' })
    public displayText: string = ''

    /** Optional supporting text shown below the option label. */
    @property({ type: String, attribute: 'supporting-text' })
    public supportingText: string = ''

    /** Active keyboard-focus highlight state managed by `mdc-select`. */
    @property({ type: Boolean, reflect: true })
    public active: boolean = false

    /** Color style inherited from the parent `mdc-select`. */
    @property({ type: String, reflect: true })
    public variant: SelectMenuColorStyle = SelectMenuColorStyle.Standard

    @state()
    protected hasLeading: boolean = false

    @state()
    protected hasTrailing: boolean = false

    @state()
    protected hasSupporting: boolean = false

    @query('.container')
    protected readonly containerElement!: HTMLElement | null

    @queryAssignedElements({ slot: 'start', flatten: true })
    private readonly assignedStart!: HTMLElement[]

    @queryAssignedElements({ slot: 'end', flatten: true })
    private readonly assignedEnd!: HTMLElement[]

    @queryAssignedElements({ slot: 'supporting-text', flatten: true })
    private readonly assignedSupporting!: HTMLElement[]

    public override get rippleControl(): HTMLElement | null {
        return this.containerElement ?? null
    }

    public override get focusRingControl(): HTMLElement | null {
        return this.containerElement ?? null
    }

    /**
     * Computed text shown in the select field when this option is selected.
     */
    public get headlineText(): string {
        if (this.displayText) {
            return this.displayText
        }
        const nodes = Array.from(this.childNodes).filter(
            (node) => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && !(node as Element).hasAttribute('slot')),
        )
        return nodes.map((node) => node.textContent ?? '').join('').trim()
    }

    public override connectedCallback(): void {
        super.connectedCallback()
        this[Internals].role = 'option'
        this.syncAriaState()
    }

    protected override willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties)
        if (!ValidColorStyles.includes(this.variant)) {
            throw new Error(`[mdc-select-option] Unsupported variant "${String(this.variant)}". Supported variants are "standard" | "vibrant".`)
        }
        if (changedProperties.has('selected') || changedProperties.has('disabled')) {
            this.syncAriaState()
        }
    }

    protected getRenderClasses(): Record<string, boolean> {
        return {
            'container': true,
            'selected': this.selected,
            'active': this.active,
            'disabled': this.disabled,
        }
    }

    protected override render(): TemplateResult {
        const showSupporting = this.hasSupporting || Boolean(this.supportingText)
        const showTrailing = this.hasTrailing || this.selected

        return html`
            <div
                class=${classMap(this.getRenderClasses())}
                tabindex="-1"
                @click=${this.handleClick}
                @keydown=${this.handleKeydown}
            >
                ${this.renderRipple()}
                ${this.renderFocusRing()}
                <span class="leading ${classMap({ 'has-leading': this.hasLeading })}">
                    <slot name="start" @slotchange=${this.handleStartSlotChange}></slot>
                </span>
                <span class="label-group">
                    <span class="headline">
                        <slot></slot>
                    </span>
                    <span class="supporting-text ${classMap({ 'has-supporting': showSupporting })}">
                        <slot name="supporting-text" @slotchange=${this.handleSupportingSlotChange}>${this.supportingText || nothing}</slot>
                    </span>
                </span>
                <span class="trailing ${classMap({ 'has-trailing': showTrailing })}">
                    <slot name="end" @slotchange=${this.handleEndSlotChange}>
                        ${this.selected ? this.renderCheckmark() : nothing}
                    </slot>
                </span>
            </div>
        `
    }

    protected renderCheckmark(): TemplateResult {
        return html`
            <svg class="check-icon" viewBox="0 -960 960 960" aria-hidden="true">
                <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
            </svg>
        `
    }

    private syncAriaState(): void {
        this[Internals].ariaSelected = this.selected ? 'true' : 'false'
        this[Internals].ariaDisabled = this.disabled ? 'true' : 'false'
    }

    private readonly handleStartSlotChange = (): void => {
        this.hasLeading = (this.assignedStart?.length ?? 0) > 0
    }

    private readonly handleEndSlotChange = (): void => {
        this.hasTrailing = (this.assignedEnd?.length ?? 0) > 0
    }

    private readonly handleSupportingSlotChange = (): void => {
        this.hasSupporting = (this.assignedSupporting?.length ?? 0) > 0
    }

    private readonly handleClick = (): void => {
        if (this.disabled) {
            return
        }
        this.requestSelection()
    }

    private readonly handleKeydown = (event: KeyboardEvent): void => {
        if (this.disabled) {
            return
        }
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            this.requestSelection()
        }
    }

    private requestSelection(): void {
        this.dispatchEvent(new CustomEvent(SelectOptionRequestSelectionEvent, {
            bubbles: true,
            composed: true,
            detail: { option: this },
        }))
    }
}
