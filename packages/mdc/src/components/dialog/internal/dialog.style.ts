/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { overrideTokens, stringifyTokens } from '../../../utils/style'
import type { DividerDefinition } from '../../divider/divider.definition'
import type { ElevationDefinition } from '../../elevation/elevation.definition'
import { BasicDialogDefinition, FullscreenDialogDefinition } from '../dialog.definition'

const BasicDialogTokenString = stringifyTokens('--mdc-basic-dialog')(BasicDialogDefinition)
const FullscreenDialogTokenString = stringifyTokens('--mdc-fullscreen-dialog')(FullscreenDialogDefinition)

const EmphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSValue())
const EmphasizedAccelerateEasing = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())

const BasicElevationBridge = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'enabled-level'       : `var(--_enabled-container-elevation)`,
    'enabled-shadow-color': `var(--_container-shadow-color)`,
})()

const DividerBridge = overrideTokens<typeof DividerDefinition>('--mdc-divider')({
    'enabled-color': `var(--_divider-color)`,
})()

const FullscreenHeaderElevationBridge = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'enabled-level'       : `var(--_enabled-header-container-elevation)`,
    'enabled-shadow-color': `var(--_container-shadow-color)`,
})()

const FullscreenHeaderScrolledElevationBridge = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'enabled-level'       : `var(--_enabled-header-on-scroll-container-elevation)`,
    'enabled-shadow-color': `var(--_container-shadow-color)`,
})()

