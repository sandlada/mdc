/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import { FocusRingDefinition } from '../focus-ring/focus-ring.definition'
import type { IconDefinition } from '../icon/icon.definition'
import type { RippleDefinition } from '../ripple/ripple.definition'
import {
    PrimaryFabMenuDefinition,
    SecondaryFabMenuDefinition,
    TertiaryFabMenuDefinition,
} from './fab-menu.definition'

const PrimaryTokens = stringifyTokens('--mdc-fab-menu')(PrimaryFabMenuDefinition)
const SecondaryTokens = stringifyTokens('--mdc-fab-menu')(SecondaryFabMenuDefinition)
const TertiaryTokens = stringifyTokens('--mdc-fab-menu')(TertiaryFabMenuDefinition)

const getElevationStyles = () => {
    const setLevel = (state: 'enabled-' | 'hovered-' | 'focused-' | 'pressed-' | 'disabled-') =>
        overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
            'level': `var(--_${state}container-elevation)`,
        })()
    const shadowColor = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
        'shadow-color': `var(--_enabled-container-shadow-color)`,
    })()

    return css`
        mdc-elevation {
            ${shadowColor};
            ${setLevel('enabled-')};
        }
        .toggle-fab:not(:disabled):hover mdc-elevation { ${setLevel('hovered-')}; }
        .toggle-fab:not(:disabled):focus-within mdc-elevation { ${setLevel('focused-')}; }
        .toggle-fab:not(:disabled):active mdc-elevation { ${setLevel('pressed-')}; }
        .toggle-fab:disabled mdc-elevation { ${setLevel('disabled-')}; }
    `
}

const getFocusRingStyles = () => {
    const getShapes = (size: 'small' | 'medium' | 'large') =>
        overrideTokens<typeof FocusRingDefinition>('--mdc-focus-ring')({
            'shape-start-start': `var(--_${size}-container-shape-start-start)`,
            'shape-start-end': `var(--_${size}-container-shape-start-end)`,
            'shape-end-start': `var(--_${size}-container-shape-end-start)`,
            'shape-end-end': `var(--_${size}-container-shape-end-end)`,
        })()

    const closeShapes = overrideTokens<typeof FocusRingDefinition>('--mdc-focus-ring')({
        'shape-start-start': `var(--_close-button-container-shape-start-start)`,
        'shape-start-end': `var(--_close-button-container-shape-start-end)`,
        'shape-end-start': `var(--_close-button-container-shape-end-start)`,
        'shape-end-end': `var(--_close-button-container-shape-end-end)`,
    })()

    return css`
        .toggle-fab.small mdc-focus-ring { ${getShapes('small')}; }
        .toggle-fab.medium mdc-focus-ring { ${getShapes('medium')}; }
        .toggle-fab.large mdc-focus-ring { ${getShapes('large')}; }
        :host([expanded]) .toggle-fab mdc-focus-ring { ${closeShapes}; }
    `
}

const getRippleStyles = () => {
    const closedRipple = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
        'enabled-hovered-color': `var(--_hovered-state-layer-color)`,
        'enabled-hovered-opacity': `var(--_hovered-state-layer-opacity)`,
        'enabled-pressed-color': `var(--_pressed-state-layer-color)`,
        'enabled-pressed-opacity': `var(--_pressed-state-layer-opacity)`,
    })()

    const closeButtonRipple = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
        'enabled-hovered-color': `var(--_close-button-hovered-state-layer-color)`,
        'enabled-hovered-opacity': `var(--_hovered-state-layer-opacity)`,
        'enabled-pressed-color': `var(--_close-button-pressed-state-layer-color)`,
        'enabled-pressed-opacity': `var(--_pressed-state-layer-opacity)`,
    })()

    return css`
        .toggle-fab mdc-ripple { ${closedRipple}; }
        :host([expanded]) .toggle-fab mdc-ripple { ${closeButtonRipple}; }
    `
}

