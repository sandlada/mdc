/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { type Directive } from 'vue'
import css from './styles/typography.module.scss'
import { type TTypographyVariant } from './typography.definition'

class TypographyDirective {
    private static readonly variants = [
        "label-small", "label-medium", "label-large",
        "body-small", "body-medium", "body-large",
        "title-small", "title-medium", "title-large",
        "headline-small", "headline-medium", "headline-large",
        "display-small", "display-medium", "display-large"
    ]

    public static readonly directive: Directive<HTMLElement, TTypographyVariant> = {
        mounted: (el: HTMLElement, binding) => {
            let typoName = binding.value
            const isIncluded = this.variants.includes(typoName)

            if (!isIncluded) {
                console.warn(`Invalid v-typography input parameter '${typoName}', parameter type should be TTypography(${this.variants.join(' | ')}). If the input parameter is invalid, the default value is body-medium.`)
                typoName = 'body-medium'
            }
            el.classList.add(css.typography, css[typoName])
        },
        updated: (el: HTMLElement, binding) => {
            if (binding.oldValue === binding.value) return

            let typoName = binding.value
            const isIncluded = this.variants.includes(typoName)

            if (!isIncluded) {
                console.warn(`Invalid v-typography input parameter '${typoName}', parameter type should be TTypography(${this.variants.join(' | ')}). If the input parameter is invalid, the default value is body-medium.`)
                typoName = 'body-medium'
            }

            el.classList.remove(css.typography, css[typoName])
            el.classList.add(css.typography, css[typoName])
        }
    }
}

export const vTypography = TypographyDirective.directive
