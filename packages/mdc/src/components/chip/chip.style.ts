/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import type { ElevationDefinition } from '../../component-definitions/elevation.definition'
import type { FocusRingDefinition } from '../../component-definitions/focus-ring.definition'
import type { IconDefinition } from '../../component-definitions/icon.definition'
import type { RippleDefinition } from '../../component-definitions/ripple.definition'
import {
    AssistChipDefinition,
    FilterChipDefinition,
    InputChipDefinition,
    SuggestionChipDefinition,
} from '../../component-definitions/chip.definition'
import { overrideComponentTokens, stringTokens } from '../../utils/tokens'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

// Token injection per variant
const assistTokens = defineVars(defineTokenRefsRecord(AssistChipDefinition, {
    expandShapes: true, useBaseFallback: true, prefix: '--mdc-chip',
}), true).join('')

const filterTokens = defineVars(defineTokenRefsRecord(FilterChipDefinition, {
    expandShapes: true, useBaseFallback: true, prefix: '--mdc-chip',
}), true).join('')

const inputTokens = defineVars(defineTokenRefsRecord(InputChipDefinition, {
    expandShapes: true, useBaseFallback: true, prefix: '--mdc-chip',
}), true).join('')

const suggestionTokens = defineVars(defineTokenRefsRecord(SuggestionChipDefinition, {
    expandShapes: true, useBaseFallback: true, prefix: '--mdc-chip',
}), true).join('')

const emphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSValue())
const CHECKMARK_LENGTH = 29.7833385

const rippleStyles = stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
    'enabled-hovered-color': `var(--_hovered-state-layer-color)`,
    'enabled-focused-color': `var(--_focused-state-layer-color)`,
    'enabled-pressed-color': `var(--_pressed-state-layer-color)`,
    'enabled-hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'enabled-focused-opacity': `var(--_focused-state-layer-opacity)`,
    'enabled-pressed-opacity': `var(--_pressed-state-layer-opacity)`,
}))

const iconStyles = stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', {
    'enabled-size': `var(--_icon-size)`,
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

