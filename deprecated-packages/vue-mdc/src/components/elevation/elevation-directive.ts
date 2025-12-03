/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { type Directive, type DirectiveBinding } from 'vue'
import { type TElevationLevel } from './elevation.definition'
import css from './styles/elevation.module.scss'

class ElevationDirective {

    private static readonly wrapElevationLevel = (binding: DirectiveBinding<TElevationLevel>) => {
        /**
         * When no parameters are provided for v-elevation
         * @value 1
         * @example
         * ```html
         * <div v-elevation></div>
         * ```
         */
        if (typeof binding.value === 'undefined') {
            console.warn(`It is recommended to specify a parameter for v-elevation, and the recommended parameters range from 0 to 5. If you do not specify a parameter, the default value is 3.`)
            return `1`
        }
        /**
         * When providing the correct parameters to v-elevation
         * @example
         * ```html
         * <div v-elevation="3"></div>
         * ```
         */
        else if (binding.value >= 0 && binding.value <= 5) {
            return `${binding.value}`
        }
        /**
         * When wrong parameters are provided to v-elevation
         * @value binding.value < 0 ? 0 : 5
         * @example
         * ```html
         * <div v-elevation="999"></div>
         * ```
         */
        else if (binding.value < 0 || binding.value > 5) {
            console.warn(`It is recommended to set the value of the level setting of the component of Elevation to 0 to 5. If an incorrect argument is provided, the default value is \`${binding.value < 0 ? 0 : 5}\``)
            return `${binding.value < 0 ? 0 : 5}`
        }
        /**
         * Other cases, such as type errors
         * @value 0
         * @example
         * ```html
         * <div v-elevation="abc"></div>
         * ```
         */
        else {
            console.warn(`Incorrect v-elevation data provided \`${binding.value}\`. To safely set elevation, if an incorrect type argument is provided, the default value is 0.`)
            return `0`
        }
    }
    private static readonly queryElevationElementFromEl = (el: HTMLElement) => {
        return el.querySelector(`span.${css.elevation}[data-standalone="true"]`) as HTMLElement
    }
    private static readonly createElevationElement = () => {
        const elevationElement = document.createElement('span')
        elevationElement.setAttribute('data-standalone', 'true')
        elevationElement.setAttribute('aria-hidden', 'true')
        elevationElement.classList.add(css.elevation)
        return elevationElement
    }

    public static readonly directive: Directive<HTMLElement, TElevationLevel> = {
        beforeMount: (el) => {
            el.appendChild(this.createElevationElement())
        },
        mounted: (el, binding) => {
            const queriedElevationElement = this.queryElevationElementFromEl(el)
            const elevationElement = typeof queriedElevationElement !== 'undefined' && queriedElevationElement !== null ? queriedElevationElement : this.createElevationElement()

            const level = this.wrapElevationLevel(binding)
            elevationElement.style.setProperty('--md-elevation-level', level)

        },
        updated: (el, binding) => {
            const queriedElevationElement = this.queryElevationElementFromEl(el)
            const elevationElement = typeof queriedElevationElement !== 'undefined' && queriedElevationElement !== null ? queriedElevationElement : this.createElevationElement()


            const level = this.wrapElevationLevel(binding)
            elevationElement.style.removeProperty('--md-elevation-level')
            elevationElement.style.setProperty('--md-elevation-level', level)
        }
    }
}

/**
 * @example
 * ```html
 * <div v-elevation="3">
 *  Elevation Box
 * </div>
 *
 * v-elevation = 0 | 1 | 2 | 3 | 4 | 5
 * ```
 */
export const vElevation = ElevationDirective.directive
