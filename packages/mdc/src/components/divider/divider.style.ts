/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { DividerDefinition } from './divider.definition'
import { createStyleSheet, stringifyTokens } from '@sandlada/styles/adapters/lit'

const tokens = stringifyTokens('--mdc-divider')(DividerDefinition)

const stylePart = createStyleSheet(DividerDefinition)(() => css`
    @layer mdc.divider.component {
        :host {
            box-sizing: border-box;
            display: flex;
            height: var(--_thickness);
            width: 100%;
        }

        :host([inset]),
        :host([inset-start]) {
            padding-inline-start: 16px;
        }

        :host([inset]),
        :host([inset-end]) {
            padding-inline-end: 16px;
        }

        :host::before {
            color: var(--_color);
            background: currentColor;
            content: '';
            height: 100%;
            width: 100%;
        }
    }

    @layer mdc.divider.motion {
        @media (prefers-reduced-motion: reduce) {
            :host,
            :host * {
                animation: none;
                transition: none;
            }
        }
    }
    @layer mdc.divider.hcm {
        @media (forced-colors: active) {
            :host::before {
                background: CanvasText;
                forced-color-adjust: none;
            }
        }
    }
    @layer mdc.divider.contrast {
        @media (prefers-contrast: more) {
            :host::before {
                color: CanvasText;
            }
        }

        @media (prefers-contrast: less) {
            :host::before {
                opacity: 0.7;
            }
        }
    }
    @layer mdc.divider.transparency {
        @media (prefers-reduced-transparency: reduce) {
            :host::before {
                opacity: 1;
            }
        }
    }
`)

export const DividerStyles = [
    css`
        @layer mdc.divider {
            @layer variable, component, motion, hcm, contrast, transparency;
        }
    `,
    css`@layer mdc.divider.variable {:host {${tokens};}}`,
    stylePart,
]
