/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { SkeletonDefinition } from './skeleton.definition'

const Tokens = stringifyTokens('--mdc-skeleton')(SkeletonDefinition)

const StylePart = css`
    @layer mdc.skeleton.base {
        :host {
            box-sizing: border-box;
            position: relative;
            display: block;
            isolation: isolate;
            max-width: 100%;
            --_resolved-text-height: var(--_medium-text-height);
            --_resolved-circular-size: var(--_medium-circular-size);
            --_resolved-pill-height: var(--_medium-pill-height);
            --_resolved-pill-width: var(--_medium-pill-width);
            --_resolved-block-height: var(--_medium-block-height);
            --_resolved-shape-ss: var(--_text-container-shape-start-start);
            --_resolved-shape-se: var(--_text-container-shape-start-end);
            --_resolved-shape-ee: var(--_text-container-shape-end-end);
            --_resolved-shape-es: var(--_text-container-shape-end-start);
        }

        :host([hidden]) {
            display: none;
        }

        :host(.standalone-idle) {
            display: none;
        }

        :host([variant='circular']),
        :host([variant='pill']) {
            display: inline-block;
            vertical-align: middle;
        }

        :host(.has-content) {
            display: inline-grid;
        }

        /* Resolved size tokens */
        .root.size-extra-small {
            --_resolved-text-height: var(--_extra-small-text-height);
            --_resolved-circular-size: var(--_extra-small-circular-size);
            --_resolved-pill-height: var(--_extra-small-pill-height);
            --_resolved-pill-width: var(--_extra-small-pill-width);
            --_resolved-block-height: var(--_extra-small-block-height);
        }

        .root.size-small {
            --_resolved-text-height: var(--_small-text-height);
            --_resolved-circular-size: var(--_small-circular-size);
            --_resolved-pill-height: var(--_small-pill-height);
            --_resolved-pill-width: var(--_small-pill-width);
            --_resolved-block-height: var(--_small-block-height);
        }

        .root.size-medium {
            --_resolved-text-height: var(--_medium-text-height);
            --_resolved-circular-size: var(--_medium-circular-size);
            --_resolved-pill-height: var(--_medium-pill-height);
            --_resolved-pill-width: var(--_medium-pill-width);
            --_resolved-block-height: var(--_medium-block-height);
        }

        .root.size-large {
            --_resolved-text-height: var(--_large-text-height);
            --_resolved-circular-size: var(--_large-circular-size);
            --_resolved-pill-height: var(--_large-pill-height);
            --_resolved-pill-width: var(--_large-pill-width);
            --_resolved-block-height: var(--_large-block-height);
        }

        .root.size-extra-large {
            --_resolved-text-height: var(--_extra-large-text-height);
            --_resolved-circular-size: var(--_extra-large-circular-size);
            --_resolved-pill-height: var(--_extra-large-pill-height);
            --_resolved-pill-width: var(--_extra-large-pill-width);
            --_resolved-block-height: var(--_extra-large-block-height);
        }

        /* Resolved shape tokens per variant */
        .root.variant-text {
            --_resolved-shape-ss: var(--_text-container-shape-start-start);
            --_resolved-shape-se: var(--_text-container-shape-start-end);
            --_resolved-shape-ee: var(--_text-container-shape-end-end);
            --_resolved-shape-es: var(--_text-container-shape-end-start);
        }

        .root.variant-rectangular {
            --_resolved-shape-ss: var(--_rectangular-container-shape-start-start);
            --_resolved-shape-se: var(--_rectangular-container-shape-start-end);
            --_resolved-shape-ee: var(--_rectangular-container-shape-end-end);
            --_resolved-shape-es: var(--_rectangular-container-shape-end-start);
        }

        .root.variant-rounded {
            --_resolved-shape-ss: var(--_rounded-container-shape-start-start);
            --_resolved-shape-se: var(--_rounded-container-shape-start-end);
            --_resolved-shape-ee: var(--_rounded-container-shape-end-end);
            --_resolved-shape-es: var(--_rounded-container-shape-end-start);
        }

        .root.variant-circular {
            --_resolved-shape-ss: var(--_circular-container-shape-start-start);
            --_resolved-shape-se: var(--_circular-container-shape-start-end);
            --_resolved-shape-ee: var(--_circular-container-shape-end-end);
            --_resolved-shape-es: var(--_circular-container-shape-end-start);
        }

        .root.variant-pill {
            --_resolved-shape-ss: var(--_pill-container-shape-start-start);
            --_resolved-shape-se: var(--_pill-container-shape-start-end);
            --_resolved-shape-ee: var(--_pill-container-shape-end-end);
            --_resolved-shape-es: var(--_pill-container-shape-end-start);
        }

        .root {
            position: relative;
            box-sizing: border-box;
            width: 100%;
        }

        /* Standalone multi-line text stack */
        .lines {
            display: flex;
            flex-direction: column;
            gap: var(--_text-line-gap);
            width: 100%;
        }

        /* Core placeholder block */
        .shape {
            position: relative;
            box-sizing: border-box;
            overflow: hidden;
            background-color: var(--_enabled-container-color);
            border-start-start-radius: var(--_resolved-shape-ss);
            border-start-end-radius: var(--_resolved-shape-se);
            border-end-end-radius: var(--_resolved-shape-ee);
            border-end-start-radius: var(--_resolved-shape-es);
            z-index: 0;
        }

        .root.variant-text .shape {
            width: 100%;
            height: var(--_resolved-text-height);
        }

        .root.variant-text .shape.line-last {
            width: var(--_text-last-line-width);
        }

        .root.variant-rectangular .shape,
        .root.variant-rounded .shape {
            width: 100%;
            height: var(--_resolved-block-height);
        }

        .root.variant-circular .shape {
            width: var(--_resolved-circular-size);
            height: var(--_resolved-circular-size);
            aspect-ratio: 1;
        }

        .root.variant-pill .shape {
            width: var(--_resolved-pill-width);
            height: var(--_resolved-pill-height);
        }

        /* GPU-composited shimmer overlay */
        .root.animation-shimmer .shape::after {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
            background-image: linear-gradient(
                90deg,
                transparent 0%,
                color-mix(
                    in srgb,
                    var(--_enabled-shimmer-color) calc(var(--_shimmer-opacity) * 100%),
                    transparent
                ) 50%,
                transparent 100%
            );
            transform: translateX(-100%);
            will-change: transform;
            animation: mdc-skeleton-shimmer var(--_shimmer-duration) var(--_shimmer-easing) infinite;
        }

        .root.animation-shimmer:dir(rtl) .shape::after {
            transform: translateX(100%);
            animation-name: mdc-skeleton-shimmer-rtl;
        }

        /* Pulse breathing animation */
        .root.animation-pulse .shape {
            animation: mdc-skeleton-pulse var(--_pulse-duration) var(--_pulse-easing) infinite;
        }

        /* Wrapper mode: zero-CLS content preservation */
        .content {
            position: relative;
            z-index: 0;
            transition: opacity var(--_reveal-duration) ease;
        }

        .root.loading .content {
            visibility: hidden;
            opacity: 0;
        }

        .overlay {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
            transition: opacity var(--_reveal-duration) ease;
        }

        .root.has-content .overlay.shape {
            width: 100%;
            height: 100%;
            aspect-ratio: auto;
        }

        .overlay[hidden] {
            display: none;
        }

        .slot-probe {
            display: none;
        }
    }

    @keyframes mdc-skeleton-shimmer {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }

    @keyframes mdc-skeleton-shimmer-rtl {
        0% {
            transform: translateX(100%);
        }
        100% {
            transform: translateX(-100%);
        }
    }

    @keyframes mdc-skeleton-pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: var(--_pulse-min-opacity);
        }
    }

    @layer mdc.skeleton.a11y {
        @media (prefers-reduced-motion: reduce) {
            .root.animation-shimmer .shape::after {
                animation: none;
                display: none;
            }

            .root.animation-pulse .shape {
                animation: none;
            }

            .content,
            .overlay {
                transition: none;
            }
        }

        @media (forced-colors: active) {
            .shape {
                forced-color-adjust: none;
                background-color: Canvas;
                border: 1px solid GrayText;
            }

            .root.animation-shimmer .shape::after {
                display: none;
            }
        }

        @media (prefers-contrast: more) {
            .shape {
                outline: 1px solid currentColor;
                outline-offset: -1px;
            }
        }

        @media (prefers-contrast: less) {
            .shape {
                opacity: 0.85;
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            .root.animation-shimmer .shape::after {
                background-image: linear-gradient(
                    90deg,
                    var(--_enabled-container-color) 0%,
                    var(--_enabled-shimmer-color) 50%,
                    var(--_enabled-container-color) 100%
                );
            }
        }
    }
`

export const SkeletonStyles = [
    css`:host {${Tokens};}`,
    StylePart,
]
