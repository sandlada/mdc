/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { ExpressiveProgressIndicatorDefinition } from '../../component-definitions/expressive-progress-indicator.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(ExpressiveProgressIndicatorDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-expressive-progress-indicator'
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

// ── Animation constants ─────────────────────────────────────────────────────
// Determinate motion approximates Compose's `ProgressAnimationSpec`
// (SpringSpec dampingRatio = NoBouncy, stiffness = VeryLow): a smooth,
// non-overshooting settle. `cubic-bezier(0.16, 1, 0.3, 1)` gives a springy
// burst that decelerates without bouncing past the target.
const determinateDuration = unsafeCSS(`650ms`)
const determinateEasing = unsafeCSS(`cubic-bezier(0.16, 1, 0.3, 1)`)

// Indeterminate linear: Compose `LinearAnimationDuration = 1750`.
const indeterminateLinearDuration = unsafeCSS(`1750ms`)

// Indeterminate circular: Compose `CircularAnimationDuration = 6000`, arc
// sweeps between 0.1 (36deg) and 0.87 (313deg) with `EasingStandardCubicBezier`
// while rotating 1440deg total (1080 global + 360 additional).
const indeterminateCircularDuration = unsafeCSS(`6000ms`)
const indeterminateCircularEasing = unsafeCSS(`cubic-bezier(0.4, 0, 0.2, 1)`)

