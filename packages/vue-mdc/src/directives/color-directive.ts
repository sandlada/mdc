/**
 * @license
 * Copyright 2024 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import type { Directive } from 'vue'
import { MaterialDesignSystem } from '../utils'
import { isServer } from '../utils/is-server'

const setElementColorProperty = (element: HTMLElement, property: 'text' | 'background', value: string) => {
    element.style.setProperty(property === 'text' ? 'color' : 'background-color', value)
}

const directive: (property: 'text' | 'background') => Directive<HTMLElement, string> = (property) => ({
    mounted: (el, binding) => {
        if (isServer()) {
            return
        }
        let colorRaw = binding.value
        if (typeof colorRaw === 'undefined' || colorRaw === null) {
            console.warn(`v-text-color accepts a string of hexadecimal color values. v-text-color received an unexpected value [${colorRaw}].`)
            colorRaw = MaterialDesignSystem.Color.OnSurface
        }
        setElementColorProperty(el, property, colorRaw)
    },
    updated: (el, binding) => {
        if (binding.oldValue === binding.value) {
            return
        }
        let colorRaw = binding.value
        if (typeof colorRaw === 'undefined' || colorRaw === null) {
            console.warn(`v-text-color accepts a string of hexadecimal color values. v-text-color received an unexpected value [${colorRaw}].`)
            colorRaw = MaterialDesignSystem.Color.OnSurface
        }
        setElementColorProperty(el, property, colorRaw)
    }
})

export const vTextColor = directive('text')
export const vBackgroundColor = directive('background')
