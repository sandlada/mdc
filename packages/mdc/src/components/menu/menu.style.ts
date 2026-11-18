/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import { StandardMenuDefinition, VibrantMenuDefinition } from './menu.definition'

const EmphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSValue())
const EmphasizedAccelerateEasing = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())

const Stringify = stringifyTokens('--mdc-menu')
const StandardTokens = Stringify(StandardMenuDefinition)
const VibrantTokens = Stringify(VibrantMenuDefinition)

const ElevationBridge = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_enabled-container-elevation)`,
})()

const VariablePart = css`
    @layer mdc.menu.variable {
        :host([variant='standard']),
        :host(:not([variant])) {
            ${StandardTokens};
        }
        :host([variant='vibrant']) {
            ${VibrantTokens};
        }
    }
`

const ComponentPart = css`
    @layer mdc.menu.component {
        :host {
            position: relative;
            display: inline-block;
            outline: none;
            -webkit-tap-highlight-color: transparent;
        }

        .trigger {
            display: contents;
        }

        :host(:not([open])) .container {
            display: none;
        }

        .container {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            min-width: var(--_enabled-container-min-width);
            max-width: var(--_enabled-container-max-width);
            max-height: var(--_enabled-container-max-height);
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-group-label-color);
        }

        .content {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
            max-height: inherit;
            overflow-y: auto;
        }

        slot::slotted(mdc-divider) {
            display: block;
            height: var(--_enabled-divider-thickness);
            margin-block: 4px;
            background-color: var(--_enabled-divider-color);
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

        .container.quick,
        .container.quick * {
            transition: none;
        }
    }

    @layer mdc.menu.grouped {
        :host([layout='grouped']) .container:not(.has-groups) {
            border-start-start-radius: var(--_enabled-grouped-first-container-shape-start-start);
            border-start-end-radius: var(--_enabled-grouped-first-container-shape-start-end);
            border-end-end-radius: var(--_enabled-grouped-last-container-shape-end-end);
            border-end-start-radius: var(--_enabled-grouped-last-container-shape-end-start);
        }

        .container.has-groups {
            background-color: transparent;
            padding: 0;
            border-radius: 0;
            overflow: visible;
        }

        .container.has-groups > mdc-elevation {
            display: none;
        }

        .container.has-groups > .content {
            gap: var(--_enabled-group-gap);
            overflow-y: visible;
        }
    }
`

const CompositePart = css`
    @layer mdc.menu.composite.elevation {
        .container mdc-elevation {
            border-radius: inherit;
            z-index: 0;
            ${ElevationBridge};
        }
    }
`

const MotionPart = css`
    @layer mdc.menu.motion {
        .container {
            transform-origin: top center;
            /* Closed state values: the close transition animates towards these. */
            opacity: 0;
            scale: 0.85;
            translate: 0 4px;
            transition:
                display 120ms allow-discrete,
                opacity 120ms linear,
                scale 120ms ${EmphasizedAccelerateEasing},
                translate 120ms ${EmphasizedAccelerateEasing};
        }
        :host([placement^='top']) .container {
            transform-origin: bottom center;
        }
        :host([placement^='left']) .container {
            transform-origin: center right;
        }
        :host([placement^='right']) .container {
            transform-origin: center left;
        }
        :host([open]) .container,
        .container.open {
            display: flex;
            opacity: 1;
            scale: 1;
            translate: 0 0;
            transition:
                display 180ms allow-discrete,
                opacity 180ms linear,
                scale 180ms ${EmphasizedEasing},
                translate 180ms ${EmphasizedEasing};
        }
        /* Quick skips all transitions. These rules must stay after the
        open-state blocks to win the specificity tie. */
        :host([open]) .container.quick,
        .container.open.quick,
        .container.quick {
            transition: none;
        }
        /* Starting styles for the open transition. Declared after the main rules:
        starting-style declarations take part in the normal cascade, so a block
        placed earlier would lose to the matching open-state rules and the
        before-change value would equal the open value, killing the transition. */
        @starting-style {
            :host([open]) .container,
            .container.open {
                opacity: 0;
                scale: 0.85;
                translate: 0 4px;
            }
        }
        @media (prefers-reduced-motion: reduce) {
            .container,
            .container *,
            :host([open]) .container,
            .container.open {
                animation: none;
                transition: none;
            }
        }
    }
`

const HcmPart = css`
    @layer mdc.menu.hcm {
        @media (forced-colors: active) {
            .container {
                border: 1px solid CanvasText;
                forced-color-adjust: none;
            }
            slot::slotted(mdc-divider) {
                background-color: CanvasText;
            }
            slot[name='section-label']::slotted(*) {
                color: CanvasText;
            }
        }
    }
`

const ContrastPart = css`
    @layer mdc.menu.contrast {
        @media (prefers-contrast: more) {
            .container {
                border: 1px solid CanvasText;
            }
            slot::slotted(mdc-divider) {
                background-color: CanvasText;
            }
            slot[name='section-label']::slotted(*) {
                color: CanvasText;
            }
        }
        @media (prefers-contrast: less) {
            slot::slotted(mdc-divider) {
                opacity: 0.7;
            }
            slot[name='section-label']::slotted(*) {
                opacity: 0.8;
            }
        }
    }
`

const TransparencyPart = css`
    @layer mdc.menu.transparency {
        @media (prefers-reduced-transparency: reduce) {
            .container {
                opacity: 1;
            }
            slot::slotted(mdc-divider) {
                opacity: 1;
            }
            slot[name='section-label']::slotted(*) {
                opacity: 1;
            }
        }
    }
`

export const MenuStyles = [
    css`
        @layer mdc.menu {
            @layer variable, component, grouped, composite, motion, hcm, contrast, transparency;
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
