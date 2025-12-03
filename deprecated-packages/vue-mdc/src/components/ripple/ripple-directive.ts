/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { createVNode, render, type Directive } from 'vue'
import type { IAttachableHost } from '../../internals/controller/use-attachable'
import { Ripple } from './ripple'
import css from './styles/ripple.module.scss'

class RippleDirective {

    private static readonly createRippleElement = (parent: HTMLElement): void => {
        const rippleComponent = createVNode(Ripple)
        render(rippleComponent, parent)
    }
    private static readonly queryRippleElement = (el: HTMLElement) => {
        return el.querySelector<IAttachableHost>(`.${css.ripple}[data-component="ripple"]`)
    }
    private static readonly isRippleColorProperty = (color: string) => {
        return typeof color === 'string'
    }
    private static readonly isRippleOpacityProperty = (opacity: number) => {
        return typeof opacity === 'number' && (opacity >= 0 && opacity <= 1)
    }

    public static readonly rippleDirective: Directive<HTMLElement, void> = {
        beforeMount: (el) => {
            this.createRippleElement(el)
        },
        mounted: (el) => {
            const queriedRippleElement = this.queryRippleElement(el)
            if (queriedRippleElement === null || typeof queriedRippleElement === 'undefined') {
                console.warn(`The DOM object with the target selector 'div.\${css.ripple}[data-standalone="true"]\} was not found. This is an internal bug, please report it.`)
                return
            }
        },
        updated: (el) => {
            const queriedRippleElement = this.queryRippleElement(el)
            if (queriedRippleElement === null || typeof queriedRippleElement === 'undefined') {
                console.warn(`The DOM object with the target selector 'div.\${css.ripple}[data-standalone="true"]\} was not found. This is an internal bug, please report it.`)
                return
            }
        },
        beforeUnmount: (el) => {
            const queriedRippleElement = this.queryRippleElement(el)
            if (queriedRippleElement === null || typeof queriedRippleElement === 'undefined') {
                console.warn(`The DOM object with the target selector \`div.${css.ripple}[data-standalone="true"]\` was not found. This is an internal bug, please report it.`)
            }
        }
    }

    private static readonly colorProgress: (state: 'hover' | 'pressed') => Directive<HTMLElement, string> = (state) => ({
        mounted: (el, binding) => {
            const queriedRippleElement = this.queryRippleElement(el)
            if (queriedRippleElement === null || typeof queriedRippleElement === 'undefined') {
                console.warn(`The DOM object with the target selector 'div.\${css.ripple}[data-standalone="true"]\} was not found. This is an internal bug, please report it.`)
                return
            }

            const isColorProperty = this.isRippleColorProperty(binding.value)
            if (isColorProperty) {
                queriedRippleElement.style.setProperty(`--md-ripple-${state}-color`, `${binding.value}`)
            } else {
                console.warn(`The parameters of v-ripple-hover-color and v-ripple-pressed-color only accept strings and must be valid CSS color values.`)
            }
        },
        updated: (el, binding) => {
            const queriedRippleElement = this.queryRippleElement(el)
            if (queriedRippleElement === null || typeof queriedRippleElement === 'undefined') {
                console.warn(`The DOM object with the target selector 'div.\${css.ripple}[data-standalone="true"]\} was not found. This is an internal bug, please report it.`)
                return
            }

            const isColorProperty = this.isRippleColorProperty(binding.value)
            if (isColorProperty) {
                queriedRippleElement.style.setProperty(`--md-ripple-${state}-color`, `${binding.value}`)
            } else {
                console.warn(`The parameters of v-ripple-hover-color and v-ripple-pressed-color only accept strings and must be valid CSS color values.`)
            }
        }
    })
    public static readonly hoverColorDirective: Directive<HTMLElement, string> = this.colorProgress('hover')
    public static readonly pressedColorDirective: Directive<HTMLElement, string> = this.colorProgress('pressed')

    private static readonly opacityProgress: (state: 'hover' | 'pressed') => Directive<HTMLElement, number> = (state) => ({
        mounted: (el, binding) => {
            const queriedRippleElement = this.queryRippleElement(el)
            if (queriedRippleElement === null || typeof queriedRippleElement === 'undefined') {
                console.warn(`The DOM object with the target selector 'div.\${css.ripple}[data-standalone="true"]\} was not found. This is an internal bug, please report it.`)
                return
            }

            const isOpacityProperty = this.isRippleOpacityProperty(binding.value)
            if (isOpacityProperty) {
                queriedRippleElement.style.setProperty(`--md-ripple-${state}-opacity`, `${binding.value}`)
            } else {
                console.warn(`The parameters of v-ripple-hover-opacity and v-ripple-pressed-opacity only accept numbers, ranging from 0 to 1.`)
            }
        },
        updated: (el, binding) => {
            const queriedRippleElement = this.queryRippleElement(el)
            if (queriedRippleElement === null || typeof queriedRippleElement === 'undefined') {
                console.warn(`The DOM object with the target selector 'div.\${css.ripple}[data-standalone="true"]\} was not found. This is an internal bug, please report it.`)
                return
            }

            const isOpacityProperty = this.isRippleOpacityProperty(binding.value)
            if (isOpacityProperty) {
                queriedRippleElement.style.setProperty(`--md-ripple-${state}-opacity`, `${binding.value}`)
            } else {
                console.warn(`The parameters of v-ripple-hover-opacity and v-ripple-pressed-opacity only accept numbers, ranging from 0 to 1.`)
            }
        }
    })

    public static readonly hoverOpacityDirective: Directive<HTMLElement, number> = this.opacityProgress('hover')
    public static readonly pressedOpacityDirective: Directive<HTMLElement, number> = this.opacityProgress('pressed')

}

/**
 * Create a ripple DOM to it
 * @example
 * ```html
 * <div v-ripple class="w-32 h-32 border relative">
 * </div>
 * ```
 */
export const vRipple = RippleDirective.rippleDirective
export const vRippleHoverColor = RippleDirective.hoverColorDirective
export const vRipplePressedColor = RippleDirective.pressedColorDirective
export const vRippleHoverOpacity = RippleDirective.hoverOpacityDirective
export const vRipplePressedOpacity = RippleDirective.pressedOpacityDirective
