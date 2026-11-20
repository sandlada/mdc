/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import type { IconDefinition } from '../icon/icon.definition'
import {
    ErrorContainerSnackbarDefinition,
    ErrorSnackbarDefinition,
    InverseSurfaceSnackbarDefinition,
    PrimaryContainerSnackbarDefinition,
    PrimarySnackbarDefinition,
    SecondaryContainerSnackbarDefinition,
    SecondarySnackbarDefinition,
    SnackbarDefinition,
    SurfaceSnackbarDefinition,
    TertiaryContainerSnackbarDefinition,
    TertiarySnackbarDefinition,
} from './snackbar.definition'
import { overrideTokens, stringifyTokens } from '../../utils/style'

// ─── Base token record (used for variable layer default) ────────────────────
const TokenString = stringifyTokens('--mdc-snackbar')(SnackbarDefinition)

// ─── Per-variant token records ──────────────────────────────────────────────

const SurfaceTokenString = stringifyTokens('--mdc-snackbar')(SurfaceSnackbarDefinition)
const InverseSurfaceTokenString = stringifyTokens('--mdc-snackbar')(InverseSurfaceSnackbarDefinition)
const PrimaryTokenString = stringifyTokens('--mdc-snackbar')(PrimarySnackbarDefinition)
const SecondaryTokenString = stringifyTokens('--mdc-snackbar')(SecondarySnackbarDefinition)
const TertiaryTokenString = stringifyTokens('--mdc-snackbar')(TertiarySnackbarDefinition)
const ErrorTokenString = stringifyTokens('--mdc-snackbar')(ErrorSnackbarDefinition)
const PrimaryContainerTokenString = stringifyTokens('--mdc-snackbar')(PrimaryContainerSnackbarDefinition)
const SecondaryContainerTokenString = stringifyTokens('--mdc-snackbar')(SecondaryContainerSnackbarDefinition)
const TertiaryContainerTokenString = stringifyTokens('--mdc-snackbar')(TertiaryContainerSnackbarDefinition)
const ErrorContainerTokenString = stringifyTokens('--mdc-snackbar')(ErrorContainerSnackbarDefinition)

// ─── Easings ────────────────────────────────────────────────────────────────

const EmphasizedDecelerateEasing = unsafeCSS(Easing.EmphasizedDecelerate.ToCSSValue())
const EmphasizedAccelerateEasing = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())

// ─── Sub-component token overrides ──────────────────────────────────────────

const IconStyles = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'enabled-size': `var(--_icon-size)`,
})()

const ElevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level'       : `var(--_container-elevation)`,
    'shadow-color': `var(--_container-shadow-color)`,
})()

// ─── Base styles ────────────────────────────────────────────────────────────

