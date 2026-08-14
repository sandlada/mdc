/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Duration, Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import type { FocusRingDefinition } from '../../../component-definitions/focus-ring.definition'
import type { IconDefinition } from '../../../component-definitions/icon.definition'
import type { RippleDefinition } from '../../../component-definitions/ripple.definition'
import { OutlinedSegmentedButtonDefinition } from '../../../component-definitions/segmented-button.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { overrideComponentTokens, stringTokens } from '../../../utils/tokens'

const tokenRecord = defineTokenRefsRecord(OutlinedSegmentedButtonDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-segmented-button',
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

/**
 * Length of the MD3 checkmark path (viewBox `0 0 24 24`), used to drive the
 * draw-in / draw-out stroke animation.
 */
const CHECKMARK_LENGTH = 29.7833385

const short1Duration = unsafeCSS(Duration.Short1.ToCSSVariable())
const short3Duration = unsafeCSS(Duration.Short3.ToCSSVariable())
const emphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSVariable())

const ripple = css`
    .container mdc-ripple {
        border-radius: inherit;
        z-index: 0;
        ${stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
            'hovered-color': `var(--_unselected-hover-state-layer-color)`,
            'focused-color': `var(--_unselected-focus-state-layer-color)`,
            'pressed-color': `var(--_unselected-pressed-state-layer-color)`,
            'hovered-opacity': `var(--_hover-state-layer-opacity)`,
            'focused-opacity': `var(--_focus-state-layer-opacity)`,
            'pressed-opacity': `var(--_pressed-state-layer-opacity)`,
        }))};
    }
    .container.selected mdc-ripple {
        ${stringTokens(overrideComponentTokens<keyof typeof RippleDefinition>('--mdc-ripple', {
            'hovered-color': `var(--_selected-hover-state-layer-color)`,
            'focused-color': `var(--_selected-focus-state-layer-color)`,
            'pressed-color': `var(--_selected-pressed-state-layer-color)`,
        }))};
    }
`

const focusRing = css`
    .container mdc-focus-ring {
        z-index: 1;
    }
`

const icon = css`
    .icon {
        align-items: center;
        display: inline-flex;
        justify-content: center;
        ${stringTokens(overrideComponentTokens<keyof typeof IconDefinition>('--mdc-icon', {
            size: `var(--_icon-size)`,
        }))};
    }
`

