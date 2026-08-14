/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { customElement } from 'lit/decorators.js'
import { BaseSlider } from './internal/base-slider'
import { sliderStyles } from './internal/slider.styles'

/**
 * @version
 * Material Design 3
 */
@customElement('mdc-slider')
export class MDCSlider extends BaseSlider {
    static override styles = sliderStyles
}
