/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
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
    TertiaryContainerSnackbarDefinition,
    TertiarySnackbarDefinition,
    SurfaceSnackbarDefinition,
} from './snackbar.definition'
import { overrideTokens, stringifyTokens } from '@sandlada/styles/adapters/lit'

// ─── Base token record (used for variable layer default) ────────────────────
const tokenString = stringifyTokens('--mdc-snackbar')(SnackbarDefinition)

// ─── Per-variant token records ──────────────────────────────────────────────

const surfaceTokenString = stringifyTokens('--mdc-snackbar')(SurfaceSnackbarDefinition)

const inverseSurfaceTokenString = stringifyTokens('--mdc-snackbar')(InverseSurfaceSnackbarDefinition)

const primaryTokenString = stringifyTokens('--mdc-snackbar')(PrimarySnackbarDefinition)

const secondaryTokenString = stringifyTokens('--mdc-snackbar')(SecondarySnackbarDefinition)

const tertiaryTokenString = stringifyTokens('--mdc-snackbar')(TertiarySnackbarDefinition)

const errorTokenString = stringifyTokens('--mdc-snackbar')(ErrorSnackbarDefinition)

const primaryContainerTokenString = stringifyTokens('--mdc-snackbar')(PrimaryContainerSnackbarDefinition)

const secondaryContainerTokenString = stringifyTokens('--mdc-snackbar')(SecondaryContainerSnackbarDefinition)

const tertiaryContainerTokenString = stringifyTokens('--mdc-snackbar')(TertiaryContainerSnackbarDefinition)

const errorContainerTokenString = stringifyTokens('--mdc-snackbar')(ErrorContainerSnackbarDefinition)

// ─── Easings ────────────────────────────────────────────────────────────────

const emphasizedDecelerateEasing = unsafeCSS(Easing.EmphasizedDecelerate.ToCSSValue())
const emphasizedAccelerateEasing = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())

// ─── Icon override styles ───────────────────────────────────────────────────

const iconStyles = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'enabled-size': `var(--_icon-size)`,
})()

// ─── Base styles ────────────────────────────────────────────────────────────

const base = css`
    @layer mdc.snackbar.variable {
        :host { ${tokenString}; }
    }

    @layer mdc.snackbar.base {
        :host {
            display: block;
            position: relative;
        }

        :host(:not([open])) {
            visibility: hidden;
        }

        .container {
            display: flex;
            align-items: center;
            min-height: var(--_container-min-height);
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            border-start-start-radius: var(--_container-shape-start-start);
            border-start-end-radius: var(--_container-shape-start-end);
            border-end-start-radius: var(--_container-shape-end-start);
            border-end-end-radius: var(--_container-shape-end-end);
            color: var(--_enabled-label-color);
            box-shadow: 0 3px 5px -1px rgba(0,0,0,0.2), 0 6px 10px 0 rgba(0,0,0,0.14), 0 1px 18px 0 rgba(0,0,0,0.12);
            gap: var(--_container-gap);
            pointer-events: auto;
            will-change: transform, opacity;
            box-sizing: border-box;
            position: relative;
        }

        .container .background {
            border-radius: inherit;
            inset: 0;
            position: absolute;
            z-index: -1;
            background-color: var(--_enabled-container-color);
        }
    }

    @layer mdc.snackbar.base.label {
        .label {
            flex: 1;
            font-family: var(--_label-font);
            font-size: var(--_label-size);
            font-weight: var(--_label-weight);
            letter-spacing: var(--_label-tracking);
            line-height: var(--_label-line-height);
            color: var(--_enabled-label-color);
            padding-inline-start: var(--_label-padding-inline-start);
            padding-inline-end: var(--_label-padding-inline-end);
            padding-block-start: var(--_label-padding-block-start);
            padding-block-end: var(--_label-padding-block-end);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .container.multiline .label {
            white-space: normal;
        }
    }

    @layer mdc.snackbar.base.icon {
        .icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--_enabled-icon-color);
            ${iconStyles};
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
            line-height: var(--_action-line-height);
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
        }

        .action:hover::before {
            opacity: var(--_hovered-action-state-layer-opacity);
        }

        .action:focus-visible::before {
            opacity: var(--_focused-action-state-layer-opacity);
        }

        .action:active::before {
            opacity: var(--_pressed-action-state-layer-opacity);
        }
    }

    @layer mdc.snackbar.base.close-icon {
        .close-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: var(--_close-icon-size);
            height: var(--_close-icon-size);
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
        }

        .container:not(.has-close-icon) .close-icon {
            display: none;
        }

        .close-icon:hover {
            background-color: rgba(255, 255, 255, 0.08);
        }
    }

    @layer mdc.snackbar.animation {
        /* Fade animation (default) */
        :host([animation-mode="fade"]:not([open])) .container {
            opacity: 0;
            transform: scale(0.8);
        }

        :host([animation-mode="fade"][open]) .container {
            opacity: 1;
            transform: scale(1);
            transition: transform 250ms ${emphasizedDecelerateEasing},
                        opacity 150ms ${emphasizedDecelerateEasing};
        }

        :host([animation-mode="fade"].closing) .container {
            opacity: 0;
            transform: scale(0.8);
            transition: transform 150ms ${emphasizedAccelerateEasing},
                        opacity 150ms ${emphasizedAccelerateEasing};
        }

        /* Slide animation */
        :host([animation-mode="slide"]:not([open])) .container {
            transform: translateY(100%);
            opacity: 0;
        }

        :host([animation-mode="slide"][open]) .container {
            transform: translateY(0);
            opacity: 1;
            transition: transform 250ms ${emphasizedDecelerateEasing},
                        opacity 150ms ${emphasizedDecelerateEasing};
        }

        :host([animation-mode="slide"].closing) .container {
            transform: translateY(100%);
            opacity: 0;
            transition: transform 150ms ${emphasizedAccelerateEasing},
                        opacity 150ms ${emphasizedAccelerateEasing};
        }
    }

    @media (forced-colors: active) {
        .container {
            border: 1px solid CanvasText;
        }
    }
`

// ─── Color variant styles ───────────────────────────────────────────────────

const colorVariants = css`
    :host:has(.container.variant-surface)             {${surfaceTokenString};}
    :host:has(.container.variant-inverse-surface)     {${inverseSurfaceTokenString};}
    :host:has(.container.variant-primary)             {${primaryTokenString};}
    :host:has(.container.variant-secondary)           {${secondaryTokenString};}
    :host:has(.container.variant-tertiary)            {${tertiaryTokenString};}
    :host:has(.container.variant-error)               {${errorTokenString};}
    :host:has(.container.variant-primary-container)   {${primaryContainerTokenString};}
    :host:has(.container.variant-secondary-container) {${secondaryContainerTokenString};}
    :host:has(.container.variant-tertiary-container)  {${tertiaryContainerTokenString};}
    :host:has(.container.variant-error-container)     {${errorContainerTokenString};}
`

export const SnackbarStyles = [
    base,
    colorVariants,
]
