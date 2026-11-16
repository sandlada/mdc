/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { customElement } from 'lit/decorators.js'
import { BaseSlider } from '../slider/internal/base-slider'
import { LegacySliderStyles } from './internal/legacy-slider.styles'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-legacy-slider': MDCLegacySlider
    }
}

/**
 * @version
 * Material Design 3
 */
@customElement('mdc-legacy-slider')
export class MDCLegacySlider extends BaseSlider {
    static override styles = LegacySliderStyles
}
