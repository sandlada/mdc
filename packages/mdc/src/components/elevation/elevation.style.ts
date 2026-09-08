/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { ElevationDefinition } from '../../component-definitions/elevation.definition'
import { createStyleSheet, stringifyTokens } from '../../utils/styles/lit'

const tokens = stringifyTokens('--mdc-elevation')(ElevationDefinition)

export const styles = [
    css`
        @layer mdc.elevation {
            @layer variable, component, motion, hcm, contrast, transparency;
        }
    `,
    css`@layer mdc.elevation.variable {:host {${tokens};}}`,
    createStyleSheet(ElevationDefinition)(() => css`
        @layer mdc.elevation.component {
            :host {
                display: flex;
                pointer-events: none;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
            }

            :host([disabled]),
            :host(.hidden) {
                display: none;
            }

            :host([disabled]) .elevation::before,
            :host([disabled]) .elevation::after,
            :host(.hidden) .elevation::before,
            :host(.hidden) .elevation::after {
                opacity: 0;
            }

            :host,
            .elevation,
            .elevation::before,
            .elevation::after {
                border-radius: inherit;
                inset: 0;
                position: absolute;
                transition-duration: inherit;
                transition-timing-function: inherit;
                transition-property: box-shadow, opacity, display;
                transition-behavior: allow-discrete;
            }

            .elevation::before,
            .elevation::after {
                content: '';
            }
            @starting-style {
                :host(:not(.hidden):not([disabled])) .elevation::before,
                :host(:not(.hidden):not([disabled])) .elevation::after {
                    opacity: 0;
                }
            }

            .elevation::before {
                opacity: 0.3;

                --l1-y: clamp(0, var(--_level), 1);
                --l4-y: clamp(0, var(--_level) - 3, 1);
                --l5-y: calc(2 * clamp(0, var(--_level) - 4, 1));
                --y: calc(1px * (var(--l1-y) + var(--l4-y) + var(--l5-y)));

                --l1-blur: calc(2 * clamp(0, var(--_level), 1));
                --l3-blur: clamp(0, var(--_level) - 2, 1);
                --l5-blur: clamp(0, var(--_level) - 4, 1);
                --blur: calc(1px * (var(--l1-blur) + var(--l3-blur) + var(--l5-blur)));

                box-shadow: 0px var(--y) var(--blur) 0px var(--_shadow-color);
            }

            .elevation::after {
                opacity: 0.15;

                --l1-y: clamp(0, var(--_level), 1);
                --l2-y: clamp(0, var(--_level) - 1, 1);
                --l3to5-y: calc(2 * clamp(0, var(--_level) - 2, 3));
                --y: calc(1px * (var(--l1-y) + var(--l2-y) + var(--l3to5-y)));

                --l1to2-blur: calc(3 * clamp(0, var(--_level), 2));
                --l3to5-blur: calc(2 * clamp(0, var(--_level) - 2, 3));
                --blur: calc(1px * (var(--l1to2-blur) + var(--l3to5-blur)));

                --l1to4-spread: clamp(0, var(--_level), 4);
                --l5-spread: calc(2 * clamp(0, var(--_level) - 4, 1));
                --spread: calc(1px * (var(--l1to4-spread) + var(--l5-spread)));

                box-shadow: 0px var(--y) var(--blur) var(--spread) var(--_shadow-color);
            }
        }

        @layer mdc.elevation.motion {
            @media (prefers-reduced-motion: reduce) {
                :host,
                :host * {
                    animation: none;
                    transition: none;
                }
            }
        }
        @layer mdc.elevation.hcm {
            @media (forced-colors: active) {
                :host {
                    --_shadow-color: unset;
                }
            }
        }
        @layer mdc.elevation.contrast {
            @media (prefers-contrast: more) {
                :host {
                    --_shadow-color: CanvasText;
                }
            }

            @media (prefers-contrast: less) {
                :host {
                    --_shadow-color: ButtonBorder;
                    opacity: 0.3;
                }
            }
        }
        @layer mdc.elevation.transparency {
            @media (prefers-reduced-transparency: reduce) {
                .elevation::before,
                .elevation::after {
                    opacity: 1;
                }
            }
        }
    `)
]

export const ElevationStyles = styles
