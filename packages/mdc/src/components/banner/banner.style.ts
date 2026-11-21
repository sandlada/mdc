/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { IconDefinition } from '../icon/icon.definition'
import {
    BannerDefinition,
    ErrorContainerBannerDefinition,
    InverseSurfaceBannerDefinition,
    PrimaryContainerBannerDefinition,
    SecondaryContainerBannerDefinition,
    SurfaceBannerDefinition,
    SurfaceContainerBannerDefinition,
    TertiaryContainerBannerDefinition,
} from './banner.definition'

// ─── Token Strings ──────────────────────────────────────────────────────────

const TokenString = stringifyTokens('--mdc-banner')(BannerDefinition)
const SurfaceTokenString = stringifyTokens('--mdc-banner')(SurfaceBannerDefinition)
const SurfaceContainerTokenString = stringifyTokens('--mdc-banner')(SurfaceContainerBannerDefinition)
const PrimaryContainerTokenString = stringifyTokens('--mdc-banner')(PrimaryContainerBannerDefinition)
const SecondaryContainerTokenString = stringifyTokens('--mdc-banner')(SecondaryContainerBannerDefinition)
const TertiaryContainerTokenString = stringifyTokens('--mdc-banner')(TertiaryContainerBannerDefinition)
const ErrorContainerTokenString = stringifyTokens('--mdc-banner')(ErrorContainerBannerDefinition)
const InverseSurfaceTokenString = stringifyTokens('--mdc-banner')(InverseSurfaceBannerDefinition)

// ─── Easings ────────────────────────────────────────────────────────────────

const EmphasizedDecelerateEasing = unsafeCSS(Easing.EmphasizedDecelerate.ToCSSValue())
const EmphasizedAccelerateEasing = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())

// ─── Sub-component token overrides ──────────────────────────────────────────

const IconStyles = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'enabled-size': `var(--_icon-size)`,
})()

// ─── Base Styles ────────────────────────────────────────────────────────────

