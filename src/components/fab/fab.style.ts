/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import type { ElevationDefinition } from '../../component-definitions/elevation.definition'
import { PrimaryExtendedFabDefinition, SecondaryExtendedFabDefinition, TertiaryExtendedFabDefinition, TonalPrimaryExtendedFabDefinition, TonalSecondaryExtendedFabDefinition, TonalTertiaryExtendedFabDefinition } from '../../component-definitions/fab.definition'
import type { FocusRingDefinition } from '../../component-definitions/focus-ring.definition'
import type { IconDefinition } from '../../component-definitions/icon.definition'
import type { RippleDefinition } from '../../component-definitions/ripple.definition'
import { createWrappedTokens, overrideComponentTokens, stringTokens } from '../../utils/tokens'

const t = {
    tpe: createWrappedTokens('--mdc-fab', TonalPrimaryExtendedFabDefinition),
    tse: createWrappedTokens('--mdc-fab', TonalSecondaryExtendedFabDefinition),
    tte: createWrappedTokens('--mdc-fab', TonalTertiaryExtendedFabDefinition),
    pe: createWrappedTokens('--mdc-fab', PrimaryExtendedFabDefinition),
    se: createWrappedTokens('--mdc-fab', SecondaryExtendedFabDefinition),
    te: createWrappedTokens('--mdc-fab', TertiaryExtendedFabDefinition),
} as const
const tpes = stringTokens(t.tpe)
const tses = stringTokens(t.tse)
const ttes = stringTokens(t.tte)
const pes = stringTokens(t.pe)
const ses = stringTokens(t.se)
const tes = stringTokens(t.te)

const getElevationStyles = () => {
    const getSingleStateLevelStyles = (state: '' | 'hovered-' | 'pressed-' | 'focused-') => stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', {
        "level": `var(--_${state}container-elevation)`,
    }))
    const getShadowColorStyles = () => stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', {
        "shadow-color": `var(--_container-shadow-color)`,
    }))
    return css`
        mdc-elevation {
            ${getShadowColorStyles()};
            ${getSingleStateLevelStyles('')};
        }
        button:hover mdc-elevation {${getSingleStateLevelStyles('hovered-')};}
        button:focus-within mdc-elevation {${getSingleStateLevelStyles('focused-')};}
        button:active mdc-elevation {${getSingleStateLevelStyles('pressed-')};}
    `
}
const getFocusRingStyles = () => {
    const getShapes = (size: 'small' | 'medium' | 'large') => stringTokens(overrideComponentTokens<keyof typeof FocusRingDefinition>('--mdc-focus-ring', {
        "shape-end-end": `var(--_${size}-container-shape-end-end)`,
        "shape-end-start": `var(--_${size}-container-shape-end-start)`,
        "shape-start-end": `var(--_${size}-container-shape-start-end)`,
        "shape-start-start": `var(--_${size}-container-shape-start-start)`,
    }))
    return css`
        .button.small mdc-focus-ring {${getShapes('small')};}
        .button.medium mdc-focus-ring {${getShapes('medium')};}
        .button.large mdc-focus-ring {${getShapes('large')};}
    `
}
const getRippleStyles = () => {
    const styles = stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
        "hovered-color": `var(--_hovered-state-layer-color)`,
        "hovered-opacity": `var(--_hovered-state-layer-opacity)`,
        "pressed-color": `var(--_pressed-state-layer-color)`,
        "pressed-opacity": `var(--_pressed-state-layer-opacity)`,
    }))
    return css`
        button mdc-ripple {${styles};}
    `
}
const getIconStyles = () => {
    const getSize = (size: 'small' | 'medium' | 'large') => unsafeCSS(`
        inline-size: var(--_${size}-icon-size);
        block-size: var(--_${size}-icon-size);
        font-size: var(--_${size}-icon-size);
    `)
    return css`
        .icon,
        ::slotted([name="icon"]) {
            display: inline-flex;
            position: relative;
            writing-mode: horizontal-tb;
            fill: currentColor;
            flex-shrink: 0;
        }
        button.small :is(.icon, ::slotted([name="icon"])) {${getSize('small')};}
        button.medium :is(.icon, ::slotted([name="icon"])) {${getSize('medium')};}
        button.large :is(.icon, ::slotted([name="icon"])) {${getSize('large')};}
        button.small .icon mdc-icon {${stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_small-icon-size)` }))};}
        button.medium .icon mdc-icon {${stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_medium-icon-size)` }))};}
        button.large .icon mdc-icon {${stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', { size: `var(--_large-icon-size)` }))};}

        button :is(.icon, ::slotted([name="icon"])) {
            color: var(--_icon-color);
        }
        button:hover :is(.icon, ::slotted([name="icon"])) {
            color: var(--_hovered-icon-color);
        }
        button:focus-within :is(.icon, ::slotted([name="icon"])) {
            color: var(--_focused-icon-color);
        }
        button:active :is(.icon, ::slotted([name="icon"])) {
            color: var(--_pressed-icon-color);
        }

        button:not(.has-icon) .icon {
            display: none;
        }
    `
}