const shared = css`
    :host {
        display: inline-flex;
        flex: 1;
        min-inline-size: 0;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }

    .container {
        ${tokenString};

        align-items: center;
        background: var(--_unselected-container-color);
        border: none;
        border-radius: inherit;
        box-sizing: border-box;
        color: inherit;
        cursor: pointer;
        display: flex;
        /* Fill the segment host so adjacent buttons touch edge-to-edge and the
           overlapping outlines read as a single group border. */
        flex: 1;
        font: inherit;
        justify-content: center;
        min-inline-size: 0;
        outline: none;
        padding-inline-end: var(--_spacing-trailing);
        padding-inline-start: var(--_spacing-leading);
        position: relative;
        text-transform: inherit;
        z-index: 0;
        -webkit-tap-highlight-color: transparent;
    }
    .container.selected {
        background: var(--_selected-container-color);
    }
    .container.disabled {
        cursor: default;
        pointer-events: none;
    }

    /* Label — label-large. */
    .label {
        font-family: var(--_label-text-font);
        font-size: var(--_label-text-size);
        font-weight: var(--_label-text-weight);
        letter-spacing: var(--_label-text-tracking);
        line-height: var(--_label-text-line-height);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .container.unselected:enabled .label { color: var(--_unselected-label-text-color); }
    .container.unselected:enabled:hover .label { color: var(--_unselected-hover-label-text-color); }
    .container.unselected:enabled:focus-visible .label { color: var(--_unselected-focus-label-text-color); }
    .container.unselected:enabled:active .label { color: var(--_unselected-pressed-label-text-color); }
    .container.selected:enabled .label { color: var(--_selected-label-text-color); }
    .container.selected:enabled:hover .label { color: var(--_selected-hover-label-text-color); }
    .container.selected:enabled:focus-visible .label { color: var(--_selected-focus-label-text-color); }
    .container.selected:enabled:active .label { color: var(--_selected-pressed-label-text-color); }
    .container.disabled .label {
        color: var(--_disabled-label-text-color);
        opacity: var(--_disabled-label-text-opacity);
    }

    /* Leading icon / checkmark */
    .leading,
    .graphic {
        align-items: center;
        display: inline-flex;
        justify-content: flex-start;
    }
    .leading {
        position: relative;
    }
    .graphic {
        overflow: hidden;
        position: relative;
        transition: inline-size ${short3Duration} ${emphasizedEasing};
    }

    .graphic,
    .checkmark,
    .icon,
    .icon ::slotted([slot='icon']) {
        block-size: var(--_icon-size);
        font-size: var(--_icon-size);
        inline-size: var(--_icon-size);
    }

    /* Reserve graphic space only when an icon accompanies a label, or when a
       checkmark is shown. The 8px gutter is not yet an MD3 token
       (b/198759625) — it is hardcoded here to match the reference. */
    .graphic {
        inline-size: 0;
    }
    .container.with-label.with-icon .graphic,
    .container.selected.with-checkmark .graphic {
        inline-size: calc(var(--_icon-size) + 8px);
    }

    /* Icon / checkmark visibility. A selected label segment swaps its icon for
       the checkmark; an icon-only segment keeps its icon and shows the
       checkmark beside it (see the .leading structure in the base class). */
    .icon {
        opacity: 1;
    }
    .container.selected.with-checkmark.with-label .icon {
        opacity: 0;
    }
    .checkmark {
        opacity: 1;
        position: absolute;
    }
    .container.unselected .checkmark,
    .container.without-checkmark .checkmark {
        opacity: 0;
    }

    /* Icon colors */
    .container.unselected:enabled .icon { color: var(--_unselected-icon-color); }
    .container.unselected:enabled:hover .icon { color: var(--_unselected-hover-icon-color); }
    .container.unselected:enabled:focus-visible .icon { color: var(--_unselected-focus-icon-color); }
    .container.unselected:enabled:active .icon { color: var(--_unselected-pressed-icon-color); }
    .container.selected:enabled .icon { color: var(--_selected-icon-color); }
    .container.selected.without-label:enabled .icon { color: var(--_selected-with-icon-icon-color); }
    .container.selected:enabled:hover .icon { color: var(--_selected-hover-icon-color); }
    .container.selected:enabled:focus-visible .icon { color: var(--_selected-focus-icon-color); }
    .container.selected:enabled:active .icon { color: var(--_selected-pressed-icon-color); }
    .container.disabled .icon {
        color: var(--_disabled-icon-color);
        opacity: var(--_disabled-icon-opacity);
    }

    /* Checkmark */
    .checkmark-path {
        stroke: var(--_selected-icon-color);
        stroke-dasharray: ${CHECKMARK_LENGTH};
        stroke-width: 2px;
    }
    .container.selected:enabled:hover .checkmark-path { stroke: var(--_selected-hover-icon-color); }
    .container.selected:enabled:focus-visible .checkmark-path { stroke: var(--_selected-focus-icon-color); }
    .container.selected:enabled:active .checkmark-path { stroke: var(--_selected-pressed-icon-color); }
    .container.disabled .checkmark-path { stroke: var(--_disabled-icon-color); }

    .container.selecting .checkmark-path {
        stroke-dashoffset: ${CHECKMARK_LENGTH};
        animation: checkmark-draw-in ${short3Duration} ${short1Duration} ${emphasizedEasing} forwards;
    }
    .container.selecting.with-label .icon {
        animation: simple-fade-out 75ms linear forwards;
    }
    .container.deselecting .checkmark {
        animation: simple-fade-out ${short1Duration} linear forwards;
    }
    .container.deselecting.with-label .icon {
        opacity: 0;
        animation: simple-fade-in ${short3Duration} ${short1Duration} linear forwards;
    }

    @keyframes checkmark-draw-in {
        from { stroke-dashoffset: ${CHECKMARK_LENGTH}; }
        to { stroke-dashoffset: 0; }
    }
    @keyframes simple-fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    @keyframes simple-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    /* Touch target — extends the 40px hit area up to the 48px minimum. */
    .touch-target {
        height: 48px;
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
    }

    @media (prefers-reduced-motion: reduce) {
        .graphic {
            transition: none;
        }
        .container.selecting .checkmark-path,
        .container.selecting .icon,
        .container.deselecting .checkmark,
        .container.deselecting .icon {
            animation: none;
        }
    }

    @media (forced-colors: active) {
        .container.disabled {
            --_disabled-label-text-opacity: 1;
            --_disabled-icon-opacity: 1;
            --_disabled-outline-opacity: 1;
        }
    }
`

const outline = css`
    .outline {
        border-color: var(--_outline-color);
        border-radius: inherit;
        border-style: solid;
        border-width: var(--_outline-width);
        inset: 0 -0.5px;
        pointer-events: none;
        position: absolute;
    }
    .container.disabled .outline {
        border-color: var(--_disabled-outline-color);
        opacity: var(--_disabled-outline-opacity);
    }

    @media (forced-colors: active) {
        .outline {
            border-color: CanvasText;
        }
    }
`

export const SegmentedButtonStyles = [
    ripple,
    focusRing,
    icon,
    shared,
    outline,
]
