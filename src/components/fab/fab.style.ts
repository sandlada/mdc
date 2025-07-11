/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import type { ElevationDefinition } from '../../component-definitions/elevation.definition'
import { PrimaryExtendedFabDefinition, PrimaryFabDefinition, SecondaryExtendedFabDefinition, SecondaryFabDefinition, TertiaryExtendedFabDefinition, TertiaryFabDefinition, TonalPrimaryExtendedFabDefinition, TonalPrimaryFabDefinition, TonalSecondaryExtendedFabDefinition, TonalSecondaryFabDefinition, TonalTertiaryExtendedFabDefinition, TonalTertiaryFabDefinition } from '../../component-definitions/fab.definition'
import type { FocusRingDefinition } from '../../component-definitions/focus-ring.definition'
import type { IconDefinition } from '../../component-definitions/icon.definition'
import type { RippleDefinition } from '../../component-definitions/ripple.definition'
import { createWrappedTokens, overrideComponentTokens, stringTokens } from '../../utils/tokens'


const tonalPrimaryFabToken = createWrappedTokens('--mdc-tonal-primary-fab', TonalPrimaryFabDefinition)
const tonalSecondaryFabToken = createWrappedTokens('--mdc-tonal-secondary-fab', TonalSecondaryFabDefinition)
const tonalTertiaryFabToken = createWrappedTokens('--mdc-tonal-tertiary-fab', TonalTertiaryFabDefinition)
const primaryFabToken = createWrappedTokens('--mdc-primary-fab', PrimaryFabDefinition)
const secondaryFabToken = createWrappedTokens('--mdc-secondary-fab', SecondaryFabDefinition)
const tertiaryFabToken = createWrappedTokens('--mdc-tertiary-fab', TertiaryFabDefinition)
const tonalPrimaryExtendedFabToken = createWrappedTokens('--mdc-tonal-primary-extended-fab', TonalPrimaryExtendedFabDefinition)
const tonalSecondaryExtendedFabToken = createWrappedTokens('--mdc-tonal-secondary-extended-fab', TonalSecondaryExtendedFabDefinition)
const tonalTertiaryExtendedFabToken = createWrappedTokens('--mdc-tonal-tertiary-extended-fab', TonalTertiaryExtendedFabDefinition)
const PrimaryExtendedFabToken = createWrappedTokens('--mdc-primary-extended-fab', PrimaryExtendedFabDefinition)
const secondaryExtendedFabToken = createWrappedTokens('--mdc-secondary-extended-fab', SecondaryExtendedFabDefinition)
const tertiaryExtendedFabToken = createWrappedTokens('--mdc-tertiary-extended-fab', TertiaryExtendedFabDefinition)

const tonalPrimaryFabTokenString = unsafeCSS(stringTokens(tonalPrimaryFabToken))
const tonalSecondaryFabTokenString = unsafeCSS(stringTokens(tonalSecondaryFabToken))
const tonalTertiaryFabTokenString = unsafeCSS(stringTokens(tonalTertiaryFabToken))
const PrimaryFabTokenString = unsafeCSS(stringTokens(primaryFabToken))
const secondaryFabTokenString = unsafeCSS(stringTokens(secondaryFabToken))
const tertiaryFabTokenString = unsafeCSS(stringTokens(tertiaryFabToken))
const tonalPrimaryExtendedFabTokenString = unsafeCSS(stringTokens(tonalPrimaryExtendedFabToken))
const tonalSecondaryExtendedFabTokenString = unsafeCSS(stringTokens(tonalSecondaryExtendedFabToken))
const tonalTertiaryExtendedFabTokenString = unsafeCSS(stringTokens(tonalTertiaryExtendedFabToken))
const primaryExtendedFabTokenString = unsafeCSS(stringTokens(PrimaryExtendedFabToken))
const secondaryExtendedFabTokenString = unsafeCSS(stringTokens(secondaryExtendedFabToken))
const tertiaryExtendedFabTokenString = unsafeCSS(stringTokens(tertiaryExtendedFabToken))

