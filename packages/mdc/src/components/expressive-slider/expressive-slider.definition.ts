/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { SliderDefinition, SliderSchema } from '../slider/slider.definition'
import { MDCExpressiveSlider } from './expressive-slider'

export { SliderDefinition as ExpressiveSliderDefinition }
export const ExpressiveSliderSchema = SliderSchema

export const ExpressiveSliderComponentDefinition = {
    tagName: 'mdc-expressive-slider',
    component: MDCExpressiveSlider,
}
