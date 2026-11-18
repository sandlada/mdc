/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import { FocusRingDefinition } from '../focus-ring/focus-ring.definition'
import type { IconDefinition } from '../icon/icon.definition'
import type { RippleDefinition } from '../ripple/ripple.definition'
import {
    PrimaryFabMenuItemDefinition,
    SecondaryFabMenuItemDefinition,
    TertiaryFabMenuItemDefinition,
} from './fab-menu-item.definition'

const PrimaryTokens = stringifyTokens('--mdc-fab-menu-item')(PrimaryFabMenuItemDefinition)
const SecondaryTokens = stringifyTokens('--mdc-fab-menu-item')(SecondaryFabMenuItemDefinition)
const TertiaryTokens = stringifyTokens('--mdc-fab-menu-item')(TertiaryFabMenuItemDefinition)

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
        .item:not(.disabled):hover mdc-elevation { ${setLevel('hovered-')}; }
        .item:not(.disabled):focus-within mdc-elevation { ${setLevel('focused-')}; }
        .item:not(.disabled):active mdc-elevation { ${setLevel('pressed-')}; }
        .item.disabled mdc-elevation { ${setLevel('disabled-')}; }
    `
}

const getFocusRingStyles = () => {
    const shapes = overrideTokens<typeof FocusRingDefinition>('--mdc-focus-ring')({
        'shape-start-start': `var(--_container-shape-start-start)`,
        'shape-start-end': `var(--_container-shape-start-end)`,
        'shape-end-start': `var(--_container-shape-end-start)`,
        'shape-end-end': `var(--_container-shape-end-end)`,
    })()

    return css`
        .item mdc-focus-ring {
            ${shapes};
        }
    `
}

const getRippleStyles = () => {
    const styles = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
        'enabled-hovered-color': `var(--_hovered-state-layer-color)`,
        'enabled-hovered-opacity': `var(--_hovered-state-layer-opacity)`,
        'enabled-pressed-color': `var(--_pressed-state-layer-color)`,
        'enabled-pressed-opacity': `var(--_pressed-state-layer-opacity)`,
    })()

    return css`
        .item mdc-ripple {
            ${styles};
        }
    `
}

export const FabMenuItemStyles = [
    css`
        :host {
            display: inline-flex;
            ${PrimaryTokens};
        }

        :host([variant='secondary']) {
            ${SecondaryTokens};
        }

        :host([variant='tertiary']) {
            ${TertiaryTokens};
        }

        .item {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            gap: var(--_icon-label-space);
            block-size: var(--_container-height);
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            border-start-start-radius: min(var(--_container-shape-start-start), calc(var(--_container-height) / 2));
            border-start-end-radius: min(var(--_container-shape-start-end), calc(var(--_container-height) / 2));
            border-end-start-radius: min(var(--_container-shape-end-start), calc(var(--_container-height) / 2));
            border-end-end-radius: min(var(--_container-shape-end-end), calc(var(--_container-height) / 2));
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-label-color);
            border: none;
            outline: none;
            margin: 0;
            text-decoration: none;
            cursor: pointer;
            user-select: none;
            white-space: nowrap;
            -webkit-tap-highlight-color: transparent;
        }

        .item.disabled {
            cursor: default;
            pointer-events: none;
            background-color: color-mix(in srgb, var(--_disabled-container-color) calc(var(--_disabled-container-opacity) * 100%), transparent);
        }

        .icon {
            display: grid;
            place-content: center;
            position: relative;
            flex-shrink: 0;
            inline-size: var(--_icon-size);
            block-size: var(--_icon-size);
            font-size: var(--_icon-size);
            color: var(--_enabled-icon-color);
            fill: currentColor;
            ${overrideTokens<typeof IconDefinition>('--mdc-icon')({ 'enabled-size': `var(--_icon-size)` })()};
        }

        .item:not(.has-icon) .icon {
            display: none;
        }

        .label {
            position: relative;
            font-family: var(--_label-font);
            font-size: var(--_label-size);
            line-height: var(--_label-leading);
            font-weight: var(--_label-weight);
            letter-spacing: var(--_label-tracking);
            color: var(--_enabled-label-color);
        }

        .item:not(.disabled):hover .label { color: var(--_hovered-label-color); }
        .item:not(.disabled):focus-within .label { color: var(--_focused-label-color); }
        .item:not(.disabled):active .label { color: var(--_pressed-label-color); }

        .item:not(.disabled):hover .icon { color: var(--_hovered-icon-color); }
        .item:not(.disabled):focus-within .icon { color: var(--_focused-icon-color); }
        .item:not(.disabled):active .icon { color: var(--_pressed-icon-color); }

        .item.disabled .label {
            color: var(--_disabled-label-color);
            opacity: var(--_disabled-label-opacity);
        }

        .item.disabled .icon {
            color: var(--_disabled-icon-color);
            opacity: var(--_disabled-icon-opacity);
        }

        ${getElevationStyles()}
        ${getFocusRingStyles()}
        ${getRippleStyles()}

        @media (forced-colors: active) {
            .item {
                background-color: ButtonFace;
                color: ButtonText;
                border: 1px solid ButtonText;
            }
            .item:not(.disabled):hover,
            .item:not(.disabled):focus-visible {
                border-color: Highlight;
            }
            .item.disabled {
                border-color: GrayText;
                color: GrayText;
            }
            .item.disabled .label,
            .item.disabled .icon {
                color: GrayText;
            }
        }

        @media (prefers-contrast: more) {
            .item {
                outline: 2px solid currentColor;
            }
        }

        @media (prefers-contrast: less) {
            .item {
                outline: none;
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            .item.disabled .label,
            .item.disabled .icon {
                opacity: 1;
            }
        }
    `,
]