const shapeStyles = css`
    button.small {
        border-end-end-radius: min(var(--_small-container-shape-end-end), calc(var(--_small-container-height) / 2));
        border-end-start-radius: min(var(--_small-container-shape-end-start), calc(var(--_small-container-height) / 2));
        border-start-end-radius: min(var(--_small-container-shape-start-end), calc(var(--_small-container-height) / 2));
        border-start-start-radius: min(var(--_small-container-shape-start-start), calc(var(--_small-container-height) / 2));
    }
    button.medium {
        border-end-end-radius: min(var(--_medium-container-shape-end-end), calc(var(--_medium-container-height) / 2));
        border-end-start-radius: min(var(--_medium-container-shape-end-start), calc(var(--_medium-container-height) / 2));
        border-start-end-radius: min(var(--_medium-container-shape-start-end), calc(var(--_medium-container-height) / 2));
        border-start-start-radius: min(var(--_medium-container-shape-start-start), calc(var(--_medium-container-height) / 2));
    }
    button.large {
        border-end-end-radius: min(var(--_large-container-shape-end-end), calc(var(--_large-container-height) / 2));
        border-end-start-radius: min(var(--_large-container-shape-end-start), calc(var(--_large-container-height) / 2));
        border-start-end-radius: min(var(--_large-container-shape-start-end), calc(var(--_large-container-height) / 2));
        border-start-start-radius: min(var(--_large-container-shape-start-start), calc(var(--_large-container-height) / 2));
    }
`
const labelStyles = css`
    button.small .label {
        font-family: var(--_small-label-font);
        line-height: var(--_small-label-line-height);
        font-size: var(--_small-label-size);
        letter-spacing: var(--_small-label-tracking);
        font-weight: var(--_small-label-weight);
    }
    button.medium .label {
        font-family: var(--_medium-label-font);
        line-height: var(--_medium-label-line-height);
        font-size: var(--_medium-label-size);
        letter-spacing: var(--_medium-label-tracking);
        font-weight: var(--_medium-label-weight);
    }
    button.large .label {
        font-family: var(--_large-label-font);
        line-height: var(--_large-label-line-height);
        font-size: var(--_large-label-size);
        letter-spacing: var(--_large-label-tracking);
        font-weight: var(--_large-label-weight);
    }
    button .label {
        color: var(--_label-color);
    }
    button:hover .label {
        color: var(--_hovered-label-color);
    }
    button:focus-within .label {
        color: var(--_focused-label-color);
    }
    button:active .label {
        color: var(--_pressed-label-color);
    }

    button .label {
    }
    button:not(.extended.has-label) .label {
        display: none;
        opacity: 0;
    }
`
const colorVariants = css`
    :host([variant="primary"]) {${pes};}
    :host([variant="secondary"]) {${ses};}
    :host([variant="tertiary"]) {${tes};}
    :host([variant="tonal-primary"]) {${tpes};}
    :host([variant="tonal-secondary"]) {${tses};}
    :host([variant="tonal-tertiary"]) {${ttes};}
`
const containerStyles = css`
    button {
        all: unset;
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
        background: var(--_container-color);
        transition-property: width, background, padding;
        transition-duration: 200ms;
    }
    button.extended {
        width: fit-content;
    }
    button:not(.extended) {
        place-content: center;
    }
    button:not(.extended).small {
        width: var(--_small-container-width);
    }
    button:not(.extended).medium {
        width: var(--_medium-container-width);
    }
    button:not(.extended).large {
        width: var(--_large-container-width);
    }
    button.small {
        gap: var(--_small-icon-label-space);
        height: var(--_small-container-height);
    }
    button.medium {
        gap: var(--_medium-icon-label-space);
        height: var(--_medium-container-height);
    }
    button.large {
        gap: var(--_large-icon-label-space);
        height: var(--_large-container-height);
    }

    button.extended.small {
        padding-inline-start: var(--_small-leading-space);
        padding-inline-end: var(--_small-trailing-space);
    }
    button.extended.medium {
        padding-inline-start: var(--_medium-leading-space);
        padding-inline-end: var(--_medium-trailing-space);
    }
    button.extended.large {
        padding-inline-start: var(--_large-leading-space);
        padding-inline-end: var(--_large-trailing-space);
    }
`

export const fabStyles = [
    getElevationStyles(),
    getFocusRingStyles(),
    getRippleStyles(),
    getIconStyles(),
    shapeStyles,
    labelStyles,
    colorVariants,
    containerStyles,
    css`
        @layer mdc.extended-fab.base {
            :host {
                border: none;
                outline: none;
                user-select: none;
                display: inline-flex;
                vertical-align: top;
            }
        }
    `
]