export const BasicDialogStyle = css`
    @layer mdc.basic-dialog.variable { :host { ${BasicDialogTokenString}; } }
    @layer mdc.basic-dialog.base {

    }
    :host {
        display: contents;
    }

    dialog {
        background: transparent;
        border: none;
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-end-radius: var(--_container-shape-end-end);
        border-end-start-radius: var(--_container-shape-end-start);
        flex-direction: column;
        height: fit-content;
        margin: auto;
        max-height: min(560px, calc(100% - 48px));
        max-width: min(var(--_container-max-width), calc(100% - 48px));
        min-height: 140px;
        min-width: var(--_container-min-width);
        outline: none;
        overflow: visible;
        padding: 0;
        width: fit-content;
        /* Closed state values: the close transition animates towards these. */
        transform: translateY(-50px);
        transition:
            display 150ms allow-discrete,
            overlay 150ms allow-discrete,
            transform 150ms ${EmphasizedAccelerateEasing};
    }
    dialog[open] {
        display: flex;
        transform: translateY(0);
        transition:
            display 500ms allow-discrete,
            overlay 500ms allow-discrete,
            transform 500ms ${EmphasizedEasing};
    }
    ::backdrop {
        background: none;
    }

    /*
     * The scrim keeps its open state tied to the native dialog "open"
     * attribute through the sibling ":has()" selector instead of
     * ":host([open])", and stays continuously rendered via "visibility"
     * instead of "display: none". Chrome stops creating enter transitions
     * that derive from a host attribute (and re-entry transitions of
     * shadow siblings) once a full modal open/close cycle has completed;
     * sibling-derived state and permanent rendering keep animating on
     * every cycle.
     */
    .scrim {
        background: var(--_scrim-color);
        visibility: hidden;
        inset: 0;
        opacity: 0;
        pointer-events: none;
        position: fixed;
        transition:
            visibility 150ms,
            opacity 150ms linear;
        z-index: 1;
    }
    .scrim:has(+ dialog[open]) {
        visibility: visible;
        opacity: var(--_scrim-opacity);
        transition:
            visibility 500ms,
            opacity 500ms linear;
    }

    h2 {
        all: unset;
        align-self: stretch;
    }

    /* Closed-state rules compiled under "dialog": Chrome only honors the
    starting styles of newly rendered shadow descendants when their matching
    base rules are scoped to the dialog element; bare class selectors snap
    straight to the open values. */
    dialog .headline {
        align-items: center;
        color: var(--_enabled-headline-label-color);
        display: flex;
        flex-direction: column;
        font-family: var(--_headline-label-font);
        font-size: var(--_headline-label-size);
        line-height: var(--_headline-label-leading);
        font-weight: var(--_headline-label-weight);
        letter-spacing: var(--_headline-label-tracking);
        opacity: 0;
        position: relative;
        transition: opacity 100ms linear;
    }
    dialog[open] .headline {
        opacity: 1;
        transition: opacity 250ms linear;
    }

    slot[name='headline']::slotted(*) {
        align-items: center;
        align-self: stretch;
        box-sizing: border-box;
        display: flex;
        gap: 8px;
        padding: 24px 24px 0;
    }

    .icon {
        display: flex;
    }

    slot[name='icon']::slotted(*) {
        fill: currentColor;
        margin-top: 24px;
        color: var(--_enabled-icon-color);
        font-size: var(--_icon-size);
        height: var(--_icon-size);
        width: var(--_icon-size);
    }

    .has-icon slot[name='headline']::slotted(*) {
        justify-content: center;
        text-align: center;
        padding-top: 16px;
    }

    .scrollable slot[name='headline']::slotted(*) {
        padding-bottom: 16px;
    }

    .container {
        border-radius: inherit;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        isolation: isolate;
        overflow: hidden;
        position: relative;
        transform-origin: top;
    }

    .container > mdc-elevation {
        ${BasicElevationBridge};
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        z-index: -1;
        opacity: 0;
        transition: opacity 150ms linear;
    }
    dialog[open] .container > mdc-elevation {
        opacity: 1;
        transition: opacity 250ms linear;
    }

    dialog .container::before {
        background: var(--_enabled-container-color);
        border-radius: inherit;
        content: '';
        inset: 0;
        position: absolute;
        /* Closed state values: shrink to 35% then fade out with a delay. */
        height: 35%;
        opacity: 0;
        transition:
            height 150ms ${EmphasizedAccelerateEasing},
            opacity 50ms linear 100ms;
    }
    dialog[open] .container::before {
        height: 100%;
        opacity: 1;
        transition:
            height 500ms ${EmphasizedEasing},
            opacity 50ms linear;
    }

    .scroller {
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow: hidden;
        z-index: 1;
    }

    .scrollable .scroller {
        overflow-y: auto;
    }

    dialog .content {
        color: var(--_enabled-supporting-text-label-color);
        font-family: var(--_supporting-text-label-font);
        font-size: var(--_supporting-text-label-size);
        line-height: var(--_supporting-text-label-leading);
        font-weight: var(--_supporting-text-label-weight);
        letter-spacing: var(--_supporting-text-label-tracking);
        flex: 1;
        height: min-content;
        opacity: 0;
        position: relative;
        transition: opacity 100ms linear;
    }
    dialog[open] .content {
        opacity: 1;
        transition: opacity 250ms linear;
    }

    slot[name='content']::slotted(*) {
        display: block;
        box-sizing: border-box;
        padding: 24px;
    }

    .has-headline slot[name='content']::slotted(*),
    .has-icon slot[name='content']::slotted(*) {
        padding-top: 16px;
    }

    .scrollable.has-headline slot[name='content']::slotted(*) {
        padding-top: 8px;
    }

    .has-actions slot[name='content']::slotted(*) {
        padding-bottom: 8px;
    }

    .anchor {
        position: absolute;
    }

    .top.anchor {
        top: 0;
    }

    .bottom.anchor {
        bottom: 0;
    }

    dialog .actions {
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        column-gap: var(--_actions-gap);
        row-gap: var(--_actions-row-gap);
        opacity: 0;
        padding: 16px 24px 24px;
        justify-content: flex-end;
        transition: opacity 100ms linear;
    }
    dialog[open] .actions {
        opacity: 1;
        transition: opacity 300ms linear;
    }
    dialog:not(.has-actions) .actions {
        display: none;
    }

    slot[name='actions']::slotted(*) {
        box-sizing: border-box;
    }

    mdc-divider {
        ${DividerBridge};
        display: none;
        position: absolute;
        inset-inline: 0;
        width: 100%;
    }

    .has-headline.show-top-divider .headline mdc-divider,
    .has-actions.show-bottom-divider .actions mdc-divider {
        display: flex;
    }

    .headline mdc-divider {
        bottom: 0;
    }

    .actions mdc-divider {
        top: 0;
    }

    .first-focus-trap,
    .last-focus-trap {
        position: absolute;
        width: 0;
        height: 0;
        overflow: hidden;
    }

    /* "quick" skips all transitions. These rules must stay after the
    "dialog[open]" / ".scrim:has(+ dialog[open])" blocks to win the specificity tie. */
    dialog.quick,
    dialog.quick .container::before,
    dialog.quick .container > mdc-elevation,
    dialog.quick .headline,
    dialog.quick .content,
    dialog.quick .actions,
    .scrim.quick {
        transition: none;
    }
    .scrim.quick:has(+ dialog[open]) {
        transition: none;
    }

    /* Starting styles for the open transition. Declared after the main rules:
    starting-style declarations take part in the normal cascade, so a block
    placed earlier would lose to the matching open-state rules and the
    before-change value would equal the open value, killing the transition. */
    @starting-style {
        dialog[open] {
            transform: translateY(-50px);
        }
        dialog[open] .container::before {
            height: 35%;
            opacity: 0;
        }
        dialog[open] .container > mdc-elevation {
            opacity: 0;
        }
        dialog[open] .headline {
            opacity: 0;
        }
        dialog[open] .content {
            opacity: 0;
        }
        dialog[open] .actions {
            opacity: 0;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        dialog,
        dialog[open],
        dialog .headline,
        dialog[open] .headline,
        dialog .content,
        dialog[open] .content,
        dialog .actions,
        dialog[open] .actions,
        dialog .container::before,
        dialog[open] .container::before,
        dialog .container > mdc-elevation,
        dialog[open] .container > mdc-elevation,
        .scrim,
        .scrim:has(+ dialog[open]) {
            transition: none;
        }
    }

    @media (prefers-reduced-transparency: reduce) {
        .scrim:has(+ dialog[open]) {
            opacity: 1;
        }
    }

    @media (prefers-contrast: more) {
        dialog {
            outline: 2px solid currentColor;
        }
    }

    @media (prefers-contrast: less) {
        dialog {
            outline: 1px solid color-mix(in srgb, currentColor 20%, transparent);
        }
    }

    @media (forced-colors: active) {
        dialog {
            outline: 2px solid CanvasText;
        }
        mdc-divider {
            --mdc-divider-enabled-color: CanvasText;
        }
    }
`

