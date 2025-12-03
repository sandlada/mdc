/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

import { type Directive, type DirectiveBinding } from 'vue'
import css from './styles/typography.module.scss'
import { type TTypographyVariant } from './typography.definition'

const Variants = [
    "label-small", "label-medium", "label-large",
    "body-small", "body-medium", "body-large",
    "title-small", "title-medium", "title-large",
    "headline-small", "headline-medium", "headline-large",
    "display-small", "display-medium", "display-large"
] as const

export const vTypography: Directive<HTMLElement, TTypographyVariant> = {
    mounted: (el: HTMLElement, binding) => {
        let typoName = binding.value
        const isIncluded = Variants.includes(typoName)

        if (!isIncluded) {
            console.warn(`Invalid v-typography input parameter '${typoName}', parameter type should be TTypography(${Variants.join(' | ')}). If the input parameter is invalid, the default value is body-medium.`)
            typoName = 'body-medium'
        }
        el.classList.add(css.typography, css[typoName])
    },
    updated: (el: HTMLElement, binding) => {
        if (binding.oldValue === binding.value) return

        let typoName = binding.value
        const isIncluded = Variants.includes(typoName)

        if (!isIncluded) {
            console.warn(`Invalid v-typography input parameter '${typoName}', parameter type should be TTypography(${Variants.join(' | ')}). If the input parameter is invalid, the default value is body-medium.`)
            typoName = 'body-medium'
        }

        el.classList.remove(css.typography, css[typoName])
        el.classList.add(css.typography, css[typoName])
    }
}

const handleEmphasizedUpdate = (el: HTMLElement, binding: DirectiveBinding<boolean | undefined, string, string>) => {
    const isEmphasized = typeof binding.value === 'undefined' ? true : Boolean(binding.value)
    const containerCss = el.classList.contains(css.emphasized)
    if (isEmphasized) {
        if (!containerCss) {
            el.classList.add(css.emphasized)
        }
    } else {
        if (containerCss) {
            el.classList.remove(css.emphasized)
        }
    }
}

export const vEmphasized: Directive<HTMLElement, boolean | undefined> = {
    mounted: handleEmphasizedUpdate,
    updated: handleEmphasizedUpdate,
}