const Base = css`
    @layer mdc.snackbar.variable {
        :host { ${TokenString}; }
    }

    @layer mdc.snackbar.base {
        :host {
            display: block;
            position: relative;
        }

        :host(:not([open]):not([closing])) {
            visibility: hidden;
        }

        .container {
            display: flex;
            flex-direction: row;
            align-items: center;
            min-height: var(--_container-min-height);
            max-width: var(--_container-max-width);
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-start-radius: var(--_container-shape-end-start);
            border-end-end-radius: var(--_container-shape-end-end);
            color: var(--_enabled-label-color);
            gap: var(--_container-gap);
            pointer-events: auto;
            will-change: transform, opacity;
            box-sizing: border-box;
            position: relative;
            touch-action: pan-y;
            user-select: none;
            ${ElevationStyles};
        }

        .container.multiline {
            min-height: var(--_container-multiline-min-height);
        }

        .container.action-on-new-line {
            flex-direction: column;
            align-items: stretch;
            min-height: var(--_container-action-on-new-line-min-height);
            padding-block-end: 8px;
        }

        .container .background {
            border-radius: inherit;
            inset: 0;
            position: absolute;
            z-index: -1;
            background-color: var(--_enabled-container-color);
        }

        .body {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;
            gap: var(--_container-gap);
        }

        .actions {
            display: flex;
            align-items: center;
            flex-shrink: 0;
            gap: 4px;
        }

        .container.action-on-new-line .actions {
            align-self: flex-end;
            justify-content: flex-end;
        }

        .container:not(.has-action):not(.has-close-icon) .actions {
            display: none;
        }
    }

    @layer mdc.snackbar.base.label {
        .label {
            flex: 1;
            min-width: 0;
            font-family: var(--_label-font);
            font-size: var(--_label-size);
            font-weight: var(--_label-weight);
            letter-spacing: var(--_label-tracking);
            line-height: var(--_label-leading);
            color: var(--_enabled-label-color);
            padding-inline-start: var(--_label-padding-inline-start);
            padding-inline-end: var(--_label-padding-inline-end);
            padding-block-start: var(--_label-padding-block-start);
            padding-block-end: var(--_label-padding-block-end);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .container.multiline .label,
        .container.action-on-new-line .label {
            white-space: normal;
            overflow-wrap: anywhere;
        }
    }

    @layer mdc.snackbar.base.icon {
        .icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--_enabled-icon-color);
            ${IconStyles};
        }

        .container:not(.has-icon) .icon {
            display: none;
        }
    }

    @layer mdc.snackbar.base.action {
        .action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            padding-inline-start: var(--_action-padding-inline-start);
            padding-inline-end: var(--_action-padding-inline-end);
            padding-block-start: var(--_action-padding-block-start);
            padding-block-end: var(--_action-padding-block-end);
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

        .container:not(.has-action) .action {
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

    @layer mdc.snackbar.base.close-icon {
        .close-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: var(--_close-icon-button-size);
            height: var(--_close-icon-button-size);
            padding-inline-start: var(--_close-icon-padding-inline-start);
            padding-inline-end: var(--_close-icon-padding-inline-end);
            padding-block-start: var(--_close-icon-padding-block-start);
            padding-block-end: var(--_close-icon-padding-block-end);
            box-sizing: border-box;
            border: none;
            background: transparent;
            color: var(--_enabled-close-icon-color);
            cursor: pointer;
            border-start-start-radius: var(--_close-icon-shape-start-start);
            border-start-end-radius: var(--_close-icon-shape-start-end);
            border-end-start-radius: var(--_close-icon-shape-end-start);
            border-end-end-radius: var(--_close-icon-shape-end-end);
            outline: none;
            -webkit-tap-highlight-color: transparent;
            position: relative;
        }

        .close-icon svg {
            width: var(--_close-icon-size);
            height: var(--_close-icon-size);
            flex-shrink: 0;
        }

        .container:not(.has-close-icon) .close-icon {
            display: none;
        }

        .close-icon::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background-color: var(--_hovered-close-icon-state-layer-color);
            opacity: 0;
            transition: opacity 200ms;
            pointer-events: none;
        }

        .close-icon:hover::before {
            opacity: var(--_hovered-close-icon-state-layer-opacity);
        }

        .close-icon:focus-visible::before {
            background-color: var(--_focused-close-icon-state-layer-color);
            opacity: var(--_focused-close-icon-state-layer-opacity);
        }

        .close-icon:focus-visible {
            outline: 2px solid var(--_enabled-close-icon-color);
            outline-offset: -2px;
        }

        .close-icon:active::before {
            background-color: var(--_pressed-close-icon-state-layer-color);
            opacity: var(--_pressed-close-icon-state-layer-opacity);
        }
    }

    @layer mdc.snackbar.animation {
        @keyframes snackbar-fade-in {
            from {
                opacity: 0;
                transform: scale(0.8);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        @keyframes snackbar-slide-in {
            from {
                opacity: 0;
                transform: translateY(var(--_slide-offset));
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Fade animation */
        :host([animation-mode="fade"]:not([open])) .container,
        :host([animation-mode="fade"]) .container.closing {
            opacity: 0;
            transform: scale(0.8);
        }

        :host([animation-mode="fade"][open]) .container:not(.closing) {
            opacity: 1;
            transform: scale(1);
            animation: snackbar-fade-in 250ms ${EmphasizedDecelerateEasing};
        }

        :host([animation-mode="fade"]) .container.closing {
            transition: transform 150ms ${EmphasizedAccelerateEasing},
                        opacity 150ms ${EmphasizedAccelerateEasing};
        }

        /* Slide animation */
        :host([animation-mode="slide"]:not([open])) .container,
        :host([animation-mode="slide"]) .container.closing {
            transform: translateY(var(--_slide-offset));
            opacity: 0;
        }

        :host([animation-mode="slide"][open]) .container:not(.closing) {
            transform: translateY(0);
            opacity: 1;
            animation: snackbar-slide-in 250ms ${EmphasizedDecelerateEasing};
        }

        :host([animation-mode="slide"]) .container.closing {
            transition: transform 150ms ${EmphasizedAccelerateEasing},
                        opacity 150ms ${EmphasizedAccelerateEasing};
        }

        /* Dragging overrides transition */
        .container.dragging {
            transition: none;
            animation: none;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .container,
        .action::before,
        .close-icon::before {
            transition: none;
            animation: none;
        }
    }

    @media (prefers-contrast: more) {
        .container {
            outline: 1px solid currentColor;
        }
    }

    @media (forced-colors: active) {
        .container {
            border: 1px solid CanvasText;
        }

        .action:focus-visible,
        .close-icon:focus-visible {
            outline: 2px solid Highlight;
        }
    }
`

// ─── Color variant styles ───────────────────────────────────────────────────

const ColorVariants = css`
    :host:has(.container.variant-surface)             {${SurfaceTokenString};}
    :host:has(.container.variant-inverse-surface)     {${InverseSurfaceTokenString};}
    :host:has(.container.variant-primary)             {${PrimaryTokenString};}
    :host:has(.container.variant-secondary)           {${SecondaryTokenString};}
    :host:has(.container.variant-tertiary)            {${TertiaryTokenString};}
    :host:has(.container.variant-error)               {${ErrorTokenString};}
    :host:has(.container.variant-primary-container)   {${PrimaryContainerTokenString};}
    :host:has(.container.variant-secondary-container) {${SecondaryContainerTokenString};}
    :host:has(.container.variant-tertiary-container)  {${TertiaryContainerTokenString};}
    :host:has(.container.variant-error-container)     {${ErrorContainerTokenString};}
`

export const SnackbarStyles = [
    Base,
    ColorVariants,
]
