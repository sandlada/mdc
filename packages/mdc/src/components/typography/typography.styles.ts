/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { TypographyDefinition, typographyEmphases, typographyRoles, typographySizes } from './typography.definition'

const tokens = stringifyTokens('--mdc-typography')(TypographyDefinition)

const comboRules = typographyRoles.flatMap((role) =>
    typographySizes.flatMap((size) =>
        typographyEmphases.map((emphasis) => {
            const infix = `${role}-${size}-${emphasis}`
            const condition = emphasis === 'emphasized' ? '[emphasized]' : ':not([emphasized])'
            return `:host([variant^="${role}-"][variant$="-${size}"]${condition}) {
        font-family: var(--_${infix}-font);
        font-size: var(--_${infix}-size);
        line-height: var(--_${infix}-leading);
        font-weight: var(--_${infix}-weight);
        letter-spacing: var(--_${infix}-tracking);
    }`
        })
    )
).join('\n\n')

export const typographyStyles = css`
    @layer mdc.typography {
        @layer variable, component, hcm, contrast, motion, transparency;
    }

    @layer mdc.typography.variable {
        :host{${tokens};}
    }

    @layer mdc.typography.component {

        :host([block]) {
            display: block;
        }

        :host([inline]) {
            display: inline;
        }

        :host([inline-block]) {
            display: inline-block;
        }

        ${unsafeCSS(comboRules)}
    }

    @layer mdc.typography {
        @layer motion {
            @media (prefers-reduced-motion: reduce) {
                :host {
                    animation: none;
                    transition: none;
                }
            }
        }
        @layer hcm {
            @media (forced-colors: active) {
                :host {

                }
            }
        }
        @layer contrast {
            @media (prefers-contrast: less) {
                :host {
                    color: CanvasText;
                }
            }
            @media (prefers-contrast: more) {
                :host {
                    color: CanvasText;
                    font-weight: 700;
                }
            }
        }
        @layer transparency {
            @media (prefers-reduced-transparency: reduce) {
                :host {
                    opacity: 1;
                }
            }
        }
    }
`
