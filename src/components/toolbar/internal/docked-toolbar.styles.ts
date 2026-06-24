import { css, unsafeCSS } from 'lit'
import { MDCDockedToolbarStyleDefinition, MDCStandardDockedToolbarStyleDefinition, MDCVibrantDockedToolbarStyleDefinition } from '../../../component-definitions/toolbar.definition'
import type { FilledIconButtonDefinition } from '../../../definitions'
import { overrideComponentTokens, stringTokens } from '../../../utils'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const standardBaseRecord = defineTokenRefsRecord(MDCDockedToolbarStyleDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-standard-docked-toolbar'
})
const standardRecord = defineTokenRefsRecord(MDCStandardDockedToolbarStyleDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-standard-docked-toolbar'
})
const vibrantBaseRecord = defineTokenRefsRecord(MDCDockedToolbarStyleDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-vibrant-docked-toolbar'
})
const vibrantRecord = defineTokenRefsRecord(MDCVibrantDockedToolbarStyleDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-vibrant-docked-toolbar'
})

const standardBaseVars = unsafeCSS(defineVars(standardBaseRecord, true).join(''))
const standardVars = unsafeCSS(defineVars(standardRecord, true).join(''))
const vibrantBaseVars = unsafeCSS(defineVars(vibrantBaseRecord, true).join(''))
const vibrantVars = unsafeCSS(defineVars(vibrantRecord, true).join(''))

let standardActionStyles = overrideComponentTokens<keyof typeof FilledIconButtonDefinition>('--mdc-icon-button', {
    'container-color': MDCStandardDockedToolbarStyleDefinition['enabled-standard-selected-button-container-color'],
    'container-color-toggle-unselected': MDCStandardDockedToolbarStyleDefinition['enabled-standard-button-container-color'],
    'container-color-toggle-selected': MDCStandardDockedToolbarStyleDefinition['enabled-standard-selected-button-container-color'],
    'icon-color': MDCStandardDockedToolbarStyleDefinition['enabled-standard-selected-icon-color'],
    'icon-color-toggle-unselected': MDCStandardDockedToolbarStyleDefinition['enabled-standard-icon-color'],
    'icon-color-toggle-selected': MDCStandardDockedToolbarStyleDefinition['enabled-standard-selected-icon-color'],
})
const vibrantActionStyles = overrideComponentTokens<keyof typeof FilledIconButtonDefinition>('--mdc-icon-button', {
    'container-color': MDCVibrantDockedToolbarStyleDefinition['enabled-vibrant-button-container-color'],
    'container-color-toggle-unselected': MDCVibrantDockedToolbarStyleDefinition['enabled-vibrant-button-container-color'],
    'container-color-toggle-selected': MDCVibrantDockedToolbarStyleDefinition['enabled-vibrant-selected-button-container-color'],
    'icon-color': MDCVibrantDockedToolbarStyleDefinition['enabled-vibrant-selected-icon-color'],
    'icon-color-toggle-unselected': MDCVibrantDockedToolbarStyleDefinition['enabled-vibrant-icon-color'],
    'icon-color-toggle-selected': MDCVibrantDockedToolbarStyleDefinition['enabled-vibrant-selected-icon-color'],
})

export const MDCDockedToolbarStyles = [
    css`
        @layer mdc.docked-toolbar {
            :host {
                all: unset;
                vertical-align: top;
                width: 100%;
                box-sizing: border-box;
                display: inline-flex;
            }
            :host:has(.container.standard) {
                ${standardBaseVars};
                ${standardVars};
                ${stringTokens(standardActionStyles)};
                height: var(--_container-height);
            }
            :host:has(.container.vibrant) {
                ${vibrantBaseVars};
                ${vibrantVars};
                ${stringTokens(vibrantActionStyles)};
                height: var(--_container-height);
            }

            .container {
                height: inherit;
                width: inherit;
                display: inline-flex;
                justify-content: space-between;
                align-items: center;
                box-sizing: border-box;
                position: relative;
                z-index: 0;
            }
            .container.standard {
                padding-inline-start: var(--_container-padding-inline-leading-space);
                padding-inline-end: var(--_container-padding-inline-trailing-space);
                padding-block-start: var(--_container-padding-block-leading-space);
                padding-block-end: var(--_container-padding-block-trailing-space);
            }
            .container.vibrant {
                padding-inline-start: var(--_container-padding-inline-leading-space);
                padding-inline-end: var(--_container-padding-inline-trailing-space);
                padding-block-start: var(--_container-padding-block-leading-space);
                padding-block-end: var(--_container-padding-block-trailing-space);
            }

            .container > .background {
                position: absolute;
                inset: 0;
                z-index: -1;
            }
            .container.standard > .background {
                background: var(--_enabled-standard-container-color);
            }
            .container.vibrant > .background {
                background: var(--_enabled-vibrant-container-color);
            }
        }
    `
]