const getIconStyles = () => {
    const iconSize = (size: 'small' | 'medium' | 'large') => unsafeCSS(`
        inline-size: var(--_${size}-icon-size);
        block-size: var(--_${size}-icon-size);
        font-size: var(--_${size}-icon-size);
    `)

    return css`
        .icon-slot {
            display: grid;
            place-content: center;
            position: relative;
            writing-mode: horizontal-tb;
            fill: currentColor;
            flex-shrink: 0;
            color: var(--_enabled-icon-color);
            transition: color 200ms cubic-bezier(0.2, 0, 0, 1), transform 250ms cubic-bezier(0.2, 0, 0, 1), opacity 150ms linear;
        }
        .icon-slot svg {
            inline-size: 100%;
            block-size: 100%;
            fill: currentColor;
        }
        .toggle-fab.small .icon-slot { ${iconSize('small')}; }
        .toggle-fab.medium .icon-slot { ${iconSize('medium')}; }
        .toggle-fab.large .icon-slot { ${iconSize('large')}; }

        .toggle-fab.small .icon-slot { ${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'enabled-size': `var(--_small-icon-size)` })()}; }
        .toggle-fab.medium .icon-slot { ${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'enabled-size': `var(--_medium-icon-size)` })()}; }
        .toggle-fab.large .icon-slot { ${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'enabled-size': `var(--_large-icon-size)` })()}; }

        :host([expanded]) .toggle-fab .icon-slot {
            inline-size: var(--_close-button-icon-size);
            block-size: var(--_close-button-icon-size);
            font-size: var(--_close-button-icon-size);
            color: var(--_close-button-enabled-icon-color);
            ${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'enabled-size': `var(--_close-button-icon-size)` })()};
        }

        .toggle-fab:not(:disabled):hover .icon-slot { color: var(--_hovered-icon-color); }
        .toggle-fab:not(:disabled):focus-within .icon-slot { color: var(--_focused-icon-color); }
        .toggle-fab:not(:disabled):active .icon-slot { color: var(--_pressed-icon-color); }

        :host([expanded]) .toggle-fab:not(:disabled):hover .icon-slot { color: var(--_close-button-hovered-icon-color); }
        :host([expanded]) .toggle-fab:not(:disabled):focus-within .icon-slot { color: var(--_close-button-focused-icon-color); }
        :host([expanded]) .toggle-fab:not(:disabled):active .icon-slot { color: var(--_close-button-pressed-icon-color); }

        .toggle-fab:disabled .icon-slot {
            color: var(--_disabled-icon-color);
            opacity: var(--_disabled-icon-opacity);
        }

        .icon-close {
            display: none;
        }
        :host([expanded]) .icon-open {
            display: none;
        }
        :host([expanded]) .icon-close {
            display: grid;
        }
    `
}

