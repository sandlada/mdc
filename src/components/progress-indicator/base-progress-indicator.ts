/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */
import { LitElement, html, nothing, type TemplateResult } from 'lit'
import { property, query } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'

/**
 * A progress component.
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/progress-indicators/specs
 */
export abstract class BaseProgressIndicator extends composeMixin(mixinDelegatesAria)(LitElement) {

    @property({ type: Number })
    public value: number = 0

    @property({ type: Number })
    public max: number = 1

    @property({ type: Boolean })
    public indeterminate: boolean = false

    @property({ type: Boolean, reflect: true })
    public wavy: boolean = false

    @query('.progress')
    protected progressElement!: HTMLElement

    protected override render() {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <div
                class="progress ${classMap(this.getRenderClasses())}"
                style="--_active-fraction: ${this.value / this.max}; --_inactive-fraction: ${1 - (this.value / this.max)};"
                role="progressbar"
                aria-label="${ariaLabel || nothing}"
                aria-valuemin="0"
                aria-valuemax=${this.max}
                aria-valuenow=${this.indeterminate ? nothing : this.value}
            >
                ${this.renderIndicator()}
            </div>
        `
    }

    protected abstract renderWavy(): TemplateResult
    protected abstract renderLine(): TemplateResult

    protected getRenderClasses() {
        return {
            'indeterminate': this.indeterminate,
            'wavy': this.wavy,
        }
    }

    protected abstract renderIndicator(): TemplateResult
}
