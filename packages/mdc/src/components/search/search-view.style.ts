/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import type { IconDefinition } from '../icon/icon.definition'
import { SearchViewDefinition } from './search.definition'

const TokenString = stringifyTokens('--mdc-search-view')(SearchViewDefinition)

const ElevationTokens = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_enabled-container-elevation)`,
})()

const LeadingIconTokens = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'enabled-size': `var(--_enabled-leading-icon-size)`,
})()

const TrailingIconTokens = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'enabled-size': `var(--_enabled-trailing-icon-size)`,
})()

export const SearchViewStyle = css`
    @layer mdc.search-view.variable {
        :host {
            ${TokenString};
        }
    }

    @layer mdc.search-view.composite.elevation {
        mdc-elevation {
            ${ElevationTokens};
        }
    }

    @layer mdc.search-view.composite.icon {
        .leading-icon {
            ${LeadingIconTokens};
        }
        .trailing-icon {
            ${TrailingIconTokens};
        }
    }

    @layer mdc.search-view.base {
        :host {
            display: contents;
            -webkit-tap-highlight-color: transparent;
        }

        .dialog {
            position: fixed;
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            border: none;
            outline: none;
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-input-text-color);
            flex-direction: column;
            overflow: hidden;
            z-index: 1;
        }

        .dialog[open] {
            display: flex;
        }

        /* ── Fullscreen Variant ───────────────────────────────────────────── */
        .dialog.fullscreen {
            inset: 0;
            width: 100vw;
            max-width: 100vw;
            height: 100dvh;
            max-height: 100dvh;
            border-start-start-radius: var(--_enabled-fullscreen-container-shape-start-start);
            border-start-end-radius: var(--_enabled-fullscreen-container-shape-start-end);
            border-end-start-radius: var(--_enabled-fullscreen-container-shape-end-start);
            border-end-end-radius: var(--_enabled-fullscreen-container-shape-end-end);
        }

        .dialog.fullscreen::backdrop {
            background: transparent;
        }

        .dialog.fullscreen mdc-elevation {
            display: none;
        }

        /* ── Docked Variant ───────────────────────────────────────────────── */
        .dialog.docked {
            inset-block-start: var(--_docked-top, 16px);
            inset-inline-start: var(--_docked-left, 50%);
            transform: var(--_docked-transform, none);
            width: var(--_docked-width, min(560px, calc(100vw - 32px)));
            min-width: min(var(--_enabled-docked-min-width), calc(100vw - 16px));
            max-width: min(var(--_enabled-docked-max-width), calc(100vw - 16px));
            max-height: min(var(--_enabled-docked-max-height), calc(100dvh - var(--_docked-top, 16px) - 16px));
            border-start-start-radius: var(--_enabled-docked-container-shape-start-start);
            border-start-end-radius: var(--_enabled-docked-container-shape-start-end);
            border-end-start-radius: var(--_enabled-docked-container-shape-end-start);
            border-end-end-radius: var(--_enabled-docked-container-shape-end-end);
            overflow: visible;
        }

        .dialog.docked::backdrop {
            background: transparent;
        }

        .dialog.docked .surface {
            border-radius: inherit;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            max-height: inherit;
            background-color: var(--_enabled-container-color);
        }

        .dialog.fullscreen .surface {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        /* ── Header ───────────────────────────────────────────────────────── */
        .header {
            display: flex;
            align-items: center;
            flex-shrink: 0;
            box-sizing: border-box;
            height: var(--_enabled-header-height);
            padding-inline-start: var(--_enabled-header-padding-inline-start);
            padding-inline-end: var(--_enabled-header-padding-inline-end);
            padding-block-start: var(--_enabled-header-padding-block-start);
            padding-block-end: var(--_enabled-header-padding-block-end);
            gap: var(--_enabled-header-gap);
        }

        .dialog.docked .header {
            height: var(--_enabled-docked-header-height);
        }

        .leading-icon,
        .trailing-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .leading-icon {
            color: var(--_enabled-leading-icon-color);
        }

        .trailing-icon {
            color: var(--_enabled-trailing-icon-color);
            gap: var(--_enabled-header-gap);
        }

        .action-icon {
            fill: currentColor;
            width: 24px;
            height: 24px;
        }

        .input {
            all: unset;
            flex: 1 1 auto;
            min-width: 0;
            height: 100%;
            box-sizing: border-box;
            color: var(--_enabled-input-text-color);
            font-family: var(--_enabled-input-text-font);
            line-height: var(--_enabled-input-text-leading);
            font-size: var(--_enabled-input-text-size);
            font-weight: var(--_enabled-input-text-weight);
            letter-spacing: var(--_enabled-input-text-tracking);
            padding-inline-start: var(--_enabled-content-padding-inline-start);
            padding-inline-end: var(--_enabled-content-padding-inline-end);
            padding-block-start: var(--_enabled-content-padding-block-start);
            padding-block-end: var(--_enabled-content-padding-block-end);
        }

        .input::-webkit-search-cancel-button,
        .input::-webkit-search-decoration {
            -webkit-appearance: none;
            appearance: none;
        }

        .input::placeholder {
            color: var(--_enabled-supporting-text-color);
            font-family: var(--_enabled-supporting-text-font);
            line-height: var(--_enabled-supporting-text-leading);
            font-size: var(--_enabled-supporting-text-size);
            font-weight: var(--_enabled-supporting-text-weight);
            letter-spacing: var(--_enabled-supporting-text-tracking);
            opacity: 1;
        }

        .clear-button[hidden] {
            display: none;
        }

        /* ── Divider & Body ───────────────────────────────────────────────── */
        .divider {
            flex-shrink: 0;
            width: 100%;
            height: var(--_enabled-divider-thickness);
            background-color: var(--_enabled-divider-color);
        }

        .body {
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            overscroll-behavior: contain;
            padding-inline-start: var(--_enabled-body-padding-inline-start);
            padding-inline-end: var(--_enabled-body-padding-inline-end);
            padding-block-start: var(--_enabled-body-padding-block-start);
            padding-block-end: var(--_enabled-body-padding-block-end);
        }
    }

    @layer mdc.search-view.a11y {
        @media (forced-colors: active) {
            .dialog {
                border: 1px solid CanvasText;
            }
            .divider {
                background-color: CanvasText;
            }
        }

        @media (prefers-contrast: more) {
            .dialog.docked {
                outline: 1px solid currentColor;
            }
        }
    }
`
