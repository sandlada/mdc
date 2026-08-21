/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import {
    ElevatedCardDefinition,
    FilledCardDefinition,
    OutlinedCardDefinition,
} from '../../component-definitions/card.definition'
import type { ElevationDefinition } from '../../component-definitions/elevation.definition'
import type { RippleDefinition } from '../../component-definitions/ripple.definition'
import { overrideComponentTokens, stringTokens } from '../../utils/tokens'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const filledTokens = defineVars(defineTokenRefsRecord(FilledCardDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-card',
}), true).join('')

const elevatedTokens = defineVars(defineTokenRefsRecord(ElevatedCardDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-card',
}), true).join('')

const outlinedTokens = defineVars(defineTokenRefsRecord(OutlinedCardDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-card',
}), true).join('')

const rippleStyles = stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
    'enabled-hovered-color': `var(--_hovered-state-layer-color)`,
    'enabled-focused-color': `var(--_focused-state-layer-color)`,
    'enabled-pressed-color': `var(--_pressed-state-layer-color)`,
    'enabled-hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'enabled-focused-opacity': `var(--_focused-state-layer-opacity)`,
    'enabled-pressed-opacity': `var(--_pressed-state-layer-opacity)`,
}))

const elevationStyles = stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', {
    'enabled-level': `var(--_enabled-container-elevation)`,
    'enabled-shadow-color': `var(--_enabled-container-shadow-color)`,
}))

const hoveredElevationStyles = stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', {
    'enabled-level': `var(--_hovered-container-elevation)`,
}))

const focusedElevationStyles = stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', {
    'enabled-level': `var(--_focused-container-elevation)`,
}))

const pressedElevationStyles = stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', {
    'enabled-level': `var(--_pressed-container-elevation)`,
}))

const disabledElevationStyles = stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', {
    'enabled-level': `var(--_disabled-container-elevation)`,
}))

export const cardStyles = css`
    @layer mdc.card.variable {
        :host {
            ${unsafeCSS(filledTokens)};
        }
        :host([variant="filled"]) {
            ${unsafeCSS(filledTokens)};
        }
        :host([variant="elevated"]) {
            ${unsafeCSS(elevatedTokens)};
        }
        :host([variant="outlined"]) {
            ${unsafeCSS(outlinedTokens)};
        }
        .container.filled {
            ${unsafeCSS(filledTokens)};
        }
        .container.elevated {
            ${unsafeCSS(elevatedTokens)};
        }
        .container.outlined {
            ${unsafeCSS(outlinedTokens)};
        }
    }

    @layer mdc.card.composite.ripple {
        .container mdc-ripple {
            border-radius: inherit;
            z-index: 1;
            ${unsafeCSS(rippleStyles)};
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
            ${unsafeCSS(elevationStyles)};
        }
        .container.interactive:hover mdc-elevation {
            ${unsafeCSS(hoveredElevationStyles)};
        }
        .container.interactive:focus-visible mdc-elevation {
            ${unsafeCSS(focusedElevationStyles)};
        }
        .container.interactive:active mdc-elevation {
            ${unsafeCSS(pressedElevationStyles)};
        }
        .container.disabled mdc-elevation {
            transition: none;
            ${unsafeCSS(disabledElevationStyles)};
        }
    }

    @layer mdc.card.base {
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
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-start-radius: var(--_container-shape-end-start);
            border-end-end-radius: var(--_container-shape-end-end);
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
            transition: background-color 200ms ease, border-color 200ms ease, opacity 200ms ease;
        }

        .container.stacked {
            flex-direction: column;
        }

        .container.horizontal {
            flex-direction: row;
        }

        .container.square {
            border-start-start-radius: var(--_container-shape-square-start-start);
            border-start-end-radius: var(--_container-shape-square-start-end);
            border-end-start-radius: var(--_container-shape-square-end-start);
            border-end-end-radius: var(--_container-shape-square-end-end);
        }

        .container.interactive {
            cursor: pointer;
            user-select: none;
        }

        .container.disabled {
            cursor: default;
            pointer-events: none;
            opacity: var(--_disabled-container-opacity);
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
        .container > .outline {
            transition: none;
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
            opacity: 1;
            border-color: GrayText;
        }
        .container > .outline {
            border-color: CanvasText;
        }
    }
`
