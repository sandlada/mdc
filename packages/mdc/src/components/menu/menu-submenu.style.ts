/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import { StandardMenuSubmenuDefinition, VibrantMenuSubmenuDefinition } from './menu-submenu.definition'

const EmphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSValue())
const EmphasizedAccelerateEasing = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())

const Stringify = stringifyTokens('--mdc-menu-submenu')
const StandardTokens = Stringify(StandardMenuSubmenuDefinition)
const VibrantTokens = Stringify(VibrantMenuSubmenuDefinition)

const ElevationBridge = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_enabled-container-elevation)`,
})()

const VariablePart = css`
    @layer mdc.menu-submenu.variable {
        :host([variant='standard']) {
            ${StandardTokens};
        }
        :host([variant='vibrant']) {
            ${VibrantTokens};
        }
    }
`

const ComponentPart = css`
    @layer mdc.menu-submenu.component {
        :host {
            position: relative;
            display: block;
            outline: none;
            -webkit-tap-highlight-color: transparent;
        }

        .trigger {
            all: unset;
            position: relative;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            width: 100%;
            min-height: 48px;
            padding-inline: 16px;
            cursor: pointer;
            outline: none;
            color: var(--_enabled-trigger-label-color);
            -webkit-tap-highlight-color: transparent;
        }

        .trigger-label {
            display: block;
            flex: 1 1 auto;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: var(--_enabled-trigger-label-font);
            font-size: var(--_enabled-trigger-label-size);
            font-weight: var(--_enabled-trigger-label-weight);
            letter-spacing: var(--_enabled-trigger-label-tracking);
            line-height: var(--_enabled-trigger-label-leading);
            color: var(--_enabled-trigger-label-color);
        }

        .trigger-chevron {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            inline-size: 20px;
            block-size: 20px;
            color: var(--_enabled-trigger-label-color);
        }

        /* Cascading-menu indicator: a chevron pointing to the nested surface;
           hidden when a trailing icon is supplied. */
        .trigger-indicator {
            position: relative;
            inline-size: 100%;
            block-size: 100%;
        }

        .trigger-indicator::after {
            content: '';
            position: absolute;
            top: 50%;
            inset-inline-start: 40%;
            inline-size: 7px;
            block-size: 7px;
            border-block-start: 2px solid currentColor;
            border-inline-end: 2px solid currentColor;
            transform: translate(-40%, -50%) rotate(45deg);
        }

        :dir(rtl) .trigger-chevron {
            transform: scaleX(-1);
        }

        .trigger.disabled {
            cursor: default;
            pointer-events: none;
            opacity: 0.38;
        }

        :host(:not([open])) .surface {
            display: none;
        }

        .surface {
            position: absolute;
            inset-inline-start: 100%;
            top: 0;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            min-width: var(--_enabled-container-min-width);
            max-width: var(--_enabled-container-max-width);
            max-height: var(--_enabled-container-max-height);
            overflow-y: auto;
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-trigger-label-color);
            outline: none;
        }

        .content {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
        }

        slot[name='section-label']::slotted(*) {
            display: flex;
            align-items: center;
            box-sizing: border-box;
            min-height: var(--_enabled-group-label-container-height);
            padding-inline: 16px;
            color: var(--_enabled-group-label-color);
            font-family: var(--_enabled-group-label-font);
            font-size: var(--_enabled-group-label-size);
            line-height: var(--_enabled-group-label-leading);
            font-weight: var(--_enabled-group-label-weight);
            letter-spacing: var(--_enabled-group-label-tracking);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
`

const CompositePart = css`
    @layer mdc.menu-submenu.composite.elevation {
        .surface mdc-elevation {
            border-radius: inherit;
            z-index: 0;
            ${ElevationBridge};
        }
    }
`

const MotionPart = css`
    @layer mdc.menu-submenu.motion {
        .surface {
            transform-origin: left center;
            /* Closed state values: the close transition animates towards these. */
            opacity: 0;
            scale: 0.85;
            translate: -4px 0;
            transition:
                display 100ms allow-discrete,
                opacity 100ms linear,
                scale 100ms ${EmphasizedAccelerateEasing},
                translate 100ms ${EmphasizedAccelerateEasing};
        }
        :dir(rtl) .surface {
            transform-origin: right center;
            translate: 4px 0;
        }
        :host([open]) .surface,
        .surface.open {
            display: flex;
            opacity: 1;
            scale: 1;
            translate: 0 0;
            transition:
                display 140ms allow-discrete,
                opacity 140ms linear,
                scale 140ms ${EmphasizedEasing},
                translate 140ms ${EmphasizedEasing};
        }
        /* Quick skips all transitions. These rules must stay after the
        open-state blocks to win the specificity tie. */
        :host([open]) .surface.quick,
        .surface.open.quick,
        .surface.quick {
            transition: none;
        }
        /* Starting styles for the open transition. Declared after the main rules:
        starting-style declarations take part in the normal cascade, so a block
        placed earlier would lose to the matching open-state rules and the
        before-change value would equal the open value, killing the transition. */
        @starting-style {
            :host([open]) .surface,
            .surface.open {
                opacity: 0;
                scale: 0.85;
                translate: -4px 0;
            }
            :dir(rtl) :host([open]) .surface,
            :dir(rtl) .surface.open {
                translate: 4px 0;
            }
        }
        @media (prefers-reduced-motion: reduce) {
            .trigger,
            .surface,
            .trigger *,
            .surface *,
            :host([open]) .surface,
            .surface.open {
                animation: none;
                transition: none;
            }
        }
    }
`

const HcmPart = css`
    @layer mdc.menu-submenu.hcm {
        @media (forced-colors: active) {
            .surface {
                border: 1px solid CanvasText;
                forced-color-adjust: none;
            }
            .trigger {
                border: 1px solid CanvasText;
            }
            .trigger.disabled {
                opacity: 1;
                color: GrayText;
                border-color: GrayText;
            }
        }
    }
`

const ContrastPart = css`
    @layer mdc.menu-submenu.contrast {
        @media (prefers-contrast: more) {
            .surface {
                border: 1px solid CanvasText;
            }
            .trigger-label {
                color: CanvasText;
            }
            slot[name='section-label']::slotted(*) {
                color: CanvasText;
            }
        }
        @media (prefers-contrast: less) {
            slot[name='section-label']::slotted(*) {
                opacity: 0.8;
            }
        }
    }
`

const TransparencyPart = css`
    @layer mdc.menu-submenu.transparency {
        @media (prefers-reduced-transparency: reduce) {
            .surface,
            slot[name='section-label']::slotted(*) {
                opacity: 1;
            }
        }
    }
`

export const MenuSubmenuStyles = [
    css`
        @layer mdc.menu-submenu {
            @layer variable, component, composite, motion, hcm, contrast, transparency;
        }
    `,
    VariablePart,
    ComponentPart,
    CompositePart,
    MotionPart,
    HcmPart,
    ContrastPart,
    TransparencyPart,
]