export const ExpressiveProgressIndicatorStyles = css`
    @layer mdc.expressive-progress-indicator.variable {
        :host { ${tokenString}; }
    }

    @layer mdc.expressive-progress-indicator.base {
        /*
         * Host: deliberately no content-visibility / contain. When the
         * indicator starts off-screen (e.g. below the fold on a long docs
         * page), content-visibility: auto skips rendering and freezes the
         * indeterminate animation at its first frame — the bars never resume
         * after scrolling into view, leaving an empty track. These tiny
         * indicators get no measurable perf benefit, so we avoid the skip.
         */

        /* ── Host ──────────────────────────────────────────────────────────── */
        :host([variant='linear']) {
            border-start-start-radius: var(--_track-shape-start-start);
            border-start-end-radius: var(--_track-shape-start-end);
            border-end-start-radius: var(--_track-shape-end-start);
            border-end-end-radius: var(--_track-shape-end-end);
            display: flex;
            position: relative;
            min-width: 80px;
            height: var(--_linear-track-thickness);
        }

        :host([variant='circular']) {
            display: inline-flex;
            vertical-align: middle;
            position: relative;
            align-items: center;
            justify-content: center;
        }
        :host([variant='circular'][circular-size='extra-small']) {
            width: var(--_circular-extra-small-size);
            height: var(--_circular-extra-small-size);
        }
        :host([variant='circular'][circular-size='small']) {
            width: var(--_circular-small-size);
            height: var(--_circular-small-size);
        }
        :host([variant='circular'][circular-size='medium']) {
            width: var(--_circular-medium-size);
            height: var(--_circular-medium-size);
        }
        :host([variant='circular'][circular-size='large']) {
            width: var(--_circular-large-size);
            height: var(--_circular-large-size);
        }

        /* ── Progress container ────────────────────────────────────────────── */
        .progress,
        .track,
        .active-bar,
        .stop-indicator,
        .bar,
        .bar-inner,
        .circular-spinner,
        svg,
        .track-circle,
        .active-circle,
        .spinner-arc {
            position: absolute;
            inset: 0;
        }

        :host([variant='linear']) .progress {
            /* Animations stay LTR; RTL is handled by flipping the host. */
            direction: ltr;
            border-radius: inherit;
            overflow: hidden;
        }

        :host([variant='circular']) .progress {
            flex: 1;
            align-self: stretch;
            margin: 4px;
        }

        /* ── Linear: determinate ───────────────────────────────────────────── */
        .active-bar {
            height: var(--_linear-active-indicator-thickness);
            width: calc(var(--_fraction) * 100%);
            border-start-start-radius: var(--_active-indicator-shape-start-start);
            border-start-end-radius: var(--_active-indicator-shape-start-end);
            border-end-start-radius: var(--_active-indicator-shape-end-start);
            border-end-end-radius: var(--_active-indicator-shape-end-end);
            background: var(--_enabled-active-indicator-color);
            transition: width ${determinateDuration} ${determinateEasing};
        }

        /*
         * The track starts after the active indicator plus a visual gap.
         * Round caps are drawn inside the element box (border-radius), so the
         * raw gap size is used directly - no cap compensation needed.
         */
        .track {
            height: var(--_linear-track-thickness);
            inset-inline-start: calc(
                var(--_fraction) * 100% +
                    min(var(--_fraction) * 100%, var(--_linear-track-gap))
            );
            inset-inline-end: 0;
            border-start-start-radius: var(--_track-shape-start-start);
            border-start-end-radius: var(--_track-shape-start-end);
            border-end-start-radius: var(--_track-shape-end-start);
            border-end-end-radius: var(--_track-shape-end-end);
            background: var(--_enabled-track-color);
            transition: inset-inline-start ${determinateDuration} ${determinateEasing};
        }

        /* Round stop indicator at the trailing edge of the track. */
        .stop-indicator {
            width: var(--_linear-stop-indicator-size);
            height: var(--_linear-stop-indicator-size);
            inset-inline-end: 0;
            top: 50%;
            transform: translateY(-50%);
            border-start-start-radius: var(--_stop-indicator-shape-start-start);
            border-start-end-radius: var(--_stop-indicator-shape-start-end);
            border-end-start-radius: var(--_stop-indicator-shape-end-start);
            border-end-end-radius: var(--_stop-indicator-shape-end-end);
            background: var(--_enabled-stop-indicator-color);
        }

        /* ── Linear: indeterminate ──────────────────────────────────────────── */
        .bar {
            width: 100%;
            height: var(--_linear-active-indicator-thickness);
            transform-origin: left center;
        }

        .secondary-bar {
            display: none;
        }

        .bar-inner {
            inset: 0;
            background: var(--_enabled-active-indicator-color);
        }

        :host([variant='linear'][indeterminate]) .primary-bar {
            inset-inline-start: -145.167%;
            animation: linear infinite expressive-primary-translate ${indeterminateLinearDuration};
        }
        :host([variant='linear'][indeterminate]) .primary-bar > .bar-inner {
            animation: linear infinite expressive-primary-scale ${indeterminateLinearDuration};
        }
        :host([variant='linear'][indeterminate]) .secondary-bar {
            inset-inline-start: -54.8889%;
            display: block;
            animation: linear infinite expressive-secondary-translate ${indeterminateLinearDuration};
        }
        :host([variant='linear'][indeterminate]) .secondary-bar > .bar-inner {
            animation: linear infinite expressive-secondary-scale ${indeterminateLinearDuration};
        }

        /* The track stays full-width while indeterminate (Flutter behavior),
           regardless of the current value. */
        :host([variant='linear'][indeterminate]) .track {
            inset-inline-start: 0;
            transition: none;
        }

        /* Only one linear mode renders at a time */
        :host([variant='linear'][indeterminate]) .active-bar,
        :host([variant='linear'][indeterminate]) .stop-indicator {
            display: none;
        }
        :host([variant='linear']:not([indeterminate])) .bar {
            display: none;
        }

        /* RTL: flip the whole indicator instead of mirroring each keyframe */
        :host([variant='linear']:dir(rtl)) {
            transform: scale(-1);
        }

        /* ── Circular: shared SVG ──────────────────────────────────────────── */
        svg {
            transform: rotate(-90deg);
        }

        circle {
            cx: 50%;
            cy: 50%;
            r: calc(50% * (1 - var(--_active-indicator-width) / 100));
            stroke-width: calc(var(--_active-indicator-width) * 1%);
            stroke-dasharray: 100;
            /* MD3E uses round stroke caps everywhere */
            stroke-linecap: round;
            fill: transparent;
        }

        /*
         * --_active-indicator-width is a unitless percentage equal to
         * stroke-width / (size - 2 * padding) * 100, consumed by the circle
         * r / stroke-width calc()s so the stroke stays flush inside the
         * padding box.
         */
        :host([variant='circular'][circular-size='extra-small']) {
            --_active-indicator-width: 16.6667;
        }
        :host([variant='circular'][circular-size='small']) {
            --_active-indicator-width: 10;
        }
        :host([variant='circular'][circular-size='medium']) {
            --_active-indicator-width: 7.1429;
        }
        :host([variant='circular'][circular-size='large']) {
            --_active-indicator-width: 7.5;
        }

        /* ── Circular: determinate ─────────────────────────────────────────── */
        .active-circle {
            stroke: var(--_enabled-active-indicator-color);
            transition: stroke-dashoffset ${determinateDuration} ${determinateEasing};
        }

        /*
         * Track arc: drawn only while determinate, inset from the active arc
         * by the track gap. dasharray/dashoffset are computed in the
         * component from the Compose gap formula.
         */
        .track-circle {
            stroke: var(--_enabled-track-color);
            transition:
                stroke-dashoffset ${determinateDuration} ${determinateEasing},
                stroke-dasharray ${determinateDuration} ${determinateEasing};
        }

        /* ── Circular: indeterminate spinner ───────────────────────────────── */
        .circular-spinner {
            animation: expressive-circular-rotate ${indeterminateCircularDuration}
                linear infinite;
        }

        .spinner-arc {
            stroke: var(--_enabled-active-indicator-color);
            animation: expressive-circular-sweep ${indeterminateCircularDuration}
                ${indeterminateCircularEasing} infinite;
        }

        :host([variant='circular']:not([indeterminate])) .circular-spinner {
            display: none;
        }
        :host([variant='circular'][indeterminate]) .track-circle,
        :host([variant='circular'][indeterminate]) .active-circle {
            display: none;
        }

        /* ── Keyframes: linear indeterminate (from @material/web, 1750ms) ─── */
        @keyframes expressive-primary-scale {
            0% {
                transform: scaleX(0.08);
            }
            36.65% {
                animation-timing-function: cubic-bezier(0.334731, 0.12482, 0.785844, 1);
                transform: scaleX(0.08);
            }
            69.15% {
                animation-timing-function: cubic-bezier(0.06, 0.11, 0.6, 1);
                transform: scaleX(0.661479);
            }
            100% {
                transform: scaleX(0.08);
            }
        }

        @keyframes expressive-secondary-scale {
            0% {
                animation-timing-function: cubic-bezier(0.205028, 0.057051, 0.57661, 0.453971);
                transform: scaleX(0.08);
            }
            19.15% {
                animation-timing-function: cubic-bezier(0.152313, 0.196432, 0.648374, 1.00432);
                transform: scaleX(0.457104);
            }
            44.15% {
                animation-timing-function: cubic-bezier(0.257759, -0.003163, 0.211762, 1.38179);
                transform: scaleX(0.72796);
            }
            100% {
                transform: scaleX(0.08);
            }
        }

        @keyframes expressive-primary-translate {
            0% {
                transform: translateX(0px);
            }
            20% {
                animation-timing-function: cubic-bezier(0.5, 0, 0.701732, 0.495819);
                transform: translateX(0px);
            }
            59.15% {
                animation-timing-function: cubic-bezier(0.302435, 0.381352, 0.55, 0.956352);
                transform: translateX(83.6714%);
            }
            100% {
                transform: translateX(200.611%);
            }
        }

        @keyframes expressive-secondary-translate {
            0% {
                animation-timing-function: cubic-bezier(0.15, 0, 0.515058, 0.409685);
                transform: translateX(0px);
            }
            25% {
                animation-timing-function: cubic-bezier(0.31033, 0.284058, 0.8, 0.733712);
                transform: translateX(37.6519%);
            }
            48.35% {
                animation-timing-function: cubic-bezier(0.4, 0.627035, 0.6, 0.902026);
                transform: translateX(84.3862%);
            }
            100% {
                transform: translateX(160.278%);
            }
        }

        /* ── Keyframes: circular indeterminate (Compose) ───────────────────── */
        /* Rotate 1440deg over the full cycle (1080 global + 360 additional). */
        @keyframes expressive-circular-rotate {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(1440deg);
            }
        }

        /*
         * Sweep the arc between 0.1 (dashoffset 90, 36deg) and 0.87
         * (dashoffset 13, 313deg) of the circle using the standard easing.
         */
        @keyframes expressive-circular-sweep {
            0% {
                stroke-dashoffset: 90;
                animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            }
            50% {
                stroke-dashoffset: 13;
                animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            }
            100% {
                stroke-dashoffset: 90;
            }
        }

        /* ── Reduced motion ────────────────────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
            .progress,
            .bar,
            .bar-inner,
            .circular-spinner,
            .spinner-arc {
                animation: none !important;
                transition: none !important;
            }

            /* Static fallbacks so an indeterminate indicator stays visible */
            :host([variant='linear'][indeterminate]) .primary-bar {
                inset-inline-start: 0;
                width: 40%;
            }
            :host([variant='linear'][indeterminate]) .secondary-bar {
                display: none;
            }
            :host([variant='circular'][indeterminate]) .spinner-arc {
                stroke-dashoffset: 75;
            }
        }

        /* ── Forced colors ─────────────────────────────────────────────────── */
        @media (forced-colors: active) {
            :host {
                outline: 1px solid CanvasText;
            }

            .active-bar,
            .bar-inner {
                background-color: CanvasText;
            }

            .active-circle,
            .spinner-arc {
                stroke: CanvasText;
            }

            .stop-indicator {
                background-color: CanvasText;
            }
        }
    }
`
