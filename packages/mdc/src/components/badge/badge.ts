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

    protected getRenderClasses() {
        return ({
            [this.size]: true,
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
            <span class="label">${this.displayValue}</span>
        `
    }

    protected get displayValue(): string {
        if (this.value == null) return ''
        if (typeof this.value === 'string') return this.value
        return this.value > 99 ? '99+' : String(this.value)
    }

    protected get hasLabel(): boolean {
        return this.value != null && this.value !== ''
    }

}