export const FabMenuStyles = [
    css`
        :host {
            display: inline-flex;
            flex-direction: column;
            align-items: flex-end;
            position: relative;
            z-index: 1;
            ${PrimaryTokens};
        }

        :host([variant='secondary']) {
            ${SecondaryTokens};
        }

        :host([variant='tertiary']) {
            ${TertiaryTokens};
        }

        :host([horizontal-alignment='start']) {
            align-items: flex-start;
        }

        :host([horizontal-alignment='center']) {
            align-items: center;
        }

        :host([horizontal-alignment='end']) {
            align-items: flex-end;
        }

        .items {
            position: absolute;
            inset-block-end: calc(100% + var(--_close-button-between-space));
            inset-inline-end: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: var(--_item-between-space);
            width: max-content;
            z-index: 1;
        }

        :host([horizontal-alignment='start']) .items {
            inset-inline-start: 0;
            inset-inline-end: auto;
            align-items: flex-start;
        }

        :host([horizontal-alignment='center']) .items {
            inset-inline-start: 50%;
            inset-inline-end: auto;
            transform: translateX(-50%);
            align-items: center;
        }

        :host([horizontal-alignment='end']) .items {
            inset-inline-end: 0;
            inset-inline-start: auto;
            align-items: flex-end;
        }

        .items.collapsed {
            display: none;
        }

        .trigger {
            display: inline-flex;
        }

        .toggle-fab {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            border: none;
            outline: none;
            padding: 0;
            margin: 0;
            cursor: pointer;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            background-color: var(--_enabled-container-color);
            transition:
                inline-size 250ms cubic-bezier(0.2, 0, 0, 1),
                block-size 250ms cubic-bezier(0.2, 0, 0, 1),
                border-radius 250ms cubic-bezier(0.2, 0, 0, 1),
                background-color 200ms cubic-bezier(0.2, 0, 0, 1);
        }

        .toggle-fab.small {
            inline-size: var(--_small-container-width);
            block-size: var(--_small-container-height);
            border-start-start-radius: min(var(--_small-container-shape-start-start), calc(var(--_small-container-height) / 2));
            border-start-end-radius: min(var(--_small-container-shape-start-end), calc(var(--_small-container-height) / 2));
            border-end-start-radius: min(var(--_small-container-shape-end-start), calc(var(--_small-container-height) / 2));
            border-end-end-radius: min(var(--_small-container-shape-end-end), calc(var(--_small-container-height) / 2));
        }

        .toggle-fab.medium {
            inline-size: var(--_medium-container-width);
            block-size: var(--_medium-container-height);
            border-start-start-radius: min(var(--_medium-container-shape-start-start), calc(var(--_medium-container-height) / 2));
            border-start-end-radius: min(var(--_medium-container-shape-start-end), calc(var(--_medium-container-height) / 2));
            border-end-start-radius: min(var(--_medium-container-shape-end-start), calc(var(--_medium-container-height) / 2));
            border-end-end-radius: min(var(--_medium-container-shape-end-end), calc(var(--_medium-container-height) / 2));
        }

        .toggle-fab.large {
            inline-size: var(--_large-container-width);
            block-size: var(--_large-container-height);
            border-start-start-radius: min(var(--_large-container-shape-start-start), calc(var(--_large-container-height) / 2));
            border-start-end-radius: min(var(--_large-container-shape-start-end), calc(var(--_large-container-height) / 2));
            border-end-start-radius: min(var(--_large-container-shape-end-start), calc(var(--_large-container-height) / 2));
            border-end-end-radius: min(var(--_large-container-shape-end-end), calc(var(--_large-container-height) / 2));
        }

        :host([expanded]) .toggle-fab {
            inline-size: var(--_close-button-container-width);
            block-size: var(--_close-button-container-height);
            background-color: var(--_close-button-enabled-container-color);
            border-start-start-radius: min(var(--_close-button-container-shape-start-start), calc(var(--_close-button-container-height) / 2));
            border-start-end-radius: min(var(--_close-button-container-shape-start-end), calc(var(--_close-button-container-height) / 2));
            border-end-start-radius: min(var(--_close-button-container-shape-end-start), calc(var(--_close-button-container-height) / 2));
            border-end-end-radius: min(var(--_close-button-container-shape-end-end), calc(var(--_close-button-container-height) / 2));
        }

        .toggle-fab:disabled {
            cursor: default;
            pointer-events: none;
            background-color: color-mix(in srgb, var(--_disabled-container-color) calc(var(--_disabled-container-opacity) * 100%), transparent);
        }

        ${getElevationStyles()}
        ${getFocusRingStyles()}
        ${getRippleStyles()}
        ${getIconStyles()}

        @media (forced-colors: active) {
            .toggle-fab {
                background-color: ButtonFace;
                color: ButtonText;
                border: 1px solid ButtonText;
            }
            .toggle-fab:hover,
            .toggle-fab:focus-visible {
                border-color: Highlight;
            }
            .toggle-fab:disabled {
                border-color: GrayText;
                color: GrayText;
            }
            .icon-slot {
                color: ButtonText;
            }
            .toggle-fab:disabled .icon-slot {
                color: GrayText;
            }
        }

        @media (prefers-contrast: more) {
            .toggle-fab {
                outline: 2px solid currentColor;
            }
        }

        @media (prefers-contrast: less) {
            .toggle-fab {
                outline: none;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .toggle-fab,
            .icon-slot {
                transition: none;
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            .toggle-fab:disabled {
                opacity: 1;
            }
        }
    `,
]
