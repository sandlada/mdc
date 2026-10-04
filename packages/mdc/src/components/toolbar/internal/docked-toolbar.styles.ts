import { css, unsafeCSS } from 'lit'
import { MDCDockedToolbarStyleDefinition, MDCStandardDockedToolbarStyleDefinition, MDCVibrantDockedToolbarStyleDefinition } from '../toolbar.definition'
import type { FilledIconButtonDefinition } from '../../../definitions'
import { overrideTokens, stringifyTokens } from '@sandlada/styles/adapters/lit'

const standardBaseVars = stringifyTokens('--mdc-standard-docked-toolbar')(MDCDockedToolbarStyleDefinition)
const standardVars = stringifyTokens('--mdc-standard-docked-toolbar')(MDCStandardDockedToolbarStyleDefinition)
const vibrantBaseVars = stringifyTokens('--mdc-vibrant-docked-toolbar')(MDCDockedToolbarStyleDefinition)
const vibrantVars = stringifyTokens('--mdc-vibrant-docked-toolbar')(MDCVibrantDockedToolbarStyleDefinition)

const standardActionStyles = overrideTokens<typeof FilledIconButtonDefinition>('--mdc-icon-button')({
    'container-color': MDCStandardDockedToolbarStyleDefinition['enabled-standard-selected-button-container-color'],
    'container-color-toggle-unselected': MDCStandardDockedToolbarStyleDefinition['enabled-standard-button-container-color'],
    'container-color-toggle-selected': MDCStandardDockedToolbarStyleDefinition['enabled-standard-selected-button-container-color'],
    'icon-color': MDCStandardDockedToolbarStyleDefinition['enabled-standard-selected-icon-color'],
    'icon-color-toggle-unselected': MDCStandardDockedToolbarStyleDefinition['enabled-standard-icon-color'],
    'icon-color-toggle-selected': MDCStandardDockedToolbarStyleDefinition['enabled-standard-selected-icon-color'],
})()

const vibrantActionStyles = overrideTokens<typeof FilledIconButtonDefinition>('--mdc-icon-button')({
    'container-color': MDCVibrantDockedToolbarStyleDefinition['enabled-vibrant-button-container-color'],
    'container-color-toggle-unselected': MDCVibrantDockedToolbarStyleDefinition['enabled-vibrant-button-container-color'],
    'container-color-toggle-selected': MDCVibrantDockedToolbarStyleDefinition['enabled-vibrant-selected-button-container-color'],
    'icon-color': MDCVibrantDockedToolbarStyleDefinition['enabled-vibrant-selected-icon-color'],
    'icon-color-toggle-unselected': MDCVibrantDockedToolbarStyleDefinition['enabled-vibrant-icon-color'],
    'icon-color-toggle-selected': MDCVibrantDockedToolbarStyleDefinition['enabled-vibrant-selected-icon-color'],
})()

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
                ${standardActionStyles};
                height: var(--_container-height);
            }
            :host:has(.container.vibrant) {
                ${vibrantBaseVars};
                ${vibrantVars};
                ${vibrantActionStyles};
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
                padding-inline-start: var(--_container-padding-inline-start);
                padding-inline-end: var(--_container-padding-inline-end);
                padding-block-start: var(--_container-padding-block-start);
                padding-block-end: var(--_container-padding-block-end);
            }
            .container.vibrant {
                padding-inline-start: var(--_container-padding-inline-start);
                padding-inline-end: var(--_container-padding-inline-end);
                padding-block-start: var(--_container-padding-block-start);
                padding-block-end: var(--_container-padding-block-end);
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
