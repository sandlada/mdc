/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { html, LitElement, type TemplateResult } from 'lit'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import type { BadgeSize, IBadge } from './badge.interface'
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
)(LitElement) implements IBadge {

    static override styles = BadgeStyles

    @property({ type: String, attribute: 'size', reflect: true })
    public size: BadgeSize = 'small'

    @property({ type: String, reflect: true })
    public value: string | number | null = null

    @property({ type: String, reflect: true })
    public label: string | null = null

    @property({ type: Number, reflect: true })
    public max: number | null = 99

    @property({ type: Boolean, attribute: 'auto-size-on-zero', reflect: true })
    public autoSizeOnZero: boolean = false

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

    protected get hasLabel(): boolean {
        return this.displayText !== ''
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

