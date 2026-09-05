/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type TemplateResult } from 'lit'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import type {
    BadgeSize,
    IMDCBadge,
    IMDCBadgeValueChangeDetail,
    IMDCBadgeSizeChangeDetail,
    IMDCBadgeOverflowChangeDetail,
    IMDCBadgeAutoSizeDetail,
} from './badge.interface'
import { customElement, property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { mixinElementInternals } from '../../utils/behaviors/element-internals'
import { OpacityTransitionController } from '../../utils/controller/opacity-transition-controller'
import { BadgeStyles } from './badge.style'
import { MeasuredDimensionController } from '../../utils/controller/measured-dimension-controller'
import { Duration } from '@sandlada/mdk'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-badge": MDCBadge
    }
}

/**
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/badges/specs
 */
@customElement('mdc-badge')
export class MDCBadge extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals
)(LitElement) implements IMDCBadge {

    static override styles = BadgeStyles

    private _size: BadgeSize = 'small'
    private _value: string | number | null = null
    private _label: string | null = null
    private _max: number | null = 99
    private _autoSizeOnZero: boolean = false

    private previousEffectiveSize: BadgeSize = 'small'
    private previousIsOverflow: boolean = false

    @property({ type: String, attribute: 'size', reflect: true })
    public get size(): BadgeSize {
        return this._size
    }
    public set size(newSize: BadgeSize) {
        const oldSize = this._size
        this._size = newSize
        this.requestUpdate('size', oldSize)
        this.checkStateTransitions(oldSize)
    }

    @property({ type: String, reflect: true })
    public get value(): string | number | null {
        return this._value
    }
    public set value(newValue: string | number | null) {
        const oldValue = this._value
        if (oldValue === newValue) return
        this._value = newValue
        this.requestUpdate('value', oldValue)

        this.dispatchEvent(new CustomEvent<IMDCBadgeValueChangeDetail>('change', {
            detail: { value: newValue, oldValue },
            bubbles: true,
            composed: true,
        }))

        this.checkStateTransitions()
    }

    @property({ type: String, reflect: true })
    public get label(): string | null {
        return this._label
    }
    public set label(newLabel: string | null) {
        const oldLabel = this._label
        this._label = newLabel
        this.requestUpdate('label', oldLabel)
        this.checkStateTransitions()
    }

    @property({ type: Number, reflect: true })
    public get max(): number | null {
        return this._max
    }
    public set max(newMax: number | null) {
        const oldMax = this._max
        this._max = newMax
        this.requestUpdate('max', oldMax)
        this.checkStateTransitions()
    }

    @property({ type: Boolean, attribute: 'auto-size-on-zero', reflect: true })
    public get autoSizeOnZero(): boolean {
        return this._autoSizeOnZero
    }
    public set autoSizeOnZero(newVal: boolean) {
        const oldVal = this._autoSizeOnZero
        this._autoSizeOnZero = newVal
        this.requestUpdate('autoSizeOnZero', oldVal)
        this.checkStateTransitions()
    }

    @query('.label')
    protected readonly labelElement!: HTMLSpanElement

    private readonly opacityController = new OpacityTransitionController(
        this,
        {
            target: () => this.labelElement,
        }
    )
    private readonly measuredDimensionController = new MeasuredDimensionController(
        this,
        {
            target: () => this.labelElement,
            dimension: 'width',
            duration: Duration.StandardFastSpatial.Value,
        }
    )

    public constructor() {
        super()
    }

    protected get isZero(): boolean {
        if (this.label != null && this.label !== '') return false
        return this.value === 0 || this.value === '0'
    }

    public get effectiveSize(): BadgeSize {
        if (this.autoSizeOnZero) {
            return this.isZero ? 'small' : 'large'
        }
        return this.size
    }

    public get isOverflow(): boolean {
        if (this.effectiveSize === 'small' || this.label != null && this.label !== '' || this.value == null || this.value === '') {
            return false
        }
        const num = typeof this.value === 'number' ? this.value : Number(this.value)
        if (!isNaN(num) && typeof this.value !== 'boolean') {
            return this.max != null && this.max > 0 && num > this.max
        }
        return false
    }

    protected get displayText(): string {
        if (this.effectiveSize === 'small') {
            return ''
        }
        if (this.label != null && this.label !== '') {
            return this.label
        }
        if (this.value == null || this.value === '') return ''
        if (this.isZero) {
            return '0'
        }
        const num = typeof this.value === 'number' ? this.value : Number(this.value)
        if (!isNaN(num) && typeof this.value !== 'boolean') {
            if (this.max != null && this.max > 0 && num > this.max) {
                return `${this.max}+`
            }
            return String(this.value)
        }
        return String(this.value)
    }

    public get hasLabel(): boolean {
        return this.displayText !== ''
    }

    private checkStateTransitions(providedOldSize?: BadgeSize): void {
        const currentEffectiveSize = this.effectiveSize
        const oldEffectiveSize = providedOldSize !== undefined ? providedOldSize : this.previousEffectiveSize

        if (currentEffectiveSize !== oldEffectiveSize) {
            this.dispatchEvent(new CustomEvent<IMDCBadgeSizeChangeDetail>('size-change', {
                detail: { size: currentEffectiveSize, oldSize: oldEffectiveSize },
                bubbles: true,
                composed: true,
            }))
        }

        if (this.autoSizeOnZero) {
            this.dispatchEvent(new CustomEvent<IMDCBadgeAutoSizeDetail>('auto-size', {
                detail: { effectiveSize: currentEffectiveSize, isZero: this.isZero },
                bubbles: true,
                composed: true,
            }))
        }

        const currentIsOverflow = this.isOverflow
        const oldIsOverflow = this.previousIsOverflow
        if (currentIsOverflow !== oldIsOverflow) {
            this.dispatchEvent(new CustomEvent<IMDCBadgeOverflowChangeDetail>('overflow-change', {
                detail: {
                    isOverflow: currentIsOverflow,
                    oldIsOverflow,
                    displayText: this.displayText,
                },
                bubbles: true,
                composed: true,
            }))
        }

        this.previousEffectiveSize = currentEffectiveSize
        this.previousIsOverflow = currentIsOverflow
    }

    protected getRenderClasses() {
        return ({
            [this.effectiveSize]: true,
            'container': true,
            'has-label': this.hasLabel,
        })
    }

    protected override render(): TemplateResult {
        return html`
            <div class=${classMap(this.getRenderClasses())}>
                ${this.renderLabel()}
            </div>
        `
    }

    protected renderLabel() {
        return html`
            <span class="label">${this.displayText}</span>
        `
    }

}


