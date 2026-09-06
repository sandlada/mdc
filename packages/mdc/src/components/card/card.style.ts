/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import {
    CardDefinitionVariants,
    ElevatedCardDefinition,
    FilledCardDefinition,
    OutlinedCardDefinition
} from '../../component-definitions/card.definition'
import type { ElevationDefinition } from '../../component-definitions/elevation.definition'
import type { RippleDefinition } from '../../component-definitions/ripple.definition'
import { mapStateTriggers, pipe } from '../../utils/styles'
import { createStyleSheet, overrideTokens, stringifyTokens } from '../../utils/styles/lit'

const stringify = stringifyTokens('--mdc-card')
const filled = stringify(FilledCardDefinition)
const outlined = stringify(OutlinedCardDefinition)
const elevated = stringify(ElevatedCardDefinition)

const stylePart = pipe(
    mapStateTriggers({
        'enabled': '',
        'hovered': ':hover',
        'focused': ':focus-within',
        'pressed': ':active',
        // 'dragged': ':drag',
        'disabled': '.disabled',
        'round': '.round',
        'square': '.square',
    }),
    createStyleSheet
)(CardDefinitionVariants)(() => css`
    @layer mdc.card.component {
        :host {
            display: inline-flex;
            box-sizing: border-box;
            vertical-align: top;
            outline: none;
            -webkit-tap-highlight-color: transparent;
            margin-inline-start: var(--_container-margin-inline-start);
            margin-inline-end: var(--_container-margin-inline-end);
            margin-block-start: var(--_container-margin-block-start);
            margin-block-end: var(--_container-margin-block-end);
        }

        .container {
            all: unset;
            position: relative;
            display: flex;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            outline: none;
            border: none;
            transition: background-color 200ms ease, border-color 200ms ease, opacity 200ms ease;
        }
        @state(.container) .container {
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
        }
        @state(.container) .container {
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-start-radius: var(--_container-shape-end-start);
            border-end-end-radius: var(--_container-shape-end-end);
        }

        .container.stacked {
            flex-direction: column;
        }

        .container.horizontal {
            flex-direction: row;
        }

        .container.interactive {
            cursor: pointer;
            user-select: none;
        }

        .container.disabled {
            cursor: default;
            user-select: none;
            pointer-events: none;
            opacity: var(--_disabled-container-opacity);
            cursor: not-allowed;
        }

        .container > .background {
            position: absolute;
            inset: 0;
            box-sizing: border-box;
            border-radius: inherit;
            background-color: var(--_enabled-container-color);
            z-index: 0;
            pointer-events: none;
        }

        .container.disabled > .background {
            background-color: var(--_disabled-container-color);
        }

        .container > .outline {
            position: absolute;
            inset: 0;
            box-sizing: border-box;
            border-radius: inherit;
            border-style: solid;
            border-width: var(--_outline-width);
            border-color: var(--_enabled-outline-color);
            pointer-events: none;
            z-index: 1;
            transition: border-color 200ms ease;
        }

        .container.interactive:hover > .outline {
            border-color: var(--_hovered-outline-color);
        }

        .container.interactive:focus-visible > .outline {
            border-color: var(--_focused-outline-color);
        }

        .container.interactive:active > .outline {
            border-color: var(--_pressed-outline-color);
        }

        .container.disabled > .outline {
            border-color: var(--_disabled-outline-color);
            opacity: var(--_disabled-outline-opacity);
        }

        .content {
            display: flex;
            flex-direction: inherit;
            box-sizing: border-box;
            position: relative;
            z-index: 1;
            width: 100%;
            height: 100%;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .container,
        .container * {
            transition: none;
            animation: none;
        }
        .container mdc-elevation {
            transition: none;
        }
    }

    @media (forced-colors: active) {
        .container {
            border: 1px solid CanvasText;
        }
        .container.disabled {
            border-color: GrayText;
        }
        .container > .outline {
            border-color: CanvasText;
        }
    }

    @media (prefers-contrast: more) {
        .container > .outline {
            border-color: CanvasText;
            border-width: 2px;
        }
        .content {
            color: CanvasText;
        }
        .background {
            background: Canvas;
        }
    }
    @media (prefers-contrast: less) {
        .container > .outline {
            border-color: GrayText;
            opacity: 0.2;
        }
        .content {
            color: ButtonText;
        }
        .background {
            background: ButtonFace;
        }
    }
`)

const rippleStyles = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'hovered-color': `var(--_hovered-state-layer-color)`,
    'focused-color': `var(--_focused-state-layer-color)`,
    'pressed-color': `var(--_pressed-state-layer-color)`,
    'hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'focused-opacity': `var(--_focused-state-layer-opacity)`,
    'pressed-opacity': `var(--_pressed-state-layer-opacity)`,
})()

const elevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_enabled-container-elevation)`,
    'shadow-color': `var(--_enabled-container-shadow-color)`,
})()

const hoveredElevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_hovered-container-elevation)`,
})()

const focusedElevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_focused-container-elevation)`,
})()

const pressedElevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_pressed-container-elevation)`,
})()

const disabledElevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_disabled-container-elevation)`,
})()
console.log(pressedElevationStyles.cssText)

export const cardStyles = [
    stylePart,
    css`
    @layer mdc.card.variable {
        :host([variant="filled"]){${filled};}
        :host([variant="outlined"]){${outlined};}
        :host([variant="elevated"]){${elevated};}
    }

    @layer mdc.card.composite.ripple {
        .container mdc-ripple {
            border-radius: inherit;
            z-index: 1;
            ${rippleStyles};
        }
    }

    @layer mdc.card.composite.focus-ring {
        .container mdc-focus-ring {
            border-radius: inherit;
            z-index: 2;
        }
    }

    @layer mdc.card.composite.elevation {
        .container mdc-elevation {
            border-radius: inherit;
            z-index: 0;
            transition-duration: 200ms;
            ${elevationStyles};
        }
        .container.interactive:hover mdc-elevation {
            ${hoveredElevationStyles};
        }
        .container.interactive:focus-visible mdc-elevation {
            ${focusedElevationStyles};
        }
        .container.interactive:active mdc-elevation {
            ${pressedElevationStyles};
        }
        .container.disabled mdc-elevation {
            ${disabledElevationStyles};
        }
    }
`
]