export const FullscreenDialogStyle = css`
    @layer mdc.fullscreen-dialog.variable { :host { ${FullscreenDialogTokenString}; } }
    @layer mdc.fullscreen-dialog.base {

    }
    :host {
        display: contents;
    }

    dialog {
        background: transparent;
        border: none;
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-end-radius: var(--_container-shape-end-end);
        border-end-start-radius: var(--_container-shape-end-start);
        flex-direction: column;
        height: 100dvh;
        inset: 0;
        margin: 0;
        max-height: none;
        max-width: none;
        outline: none;
        overflow: hidden;
        padding: 0;
        width: 100vw;
        opacity: 0;
        transform: translateY(48px);
        transition:
            display 150ms allow-discrete,
            overlay 150ms allow-discrete,
            opacity 150ms linear,
            transform 150ms ${EmphasizedAccelerateEasing};
    }
    dialog[open] {
        display: flex;
        opacity: 1;
        transform: translateY(0);
        transition:
            display 500ms allow-discrete,
            overlay 500ms allow-discrete,
            opacity 250ms linear,
            transform 500ms ${EmphasizedEasing};
    }
    ::backdrop {
        background: none;
    }

    .scrim {
        display: none;
    }

    .container {
        background: var(--_enabled-container-color);
        border-radius: inherit;
        display: flex;
        flex-direction: column;
        flex: 1;
        height: 100%;
        isolation: isolate;
        overflow: hidden;
        position: relative;
    }

    .header {
        align-items: center;
        background: var(--_enabled-header-container-color);
        box-sizing: border-box;
        display: flex;
        flex-shrink: 0;
        gap: 8px;
        min-height: var(--_header-container-height);
        padding: 8px 16px 8px 8px;
        position: relative;
        z-index: 1;
        transition: background-color 200ms linear;
    }

    .show-top-divider .header {
        background: var(--_enabled-on-scroll-container-color);
    }

    .header > mdc-elevation {
        ${FullscreenHeaderElevationBridge};
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: -1;
    }

    .show-top-divider .header > mdc-elevation {
        ${FullscreenHeaderScrolledElevationBridge};
    }

    .close-button {
        display: flex;
        flex-shrink: 0;
        color: var(--_enabled-header-icon-color);
    }

    .close-button mdc-icon-button {
        color: var(--_enabled-header-icon-color);
    }

    h2 {
        all: unset;
        flex: 1;
        min-width: 0;
    }

    .headline {
        color: var(--_enabled-headline-label-color);
        font-family: var(--_headline-label-font);
        font-size: var(--_headline-label-size);
        line-height: var(--_headline-label-leading);
        font-weight: var(--_headline-label-weight);
        letter-spacing: var(--_headline-label-tracking);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .actions {
        align-items: center;
        display: flex;
        flex-shrink: 0;
        gap: 8px;
    }

    dialog:not(.has-actions) .actions {
        display: none;
    }

    .scroller {
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow-y: auto;
        position: relative;
        z-index: 0;
    }

    .content {
        color: var(--_enabled-supporting-text-label-color);
        font-family: var(--_supporting-text-label-font);
        font-size: var(--_supporting-text-label-size);
        line-height: var(--_supporting-text-label-leading);
        font-weight: var(--_supporting-text-label-weight);
        letter-spacing: var(--_supporting-text-label-tracking);
        flex: 1;
        position: relative;
    }

    slot[name='content']::slotted(*) {
        box-sizing: border-box;
        display: block;
        padding: 16px 24px 24px;
    }

    .anchor {
        position: absolute;
    }

    .top.anchor {
        top: 0;
    }

    .bottom.anchor {
        bottom: 0;
    }

    mdc-divider {
        ${DividerBridge};
        bottom: 0;
        display: none;
        inset-inline: 0;
        position: absolute;
        width: 100%;
    }

    .show-top-divider .header mdc-divider {
        display: flex;
    }

    .first-focus-trap,
    .last-focus-trap {
        position: absolute;
        width: 0;
        height: 0;
        overflow: hidden;
    }

    dialog.quick {
        transition: none;
    }

    @starting-style {
        dialog[open] {
            opacity: 0;
            transform: translateY(48px);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        dialog,
        dialog[open],
        .header {
            transition: none;
        }
    }

    @media (prefers-contrast: more) {
        .header {
            outline: 2px solid currentColor;
        }
    }

    @media (prefers-contrast: less) {
        .header {
            outline: 1px solid color-mix(in srgb, currentColor 20%, transparent);
        }
    }

    @media (forced-colors: active) {
        dialog {
            outline: 2px solid CanvasText;
        }
        mdc-divider {
            --mdc-divider-enabled-color: CanvasText;
        }
    }
`