const Base = css`
    @layer mdc.banner.variable {
        :host { ${TokenString}; }
    }

    @layer mdc.banner.base {
        :host {
            display: block;
            width: 100%;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        .collapse {
            display: grid;
            grid-template-rows: 0fr;
            opacity: 0;
            visibility: hidden;
        }

        :host([open]) .collapse {
            grid-template-rows: 1fr;
            opacity: 1;
            visibility: visible;
        }

        @media (prefers-reduced-motion: no-preference) {
            :host(:not([quick])) .collapse {
                transition:
                    grid-template-rows 250ms ${EmphasizedAccelerateEasing},
                    opacity 180ms ${EmphasizedAccelerateEasing},
                    visibility 250ms allow-discrete;
            }

            :host([open]:not([quick])) .collapse {
                transition:
                    grid-template-rows 300ms ${EmphasizedDecelerateEasing},
                    opacity 220ms ${EmphasizedDecelerateEasing},
                    visibility 300ms allow-discrete;
            }
        }

        .collapse-inner {
            min-height: 0;
            overflow: hidden;
            container-type: inline-size;
        }

        .surface {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            min-height: var(--_container-min-height);
            box-sizing: border-box;
            background-color: var(--_enabled-container-color);
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-start-radius: var(--_container-shape-end-start);
            border-end-end-radius: var(--_container-shape-end-end);
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            gap: var(--_container-gap);
            border-bottom: var(--_divider-thickness) solid var(--_enabled-divider-color);
        }

        .surface.no-divider {
            border-bottom: none;
        }

        .surface.layout-stacked,
        .surface.layout-auto.has-two-actions,
        .surface.layout-auto.has-headline {
            flex-direction: column;
            align-items: stretch;
            padding-block-start: var(--_stacked-container-padding-block-start);
            padding-block-end: var(--_stacked-container-padding-block-end);
            padding-inline-start: var(--_stacked-container-padding-inline-start);
            padding-inline-end: var(--_stacked-container-padding-inline-end);
            gap: var(--_container-stacked-row-gap);
        }

        @container (max-width: 599px) {
            .surface.layout-auto {
                flex-direction: column;
                align-items: stretch;
                padding-block-start: var(--_stacked-container-padding-block-start);
                padding-block-end: var(--_stacked-container-padding-block-end);
                padding-inline-start: var(--_stacked-container-padding-inline-start);
                padding-inline-end: var(--_stacked-container-padding-inline-end);
                gap: var(--_container-stacked-row-gap);
            }
        }

        .body {
            display: flex;
            flex-direction: row;
            align-items: center;
            flex: 1;
            min-width: 0;
            gap: var(--_container-gap);
        }

        .surface.layout-stacked .body,
        .surface.layout-auto.has-two-actions .body,
        .surface.layout-auto.has-headline .body {
            align-items: flex-start;
        }

        @container (max-width: 599px) {
            .surface.layout-auto .body {
                align-items: flex-start;
            }
        }
    }

    @layer mdc.banner.base.icon {
        .icon-wrapper {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--_enabled-icon-color);
            ${IconStyles};
        }

        .icon-wrapper[hidden] {
            display: none;
        }

        .icon-wrapper.has-icon-container {
            width: var(--_icon-container-size);
            height: var(--_icon-container-size);
            background-color: var(--_enabled-icon-container-color);
            color: var(--_enabled-icon-container-icon-color);
            border-start-start-radius: var(--_icon-container-shape-start-start);
            border-start-end-radius: var(--_icon-container-shape-start-end);
            border-end-start-radius: var(--_icon-container-shape-end-start);
            border-end-end-radius: var(--_icon-container-shape-end-end);
        }
    }

    @layer mdc.banner.base.text {
        .text-group {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 0;
            gap: var(--_container-text-gap);
        }

        .headline {
            font-family: var(--_headline-font);
            font-size: var(--_headline-size);
            font-weight: var(--_headline-weight);
            letter-spacing: var(--_headline-tracking);
            line-height: var(--_headline-leading);
            color: var(--_enabled-headline-color);
            overflow-wrap: anywhere;
        }

        .headline[hidden] {
            display: none;
        }

        .supporting-text {
            font-family: var(--_supporting-text-font);
            font-size: var(--_supporting-text-size);
            font-weight: var(--_supporting-text-weight);
            letter-spacing: var(--_supporting-text-tracking);
            line-height: var(--_supporting-text-leading);
            color: var(--_enabled-supporting-text-color);
            overflow-wrap: anywhere;
        }
    }

    @layer mdc.banner.base.actions {
        .actions {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-end;
            flex-shrink: 0;
            flex-wrap: wrap;
            gap: var(--_container-actions-gap);
        }

        .actions[hidden] {
            display: none;
        }

        .action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            min-height: var(--_action-min-height);
            padding-inline-start: var(--_action-padding-inline-start);
            padding-inline-end: var(--_action-padding-inline-end);
            padding-block-start: var(--_action-padding-block-start);
            padding-block-end: var(--_action-padding-block-end);
            box-sizing: border-box;
            border: none;
            background: transparent;
            color: var(--_enabled-action-text-color);
            font-family: var(--_action-font);
            font-size: var(--_action-size);
            font-weight: var(--_action-weight);
            letter-spacing: var(--_action-tracking);
            line-height: var(--_action-leading);
            cursor: pointer;
            border-start-start-radius: var(--_action-container-shape-start-start);
            border-start-end-radius: var(--_action-container-shape-start-end);
            border-end-start-radius: var(--_action-container-shape-end-start);
            border-end-end-radius: var(--_action-container-shape-end-end);
            outline: none;
            -webkit-tap-highlight-color: transparent;
            white-space: nowrap;
            position: relative;
        }

        .action[hidden] {
            display: none;
        }

        .action::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background-color: var(--_hovered-action-state-layer-color);
            opacity: 0;
            transition: opacity 200ms;
            pointer-events: none;
        }

        .action:hover::before {
            opacity: var(--_hovered-action-state-layer-opacity);
        }

        .action:focus-visible::before {
            background-color: var(--_focused-action-state-layer-color);
            opacity: var(--_focused-action-state-layer-opacity);
        }

        .action:focus-visible {
            outline: 2px solid var(--_enabled-action-text-color);
            outline-offset: -2px;
        }

        .action:active::before {
            background-color: var(--_pressed-action-state-layer-color);
            opacity: var(--_pressed-action-state-layer-opacity);
        }
    }
`

// ─── Variant Styles ─────────────────────────────────────────────────────────

const Variant = css`
    @layer mdc.banner.variant {
        :host([variant='surface']) { ${SurfaceTokenString}; }
        :host([variant='surface-container']) { ${SurfaceContainerTokenString}; }
        :host([variant='primary-container']) { ${PrimaryContainerTokenString}; }
        :host([variant='secondary-container']) { ${SecondaryContainerTokenString}; }
        :host([variant='tertiary-container']) { ${TertiaryContainerTokenString}; }
        :host([variant='error-container']) { ${ErrorContainerTokenString}; }
        :host([variant='inverse-surface']) { ${InverseSurfaceTokenString}; }
    }
`

// ─── Accessibility & Media Preferences ──────────────────────────────────────

const Accessibility = css`
    @layer mdc.banner.a11y {
        @media (prefers-contrast: more) {
            .surface {
                border-bottom-width: 2px;
            }

            .action {
                border: 1px solid currentColor;
            }
        }

        @media (prefers-contrast: less) {
            .surface {
                border-bottom-color: color-mix(in srgb, var(--_enabled-divider-color) 60%, transparent);
            }
        }

        @media (forced-colors: active) {
            .surface {
                background-color: Canvas;
                color: CanvasText;
                border-bottom: 1px solid CanvasText;
            }

            .headline,
            .supporting-text,
            .icon-wrapper {
                color: CanvasText;
            }

            .icon-wrapper.has-icon-container {
                background-color: Canvas;
                border: 1px solid CanvasText;
            }

            .action {
                color: ButtonText;
                border: 1px solid ButtonText;
            }

            .action:focus-visible {
                outline: 2px solid Highlight;
            }
        }
    }
`

export const BannerStyles = [Base, Variant, Accessibility]