export const ChipStyles = css`
    @layer mdc.chip.variable {
        :host([variant="assist"]) { ${unsafeCSS(assistTokens)}; }
        :host([variant="filter"]) { ${unsafeCSS(filterTokens)}; }
        :host([variant="input"]) { ${unsafeCSS(inputTokens)}; }
        :host([variant="suggestion"]) { ${unsafeCSS(suggestionTokens)}; }
    }

    @layer mdc.chip.composite.ripple {
        .container mdc-ripple {
            border-radius: inherit;
            z-index: 0;
            ${unsafeCSS(rippleStyles)};
        }
    }

    @layer mdc.chip.composite.focus-ring {
        .container mdc-focus-ring {
            z-index: 1;
        }
    }

    @layer mdc.chip.composite.elevation {
        .container mdc-elevation {
            border-radius: inherit;
            z-index: 0;
            transition-duration: 0ms;
            ${unsafeCSS(elevationStyles)};
        }
        .container:hover mdc-elevation {
            ${unsafeCSS(hoveredElevationStyles)};
        }
        .container:focus-visible mdc-elevation {
            ${unsafeCSS(focusedElevationStyles)};
        }
        .container:active mdc-elevation {
            ${unsafeCSS(pressedElevationStyles)};
        }
        .container.disabled mdc-elevation {
            transition: none;
            ${unsafeCSS(disabledElevationStyles)};
        }
    }

    @layer mdc.chip.base {
        :host {
            display: inline-flex;
            outline: none;
            -webkit-tap-highlight-color: transparent;
        }

        .container {
            all: unset;
            position: relative;
            box-sizing: border-box;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            height: var(--_container-height);
            padding-inline-start: var(--_container-padding-start);
            padding-inline-end: var(--_container-padding-end);
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-start-radius: var(--_container-shape-end-start);
            border-end-end-radius: var(--_container-shape-end-end);
            background-color: var(--_enabled-container-color);
            border: var(--_outline-width) solid var(--_enabled-outline-color);
            color: var(--_enabled-label-color);
            gap: 8px;
            outline: none;
            -webkit-tap-highlight-color: transparent;
            transition: background-color 200ms ${emphasizedEasing},
                        border-color 200ms ${emphasizedEasing},
                        color 200ms ${emphasizedEasing};
        }

        .container:hover {
            background-color: var(--_hovered-container-color);
            border-color: var(--_hovered-outline-color);
            color: var(--_hovered-label-color);
        }

        .container:focus-visible {
            background-color: var(--_focused-container-color);
            border-color: var(--_focused-outline-color);
            color: var(--_focused-label-color);
        }

        .container:active {
            background-color: var(--_pressed-container-color);
            border-color: var(--_pressed-outline-color);
            color: var(--_pressed-label-color);
        }

        .container.disabled {
            cursor: default;
            pointer-events: none;
            background-color: var(--_disabled-container-color);
            border-color: var(--_disabled-outline-color);
            opacity: var(--_disabled-outline-opacity);
        }

        .container.soft-disabled {
            opacity: var(--_disabled-label-opacity);
        }
    }

    @layer mdc.chip.base.elevated {
        .container.elevated {
            background-color: var(--_enabled-container-color-elevated);
            border-color: var(--_enabled-outline-color-elevated);
        }

        .container.elevated:hover {
            background-color: var(--_hovered-container-color-elevated);
        }

        .container.elevated:focus-visible {
            background-color: var(--_focused-container-color-elevated);
        }

        .container.elevated:active {
            background-color: var(--_pressed-container-color-elevated);
        }

        .container.elevated.disabled {
            background-color: var(--_disabled-container-color-elevated);
        }
    }

    @layer mdc.chip.base.label {
        .label {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: var(--_enabled-label-font);
            font-size: var(--_enabled-label-size);
            font-weight: var(--_enabled-label-weight);
            letter-spacing: var(--_enabled-label-tracking);
            line-height: var(--_enabled-label-line-height);
            padding-inline-start: var(--_text-padding-start);
            padding-inline-end: var(--_text-padding-end);
        }

        .container:not(.has-label) .label {
            display: none;
        }

        .container.disabled .label {
            opacity: var(--_disabled-label-opacity);
        }
    }

    @layer mdc.chip.base.icon {
        .icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--_enabled-icon-color);
            ${unsafeCSS(iconStyles)};
        }

        .container:not(.has-icon) .icon {
            display: none;
        }

        .container:not(.disabled):hover .icon {
            color: var(--_hovered-icon-color);
        }

        .container:not(.disabled):focus-visible .icon {
            color: var(--_focused-icon-color);
        }

        .container:not(.disabled):active .icon {
            color: var(--_pressed-icon-color);
        }

        .container.disabled .icon {
            color: var(--_disabled-icon-color);
            opacity: var(--_disabled-icon-opacity);
        }
    }

    @layer mdc.chip.base.avatar {
        .avatar {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: var(--_avatar-size);
            height: var(--_avatar-size);
            border-start-start-radius: var(--_avatar-shape-start-start);
            border-start-end-radius: var(--_avatar-shape-start-end);
            border-end-start-radius: var(--_avatar-shape-end-start);
            border-end-end-radius: var(--_avatar-shape-end-end);
            overflow: hidden;
        }

        .container:not(.has-avatar) .avatar {
            display: none;
        }
    }

    @layer mdc.chip.base.trailing-icon {
        .trailing-icon {
            all: unset;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: var(--_trailing-icon-size);
            height: var(--_trailing-icon-size);
            padding: 2px;
            box-sizing: border-box;
            border: none;
            background: transparent;
            color: var(--_enabled-trailing-icon-color);
            cursor: pointer;
            border-radius: 50%;
            z-index: 1;
            outline: none;
            -webkit-tap-highlight-color: transparent;
        }

        .container:not(.has-trailing-icon) .trailing-icon {
            display: none;
        }

        .trailing-icon:hover {
            background-color: rgba(0, 0, 0, 0.08);
        }

        .trailing-icon:focus-visible {
            outline: 2px solid var(--_focused-outline-color);
            outline-offset: -2px;
        }

        .trailing-icon:disabled {
            opacity: var(--_disabled-icon-opacity);
            cursor: default;
        }
    }

    @layer mdc.chip.base.checkmark {
        .checkmark {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: 18px;
            height: 18px;
            opacity: 0;
        }

        .container.has-selected-icon .checkmark {
            width: auto;
            height: auto;
        }

        .container.selected .checkmark {
            opacity: 1;
        }

        .checkmark-path {
            stroke: var(--_enabled-checkmark-color);
            stroke-dasharray: ${CHECKMARK_LENGTH};
            stroke-width: 2px;
            fill: none;
        }

        .container.selecting .checkmark-path {
            stroke-dashoffset: ${CHECKMARK_LENGTH};
            animation: chip-checkmark-draw-in 150ms 150ms ${emphasizedEasing} forwards;
        }

        .container.deselecting .checkmark {
            animation: chip-fade-out 150ms linear forwards;
        }

        @keyframes chip-checkmark-draw-in {
            from { stroke-dashoffset: ${CHECKMARK_LENGTH}; }
            to { stroke-dashoffset: 0; }
        }

        @keyframes chip-fade-out {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    }

    @layer mdc.chip.composite.selected {
        .container.selected {
            background-color: var(--_enabled-container-color-selected);
            border-color: var(--_enabled-outline-color-selected);
            color: var(--_enabled-label-color-selected);
        }

        .container.selected:hover {
            background-color: var(--_hovered-container-color-selected);
            border-color: var(--_hovered-outline-color-selected);
            color: var(--_hovered-label-color-selected);
        }

        .container.selected:focus-visible {
            background-color: var(--_focused-container-color-selected);
            border-color: var(--_focused-outline-color-selected);
            color: var(--_focused-label-color-selected);
        }

        .container.selected:active {
            background-color: var(--_pressed-container-color-selected);
            border-color: var(--_pressed-outline-color-selected);
            color: var(--_pressed-label-color-selected);
        }

        .container.selected:not(.disabled) .icon {
            color: var(--_enabled-icon-color-selected);
        }

        .container.disabled.selected {
            background-color: var(--_disabled-container-color-selected);
            border-color: var(--_disabled-outline-color-selected);
            color: var(--_disabled-label-color-selected);
        }
    }

    @layer mdc.chip.base.touch-target {
        .touch-target {
            position: absolute;
            top: 50%;
            left: 50%;
            height: var(--_min-touch-target-size);
            width: 100%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .container {
            transition: none;
        }
        .container.selecting .checkmark-path,
        .container.deselecting .checkmark {
            animation: none;
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
        .container.selected {
            background-color: Highlight;
            color: HighlightText;
            border-color: Highlight;
        }
    }
`