const getElevationStyles = () => {
    const getSingleStateLevelStyles = (state: string) => unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', {
        "level": `var(--_${state}container-elevation)`,
    })))

    const getShadowColorStyles = () => unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', {
        "shadow-color": `var(--_container-shadow-color)`,
    })))

    return css`
        mdc-elevation {
            ${getShadowColorStyles()};
            ${getSingleStateLevelStyles('')};
        }
        .button:hover mdc-elevation {
            ${getSingleStateLevelStyles('hovered-')};
        }
        .button:focus-within mdc-elevation {
            ${getSingleStateLevelStyles('focused-')};
        }
        .button:active mdc-elevation {
            ${getSingleStateLevelStyles('pressed-')};
        }

    `
}
const getFocusRingStyles = () => {
    const getShapes = (size: string) => unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof FocusRingDefinition>('--mdc-focus-ring', {
        "shape-end-end": `var(--_${size}-container-shape-end-end)`,
        "shape-end-start": `var(--_${size}-container-shape-end-start)`,
        "shape-start-end": `var(--_${size}-container-shape-start-end)`,
        "shape-start-start": `var(--_${size}-container-shape-start-start)`,
    })))
    return css`
        .button.small mdc-focus-ring {
            ${getShapes('small')};
        }
        .button.medium mdc-focus-ring {
            ${getShapes('medium')};
        }
        .button.large mdc-focus-ring {
            ${getShapes('large')};
        }

    `
}
const getRippleStyles = () => {
    const styles = unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
        "hovered-color": `var(--_hovered-state-layer-color)`,
        "hovered-opacity": `var(--_hovered-state-layer-opacity)`,
        "pressed-color": `var(--_pressed-state-layer-color)`,
        "pressed-opacity": `var(--_pressed-state-layer-opacity)`,
    })))

    return css`
        .button mdc-ripple {
            ${styles};
        }

    `
}
const iconStyle = css`
    ::slotted(*) {
        display: inline-flex;
        position: relative;
        writing-mode: horizontal-tb;
        fill: currentColor;
        flex-shrink: 0;
    }
    .button.small ::slotted(*) {
        inline-size: var(--_small-icon-size);
        block-size: var(--_small-icon-size);
        font-size: var(--_small-icon-size);
    }
    .button.medium ::slotted(*) {
        inline-size: var(--_medium-icon-size);
        block-size: var(--_medium-icon-size);
        font-size: var(--_medium-icon-size);
    }
    .button.large ::slotted(*) {
        inline-size: var(--_large-icon-size);
        block-size: var(--_large-icon-size);
        font-size: var(--_large-icon-size);
    }

    .button.small mdc-icon {
        ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_small-icon-size)` })))};
    }
    .button.medium mdc-icon {
        ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_medium-icon-size)` })))};
    }
    .button.large mdc-icon {
        ${unsafeCSS(stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_large-icon-size)` })))};
    }

    :host ::slotted(*) {
        color: var(--_icon-color);
    }
    :host(:hover) ::slotted(*) {
        color: var(--_hovered-icon-color);
    }
    :host(:focus-within) ::slotted(*) {
        color: var(--_focused-icon-color);
    }
    :host(:active) ::slotted(*) {
        color: var(--_pressed-icon-color);
    }
`
const shapeStyle = css`
    .button.small {
        border-end-end-radius: min(var(--_small-container-shape-end-end), calc(var(--_small-container-height) / 2));
        border-end-start-radius: min(var(--_small-container-shape-end-start), calc(var(--_small-container-height) / 2));
        border-start-end-radius: min(var(--_small-container-shape-start-end), calc(var(--_small-container-height) / 2));
        border-start-start-radius: min(var(--_small-container-shape-start-start), calc(var(--_small-container-height) / 2));
    }
    .button.medium {
        border-end-end-radius: min(var(--_medium-container-shape-end-end), calc(var(--_medium-container-height) / 2));
        border-end-start-radius: min(var(--_medium-container-shape-end-start), calc(var(--_medium-container-height) / 2));
        border-start-end-radius: min(var(--_medium-container-shape-start-end), calc(var(--_medium-container-height) / 2));
        border-start-start-radius: min(var(--_medium-container-shape-start-start), calc(var(--_medium-container-height) / 2));
    }
    .button.large {
        border-end-end-radius: min(var(--_large-container-shape-end-end), calc(var(--_large-container-height) / 2));
        border-end-start-radius: min(var(--_large-container-shape-end-start), calc(var(--_large-container-height) / 2));
        border-start-end-radius: min(var(--_large-container-shape-start-end), calc(var(--_large-container-height) / 2));
        border-start-start-radius: min(var(--_large-container-shape-start-start), calc(var(--_large-container-height) / 2));
    }
