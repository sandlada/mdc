/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { defineComponent, type SlotsType } from 'vue'
import { componentNamePrefix } from '../../internals/component-name-prefix/component-name-prefix'
import { props, type TElevationSlots } from './elevation.definition'
import css from './styles/elevation.module.scss'

export const Elevation = defineComponent({
    name: `${componentNamePrefix}-elevation`,
    props: props,
    slots: {} as SlotsType<TElevationSlots>,
    render() {
        return (
            <span data-component="elevation" class={[css.elevation, css[`level-${this.level}`]]}></span>
        )
    },
    inheritAttrs: true,
})
