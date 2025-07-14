/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */
import { html, type TemplateResult } from 'lit'
import { customElement } from 'lit/decorators.js'
import { BaseProgressIndicator } from './base-progress-indicator'
import { linearProgressIndicatorStyle } from './progress-indicator.style'

declare global {
    interface HTMLElementTagNameMap {
        "mdc-linear-progress-indicator": LinearProgressIndicator
    }
}

/**
 * A progress component.
 *
 * @todo
 * - wavy
 *
 * @version
 * Material Design 3 - Expressive
 *
 * @link
 * https://m3.material.io/components/progress-indicators/specs
 */
@customElement('mdc-linear-progress-indicator')
export class LinearProgressIndicator extends BaseProgressIndicator {

    static override styles = linearProgressIndicatorStyle

    protected override renderIndicator(): TemplateResult {
        return html`
            <span aria-hidden="true" class="stop-indicators"></span>
            <div class="tracks" style="--_active-fraction: ${this.value / this.max}; --_inactive-fraction: ${1 - (this.value / this.max)};">
                <span aria-hidden="true" class="active-track"></span>
                <span aria-hidden="true" class="inactive-track"></span>
            </div>
            <div class="indeteminate-bar">
                <div class="bar primary-bar">
                    <div class="bar-inner"></div>
                </div>
                <div class="bar secondary-bar">
                    <div class="bar-inner"></div>
                </div>
            </div>
        `
    }

}