`

const shared = [
    css`
        @layer mdc.fab.composite.elevation {
            ${getElevationStyles()}
        }
        @layer mdc.fab.composite.focus-ring {
            ${getFocusRingStyles()}
        }
        @layer mdc.fab.composite.ripple {
            ${getRippleStyles()}
        }
        @layer mdc.fab.composite.icon {
            ${iconStyle}
        }
    `,
    css`
        @layer mdc.fab.base {
            :host {
                border: none;
                outline: none;
                user-select: none;
                display: inline-flex;
                vertical-align: top;
            }

            .button {
                all: unset;
                cursor: pointer;
                position: relative;
                display: flex;
                align-items: center;
                background: var(--_container-color);
                justify-content: center;
            }

            /* Shape & Size */

            ${shapeStyle}

            .button.small {
                width: var(--_small-container-width);
                height: var(--_small-container-height);
            }
            .button.medium {
                width: var(--_medium-container-width);
                height: var(--_medium-container-height);
            }
            .button.large {
                width: var(--_large-container-width);
                height: var(--_large-container-height);
            }
        }
    `
]

export const tonalPrimaryFabStyles = [
    shared,
    css`
        @layer mdc.fab.tonal-primary {
            :host {
                ${tonalPrimaryFabTokenString};
            }
        }
    `
]
export const tonalSecondaryFabStyles = [
    shared,
    css`
        @layer mdc.fab.tonal-secondary {
            :host {
                ${tonalSecondaryFabTokenString};
            }
        }
    `
]
export const tonalTertiaryFabStyles = [
    shared,
    css`
        @layer mdc.fab.tonal-tertiary {
            :host {
                ${tonalTertiaryFabTokenString};
            }
        }
    `
]
export const primaryFabStyles = [
    shared,
    css`
        @layer mdc.fab.Primary {
            :host {
                ${PrimaryFabTokenString};
            }
        }
    `
]
export const secondaryFabStyles = [
    shared,
    css`
        @layer mdc.fab.secondary {
            :host {
                ${secondaryFabTokenString};
            }
        }
    `
]
export const tertiaryFabStyles = [
    shared,
    css`
        @layer mdc.fab.tertiary {
            :host {
                ${tertiaryFabTokenString};
            }
        }
    `
]

// Extended

const extendedLabelStyle = css`
    @layer mdc.extended-fab.base {
        .label {
            color: var(--_label-color);
        }
        :host(:hover) .label {
            color: var(--_hovered-label-color);
        }
        :host(:focus-within) .label {
            color: var(--_focused-label-color);
        }
        :host(:active) .label {
            color: var(--_pressed-label-color);
        }

        .button.extended {
            &.small .label {
                font-family: var(--_small-label-font);
                line-height: var(--_small-label-line-height);
                font-size: var(--_small-label-size);
                letter-spacing: var(--_small-label-tracking);
                font-weight: var(--_small-label-weight);
            }
            &.medium .label {
                font-family: var(--_medium-label-font);
                line-height: var(--_medium-label-line-height);
                font-size: var(--_medium-label-size);
                letter-spacing: var(--_medium-label-tracking);
                font-weight: var(--_medium-label-weight);
            }
            &.large .label {
                font-family: var(--_large-label-font);
                line-height: var(--_large-label-line-height);
                font-size: var(--_large-label-size);
                letter-spacing: var(--_large-label-tracking);
                font-weight: var(--_large-label-weight);
            }
        }
    }
`
const extendedSharedStyles = [
    extendedLabelStyle,
    css`
        @layer mdc.extended-fab.composite.elevation {
            ${getElevationStyles()}
        }
        @layer mdc.extended-fab.composite.focus-ring {
            ${getFocusRingStyles()}
        }
        @layer mdc.extended-fab.composite.ripple {
            ${getRippleStyles()}
        }
        @layer mdc.extended-fab.composite.icon {
            ${iconStyle}
        }
    `,
    css`
        @layer mdc.extended-fab.base {
            :host {
                border: none;
                outline: none;
                user-select: none;
                display: inline-flex;
                vertical-align: top;
            }

            .button {
                all: unset;
                cursor: pointer;
                position: relative;
                display: flex;
                align-items: center;
                background: var(--_container-color);
                width: fit-content;
            }

            /* Shape & Size */

            ${shapeStyle}

            .button.small {
                height: var(--_small-container-height);
            }
            .button.medium {
                height: var(--_medium-container-height);
            }
            .button.large {
                height: var(--_large-container-height);
            }

            .button.small {
                gap: var(--_small-icon-label-space);
                padding-inline-start: var(--_small-leading-space);
                padding-inline-end: var(--_small-trailing-space);
            }
            .button.medium {
                gap: var(--_medium-icon-label-space);
                padding-inline-start: var(--_medium-leading-space);
                padding-inline-end: var(--_medium-trailing-space);
            }
            .button.large {
                gap: var(--_large-icon-label-space);
                padding-inline-start: var(--_large-leading-space);
                padding-inline-end: var(--_large-trailing-space);
            }
        }
    `
]

export const tonalPrimaryExtendedFabStyles = [
    css`
        @layer mdc.extended-fab.variable {
            :host {
                ${tonalPrimaryExtendedFabTokenString};
            }
        }
    `,
    extendedSharedStyles,
]
export const tonalSecondaryExtendedFabStyles = [
    css`
        @layer mdc.extended-fab.variable {
            :host {
                ${tonalSecondaryExtendedFabTokenString};
            }
        }
    `,
    extendedSharedStyles,
]
export const tonalTertiaryExtendedFabStyles = [
    css`
        @layer mdc.extended-fab.variable {
            :host {
                ${tonalTertiaryExtendedFabTokenString};
            }
        }
    `,
    extendedSharedStyles,
]
export const primaryExtendedFabStyles = [
    css`
        @layer mdc.extended-fab.variable {
            :host {
                ${primaryExtendedFabTokenString};
            }
        }
    `,
    extendedSharedStyles,
]
export const secondaryExtendedFabStyles = [
    css`
        @layer mdc.extended-fab.variable {
            :host {
                ${secondaryExtendedFabTokenString};
            }
        }
    `,
    extendedSharedStyles,
]
export const tertiaryExtendedFabStyles = [
    css`
        @layer mdc.extended-fab.variable {
            :host {
                ${tertiaryExtendedFabTokenString};
            }
        }
    `,
    extendedSharedStyles,
]
