/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { LoadingIndicatorDefinition } from '../../component-definitions/loading-indicator.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(LoadingIndicatorDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-loading-indicator',
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

export const LoadingIndicatorStyles = css`
    @layer mdc.loading-indicator {
        @layer variable {
            :host {
                ${tokenString}
            }

            /* Per-variant color-role selection via the variant-{v} class on
               the render root (no inline style, no attribute selectors): each
               variant re-keys the three color tokens through its own
               -{variant} fallback (defaults = primary, defined on :host). */
            .container.variant-secondary {
                --_enabled-uncontained-indicator-color: var(--_enabled-uncontained-indicator-color-secondary);
                --_enabled-contained-container-color: var(--_enabled-contained-container-color-secondary);
                --_enabled-contained-indicator-color: var(--_enabled-contained-indicator-color-secondary);
            }
            .container.variant-tertiary {
                --_enabled-uncontained-indicator-color: var(--_enabled-uncontained-indicator-color-tertiary);
                --_enabled-contained-container-color: var(--_enabled-contained-container-color-tertiary);
                --_enabled-contained-indicator-color: var(--_enabled-contained-indicator-color-tertiary);
            }
            .container.variant-error {
                --_enabled-uncontained-indicator-color: var(--_enabled-uncontained-indicator-color-error);
                --_enabled-contained-container-color: var(--_enabled-contained-container-color-error);
                --_enabled-contained-indicator-color: var(--_enabled-contained-indicator-color-error);
            }
            .container.variant-surface {
                --_enabled-uncontained-indicator-color: var(--_enabled-uncontained-indicator-color-surface);
                --_enabled-contained-container-color: var(--_enabled-contained-container-color-surface);
                --_enabled-contained-indicator-color: var(--_enabled-contained-indicator-color-surface);
            }
        }

        @layer base {
            :host {
                display: inline-flex;
                box-sizing: border-box;
                width: var(--_container-size);
                height: var(--_container-size);
                vertical-align: middle;
                -webkit-tap-highlight-color: transparent;
            }

            /* The container only centers the indicator; the background is a
               dedicated absolutely-positioned layer so it never affects the
               indicator layout or overflow. */
            .container {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                z-index: 0;
            }

            /* The background is invisible in the default uncontained mode and
               only painted once the contained class on the container opts it
               in. Consumers can still override the color through the public
               --mdc-loading-indicator-contained-container-color token. */
            .background {
                position: absolute;
                inset: 0;
                border-start-start-radius: var(--_container-shape-start-start);
                border-start-end-radius: var(--_container-shape-start-end);
                border-end-start-radius: var(--_container-shape-end-start);
                border-end-end-radius: var(--_container-shape-end-end);
                background: var(--_enabled-uncontained-container-color);
                z-index: -1;
            }
            .container.contained .background {
                background: var(--_enabled-contained-container-color);
            }

            .indicator {
                display: block;
                width: var(--_indicator-size);
                height: var(--_indicator-size);
                overflow: visible; /* Let the morph overshoot and rotation breathe. */
                flex: none;
            }

            /* The fill comes purely from the color tokens — the path carries
               no per-instance fill attribute. */
            .indicator path {
                fill: var(--_enabled-uncontained-indicator-color);
            }
            .container.contained .indicator path {
                fill: var(--_enabled-contained-indicator-color);
            }
        }

        @layer hcm {
            @media (forced-colors: active) {
                .indicator path {
                    fill: CanvasText;
                }
                .container.contained .background {
                    background: Canvas;
                    border: 1px solid CanvasText;
                }
            }
        }
    }
`
