/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing, State } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import type { FocusRingDefinition } from '../focus-ring/focus-ring.definition'
import type { RippleDefinition } from '../ripple/ripple.definition'
import { LegacyMenuSubmenuDefinition } from './legacy-menu-submenu.definition'
import { overrideTokens, stringifyTokens } from '../../utils/style'

const legacyMenuSubmenuTokens = stringifyTokens('--mdc-legacy-menu-submenu')(LegacyMenuSubmenuDefinition)

const emphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSValue())
const emphasizedAccelerateEasing = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())

const rippleStyles = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'enabled-hovered-color': `var(--_enabled-trigger-label-color)`,
    'enabled-focused-color': `var(--_enabled-trigger-label-color)`,
    'enabled-pressed-color': `var(--_enabled-trigger-label-color)`,
    'enabled-hovered-opacity': State.HoveredStateLayerOpacity,
    'enabled-focused-opacity': State.FocusedStateLayerOpacity,
    'enabled-pressed-opacity': State.PressedStateLayerOpacity,
})()

const focusRingStyles = overrideTokens<typeof FocusRingDefinition>('--mdc-focus-ring')({
    'shape-start-start': `var(--_enabled-container-shape-start-start)`,
    'shape-start-end': `var(--_enabled-container-shape-start-end)`,
    'shape-end-start': `var(--_enabled-container-shape-end-start)`,
    'shape-end-end': `var(--_enabled-container-shape-end-end)`,
})()

const elevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_enabled-container-elevation)`,
})()

export const LegacyMenuSubmenuStyles = css`
    @layer mdc.legacy-menu-submenu.variable {
        :host { ${legacyMenuSubmenuTokens}; }
    }

    @layer mdc.legacy-menu-submenu.base {
        :host {
            display: block;
            outline: none;
            -webkit-tap-highlight-color: transparent;
            interpolate-size: allow-keywords;
        }

        .host {
            position: relative;
            display: block;
        }

        .trigger {
            all: unset;
            position: relative;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            width: 100%;
            min-height: 48px;
            padding-inline: 12px;
            background-color: transparent;
            color: var(--_enabled-trigger-label-color);
            text-align: start;
            cursor: pointer;
            outline: none;
            -webkit-tap-highlight-color: transparent;
            transition: background-color 200ms ${emphasizedEasing};
        }

        .trigger.disabled {
            cursor: default;
            pointer-events: none;
            opacity: 0.38;
        }

        .nested-surface {
            position: absolute;
            inset-inline-start: 100%;
            top: 0;
            box-sizing: border-box;
            display: none;
            flex-direction: column;
            min-inline-size: 0;
            max-inline-size: var(--_enabled-container-max-width);
            max-block-size: var(--_enabled-container-max-height);
            overflow: visible;
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            background-color: var(--_enabled-container-color);
            outline: none;
        }

        .nested-items {
            position: relative;
            z-index: 1;
            display: flex;
            flex: 1 1 auto;
            flex-direction: column;
            box-sizing: border-box;
            min-inline-size: 0;
            min-block-size: 0;
            max-inline-size: inherit;
            max-block-size: inherit;
            overflow: hidden;
            border-radius: inherit;
        }

        .nested-padding {
            display: flex;
            flex: 0 0 auto;
            flex-direction: column;
            box-sizing: border-box;
            min-inline-size: var(--_enabled-container-min-width);
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
        }
    }

    @layer mdc.legacy-menu-submenu.layout {
        slot[name='trigger'] {
            display: contents;
        }

        .trigger-label {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .trigger-icon {
            position: relative;
            flex-shrink: 0;
            width: var(--_enabled-trigger-icon-size);
            height: var(--_enabled-trigger-icon-size);
            color: var(--_enabled-trigger-icon-color);
        }

        .trigger-icon::after {
            content: '';
            position: absolute;
            top: 50%;
            inset-inline-start: 50%;
            width: 8px;
            height: 8px;
            border-top: 2px solid currentColor;
            border-inline-end: 2px solid currentColor;
            transform: translate(-50%, -50%) rotate(45deg);
        }

        :dir(rtl) .trigger-icon::after {
            transform: translate(-50%, -50%) rotate(225deg);
        }
    }

    @layer mdc.legacy-menu-submenu.label {
        .trigger-label {
            font-family: var(--_enabled-trigger-label-font);
            font-size: var(--_enabled-trigger-label-size);
            font-weight: var(--_enabled-trigger-label-weight);
            letter-spacing: var(--_enabled-trigger-label-tracking);
            line-height: var(--_enabled-trigger-label-leading);
            color: var(--_enabled-trigger-label-color);
        }
    }

    @layer mdc.legacy-menu-submenu.composite.ripple {
        .trigger mdc-ripple {
            border-radius: inherit;
            z-index: 0;
            ${rippleStyles};
        }
    }

    @layer mdc.legacy-menu-submenu.composite.focus-ring {
        .trigger mdc-focus-ring {
            border-radius: inherit;
            z-index: 1;
            ${focusRingStyles};
        }
    }

    @layer mdc.legacy-menu-submenu.composite.elevation {
        .nested-surface mdc-elevation {
            border-radius: inherit;
            position: absolute;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            ${elevationStyles};
        }
    }

    @layer mdc.legacy-menu-submenu.motion {
        .nested-surface {
            /* The submenu transposes Material's root-menu height animation to
            the inline axis: it grows from the trigger edge instead of growing
            vertically like a top-level menu. Closed at 35% of its full width,
            matching the root close choreography. */
            inline-size: calc-size(auto, size * 0.35);
            opacity: 0;
            transition:
                display 150ms allow-discrete,
                inline-size 150ms ${emphasizedAccelerateEasing},
                opacity 50ms linear 100ms;
        }
        .nested-items {
            transition: overflow 0s allow-discrete;
        }
        :host(:not([open])) .nested-surface {
            display: none;
        }
        :host([open]) .nested-surface,
        .nested-surface.open {
            display: flex;
            inline-size: auto;
            opacity: 1;
            transition:
                display 500ms allow-discrete,
                inline-size 500ms ${emphasizedEasing},
                opacity 50ms linear;
        }
        :host([open]) .nested-items,
        .nested-surface.open .nested-items {
            overflow-y: auto;
            transition: overflow 0s 500ms allow-discrete;
        }
        /* Quick skips all transitions. These rules must stay after the
        open-state blocks to win the specificity tie. */
        :host([open]) .nested-surface.quick,
        .nested-surface.open.quick,
        .nested-surface.quick {
            transition: none;
        }
        .nested-surface.quick .nested-items {
            transition: none;
        }
        /* Starting styles for the open transition. Declared after the main rules:
        starting-style declarations take part in the normal cascade, so a block
        placed earlier would lose to the matching open-state rules and the
        before-change value would equal the open value, killing the transition. */
        @starting-style {
            :host([open]) .nested-surface,
            .nested-surface.open {
                inline-size: 0;
                opacity: 0;
            }
            :host([open]) .nested-items,
            .nested-surface.open .nested-items {
                overflow: hidden;
                transition: overflow 0s 500ms allow-discrete;
            }
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .trigger,
        .nested-surface,
        :host([open]) .nested-surface,
        .nested-surface.open {
            scroll-behavior: auto;
            transition: none;
        }
        .nested-items {
            transition: none;
        }
    }

    @media (forced-colors: active) {
        .nested-surface {
            border: 1px solid CanvasText;
        }
        .trigger.disabled {
            opacity: 1;
            color: GrayText;
        }
        .trigger-label {
            color: CanvasText;
        }
    }

    @media (prefers-contrast: more) {
        .nested-surface {
            border: 2px solid CanvasText;
        }
        .trigger-label {
            color: CanvasText;
        }
    }

    @media (prefers-contrast: less) {
        .nested-surface {
            border: 1px solid GrayText;
        }
        .trigger-label {
            color: GrayText;
        }
    }

    @media (prefers-reduced-transparency: reduce) {
        .nested-surface {
            backdrop-filter: none;
            opacity: 1;
        }
    }
`
