/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import { StandardMenuGroupDefinition, VibrantMenuGroupDefinition } from './menu-group.definition'

const Stringify = stringifyTokens('--mdc-menu-group')
const StandardTokens = Stringify(StandardMenuGroupDefinition)
const VibrantTokens = Stringify(VibrantMenuGroupDefinition)

const ElevationBridge = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_enabled-container-elevation)`,
})()

const VariablePart = css`
    @layer mdc.menu-group.variable {
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
    @layer mdc.menu-group.component {
        :host {
            position: relative;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            background-color: var(--_enabled-container-color);
        }

        :host(:first-of-type) {
            border-start-start-radius: var(--_enabled-container-shape-outer-start-start);
            border-start-end-radius: var(--_enabled-container-shape-outer-start-end);
        }

        :host(:last-of-type) {
            border-end-end-radius: var(--_enabled-container-shape-outer-end-end);
            border-end-start-radius: var(--_enabled-container-shape-outer-end-start);
        }

        .content {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
        }

        .group-label {
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
    @layer mdc.menu-group.composite.elevation {
        :host > mdc-elevation {
            border-radius: inherit;
            z-index: 0;
            ${ElevationBridge};
        }
    }
`

const HcmPart = css`
    @layer mdc.menu-group.hcm {
        @media (forced-colors: active) {
            :host {
                border: 1px solid CanvasText;
                forced-color-adjust: none;
            }
            .group-label {
                color: CanvasText;
            }
        }
    }
`

const ContrastPart = css`
    @layer mdc.menu-group.contrast {
        @media (prefers-contrast: more) {
            :host {
                border: 1px solid CanvasText;
            }
            .group-label {
                color: CanvasText;
            }
        }
        @media (prefers-contrast: less) {
            .group-label {
                opacity: 0.8;
            }
        }
    }
`

const TransparencyPart = css`
    @layer mdc.menu-group.transparency {
        @media (prefers-reduced-transparency: reduce) {
            .group-label {
                opacity: 1;
            }
        }
    }
`

export const MenuGroupStyles = [
    css`
        @layer mdc.menu-group {
            @layer variable, component, composite, hcm, contrast, transparency;
        }
    `,
    VariablePart,
    ComponentPart,
    CompositePart,
    HcmPart,
    ContrastPart,
    TransparencyPart,
]
