/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */
import { LitElement, html, nothing, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import type { AriaMixinStrict } from '../../utils/aria/aria'
import { mixinDelegatesAria } from '../../utils/aria/delegate'

/**
 * A progress component.
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/progress-indicators/specs
 */
export abstract class BaseProgressIndicator extends mixinDelegatesAria(LitElement) {

    @property({ type: Number })
    public value: number = 0

    @property({ type: Number })
    public max: number = 1

    @property({ type: Boolean })
    public indeterminate: boolean = false

    protected override render() {
        const { ariaLabel } = this as AriaMixinStrict
        return html`
            <div
                class="progress ${classMap(this.getRenderClasses())}"
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

    protected getRenderClasses() {
        return {
            'indeterminate': this.indeterminate,
        }
    }

    protected abstract renderIndicator(): TemplateResult
}
