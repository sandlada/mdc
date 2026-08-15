/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { ProgressIndicatorDefinition } from '../../component-definitions/progress-indicator.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(ProgressIndicatorDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-progress-indicator'
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

// ── Animation constants (match @material/web / MDC) ─────────────────────────
const determinateDuration = unsafeCSS(`250ms`)
const determinateEasing = unsafeCSS(`cubic-bezier(0.4, 0, 0.6, 1)`)
const indeterminateDuration = unsafeCSS(`2s`)
const circularDeterminateDuration = unsafeCSS(`500ms`)
const circularDeterminateEasing = unsafeCSS(`cubic-bezier(0, 0, 0.2, 1)`)

// Circular indeterminate: three composed animations (from @material/web).
const arcExpandDuration = unsafeCSS(`1333ms`)
const arcCycleDuration = unsafeCSS(`5332ms`)     // 4 × 1333ms
const linearRotateDuration = unsafeCSS(`1568ms`) // 1333ms × 360 / 306
const indeterminateEasing = unsafeCSS(`cubic-bezier(0.4, 0, 0.2, 1)`)

export const ProgressIndicatorStyles = css`
    @layer mdc.progress-indicator.variable {
        :host { ${tokenString}; }
    }

    @layer mdc.progress-indicator.base {
        /* ── Host ──────────────────────────────────────────────────────────── */
        :host([variant='linear']) {
            border-start-start-radius: var(--_track-shape-start-start);
            border-start-end-radius: var(--_track-shape-start-end);
            border-end-start-radius: var(--_track-shape-end-start);
            border-end-end-radius: var(--_track-shape-end-end);
            display: flex;
            position: relative;
            /* matches the meter element — just gives a default width */
            min-width: 80px;
            height: var(--_linear-track-thickness);
            /* Skip off-screen rendering. content-visibility pauses animations
               only while the element is skipped and resumes them on scroll,
               which is fine for these tiny indicators. */
            content-visibility: auto;
            contain: strict;
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
        .inactive-track,
        .bar,
        .bar-inner,
        .spinner,
        .left,
        .right,
        .circle,
        svg,
        .track,
        .active-track {
            position: absolute;
            inset: 0;
        }

        :host([variant='linear']) .progress {
            /* Animations need to be in LTR. We support RTL by flipping the
               whole indicator with scale(-1). */
            direction: ltr;
            border-radius: inherit;
            overflow: hidden;
            display: flex;
            align-items: center;
        }

        :host([variant='circular']) .progress {
            flex: 1;
            align-self: stretch;
            margin: 4px;
        }

        /* ── Linear: bars ──────────────────────────────────────────────────── */
        .bar {
            animation: none;
            /* position is offset for indeterminate animation, so lock the
               inline size here */
            width: 100%;
            height: var(--_linear-active-indicator-thickness);
            transform-origin: left center;
            transition: transform ${determinateDuration} ${determinateEasing};
        }

        .secondary-bar {
            display: none;
        }

        .bar-inner {
            inset: 0;
            animation: none;
            background: var(--_enabled-active-indicator-color);
        }

        .inactive-track {
            background: var(--_enabled-track-color);
            transition: transform ${determinateDuration} ${determinateEasing};
            transform-origin: left center;
        }

        :host([variant='linear'][indeterminate]) .bar {
            transition: none;
        }
        :host([variant='linear'][indeterminate]) .primary-bar {
            inset-inline-start: -145.167%;
            animation: linear infinite primary-indeterminate-translate ${indeterminateDuration};
        }
        :host([variant='linear'][indeterminate]) .primary-bar > .bar-inner {
            animation: linear infinite primary-indeterminate-scale ${indeterminateDuration};
        }
        :host([variant='linear'][indeterminate]) .secondary-bar {
            inset-inline-start: -54.8889%;
            display: block;
            animation: linear infinite secondary-indeterminate-translate ${indeterminateDuration};
        }
        :host([variant='linear'][indeterminate]) .secondary-bar > .bar-inner {
            animation: linear infinite secondary-indeterminate-scale ${indeterminateDuration};
        }

        /* RTL: flip the whole indicator instead of mirroring each keyframe */
        :host([variant='linear']:dir(rtl)) {
            transform: scale(-1);
        }

        /* ── Circular: determinate SVG ─────────────────────────────────────── */
        svg {
            transform: rotate(-90deg);
        }

        circle {
            cx: 50%;
            cy: 50%;
            /* scale the radius so the stroke (whose outer edge lands on the
               50% box edge via --_active-indicator-width) stays fully inside */
            r: calc(50% * (1 - var(--_active-indicator-width) / 100));
            stroke-width: calc(var(--_active-indicator-width) * 1%);
            /* pathLength=100 normalizes dash values */
            stroke-dasharray: 100;
            fill: transparent;
        }

        .track {
            /* MD3 circular has no track */
            stroke: transparent;
        }

        .active-track {
            transition: stroke-dashoffset ${circularDeterminateDuration} ${circularDeterminateEasing};
            stroke: var(--_enabled-active-indicator-color);
        }

        /*
         * --_active-indicator-width is a unitless percentage equal to
         * stroke-width / (size - 2 * padding) * 100. It is consumed by the
         * circle r / stroke-width calc()s so that every size renders the
         * stroke flush inside the padding box.
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

        /* ── Circular: indeterminate spinner ───────────────────────────────── */
        /* The rotate must be scoped to the circular variant: the linear
           indicator's .progress also carries the 'indeterminate' class, and
           an ungated rule would spin the whole linear bar (576x4 rotated
           ~90deg renders as a 4x576 sliver). */
        :host([variant='circular']) .progress.indeterminate {
            animation: linear infinite linear-rotate ${linearRotateDuration};
        }

        .spinner {
            animation: infinite both rotate-arc ${arcCycleDuration} ${indeterminateEasing};
        }

        .left {
            overflow: hidden;
            inset: 0 50% 0 0;
        }

        .right {
            overflow: hidden;
            inset: 0 0 0 50%;
        }

        .circle {
            box-sizing: border-box;
            border-radius: 50%;
            border-style: solid;
            border-color: var(--_enabled-active-indicator-color)
                var(--_enabled-active-indicator-color) transparent transparent;
            animation: expand-arc ${arcExpandDuration} ${indeterminateEasing}
                infinite both;
        }

        :host([variant='circular'][circular-size='extra-small']) .circle {
            border-width: var(--_circular-extra-small-stroke-width);
        }
        :host([variant='circular'][circular-size='small']) .circle {
            border-width: var(--_circular-small-stroke-width);
        }
        :host([variant='circular'][circular-size='medium']) .circle {
            border-width: var(--_circular-medium-stroke-width);
        }
        :host([variant='circular'][circular-size='large']) .circle {
            border-width: var(--_circular-large-stroke-width);
        }

        .left .circle {
            rotate: 135deg;
            inset: 0 -100% 0 0;
        }
        .right .circle {
            rotate: 100deg;
            inset: 0 0 0 -100%;
            animation-delay: calc(-0.5 * ${arcExpandDuration});
        }

        /* Show only the active rendering mode */
        :host([variant='circular']:not([indeterminate])) .spinner {
            display: none;
        }
        :host([variant='circular'][indeterminate]) svg {
            display: none;
        }

        /* ── Linear indeterminate keyframes (from @material/web) ──────────── */
        @keyframes primary-indeterminate-scale {
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

        @keyframes secondary-indeterminate-scale {
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

        @keyframes primary-indeterminate-translate {
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

        @keyframes secondary-indeterminate-translate {
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

        /* ── Circular indeterminate keyframes (from @material/web) ────────── */
        /* The arc expands/contracts between 265deg and 130deg. */
        @keyframes expand-arc {
            0% {
                transform: rotate(265deg);
            }
            50% {
                transform: rotate(130deg);
            }
            100% {
                transform: rotate(265deg);
            }
        }

        /* The arc travels around the circle: 3/4 arc × 4 rotations = 1080deg. */
        @keyframes rotate-arc {
            12.5% {
                transform: rotate(135deg);
            }
            25% {
                transform: rotate(270deg);
            }
            37.5% {
                transform: rotate(405deg);
            }
            50% {
                transform: rotate(540deg);
            }
            62.5% {
                transform: rotate(675deg);
            }
            75% {
                transform: rotate(810deg);
            }
            87.5% {
                transform: rotate(945deg);
            }
            100% {
                transform: rotate(1080deg);
            }
        }

        /* The traveling arc is spun linearly for the spinner effect. */
        @keyframes linear-rotate {
            to {
                transform: rotate(360deg);
            }
        }

        /* ── Forced colors ─────────────────────────────────────────────────── */
        @media (forced-colors: active) {
            :host {
                outline: 1px solid CanvasText;
            }

            .bar-inner {
                background-color: CanvasText;
            }

            .active-track {
                stroke: CanvasText;
            }

            .circle {
                border-color: CanvasText CanvasText Canvas Canvas;
            }
        }
    }
`
