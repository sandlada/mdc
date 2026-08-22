/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { css, unsafeCSS } from 'lit'
import {
    ElevationDefinition,
    ModalNavigationDrawerDefinition,
    NavigationDrawerTabDefinition,
    PermanentNavigationDrawerDefinition,
    StandardNavigationDrawerDefinition,
    type TypographyDefinition,
} from '../../definitions'
import { overrideComponentTokens, stringTokens } from '../../utils'

const modalRecord = defineTokenRefsRecord(ModalNavigationDrawerDefinition, {
    expandShapes: true,
    prefix: '--mdc-navigation-drawer',
    useBaseFallback: true,
})
const modalString = unsafeCSS(defineVars(modalRecord, true).join(''))

const standardRecord = defineTokenRefsRecord(StandardNavigationDrawerDefinition, {
    expandShapes: true,
    prefix: '--mdc-navigation-drawer',
    useBaseFallback: true,
})
const standardString = unsafeCSS(defineVars(standardRecord, true).join(''))

const permanentRecord = defineTokenRefsRecord(PermanentNavigationDrawerDefinition, {
    expandShapes: true,
    prefix: '--mdc-navigation-drawer',
    useBaseFallback: true,
})
const permanentString = unsafeCSS(defineVars(permanentRecord, true).join(''))

const overrideTab = stringTokens(overrideComponentTokens<keyof typeof NavigationDrawerTabDefinition>(
    '--mdc-navigation-tab',
    {
        'container-width': 'calc(var(--_enabled-container-width) - var(--_content-container-inline-leading-padding-space) - var(--_content-container-inline-trailing-padding-space))',
    },
))

const overrideElevation = stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>(
    '--mdc-elevation',
    {
        'enabled-level': 'var(--_enabled-container-elevation)',
        'enabled-shadow-color': 'var(--_container-shadow-color)',
    },
))

const overrideTypography = stringTokens(overrideComponentTokens<keyof typeof TypographyDefinition>(
    '--mdc-typography',
    {
        'title-small-font': 'var(--_enabled-headline-font)',
        'title-small-size': 'var(--_enabled-headline-size)',
        'title-small-line-height': 'var(--_enabled-headline-line-height)',
        'title-small-weight': 'var(--_enabled-headline-weight)',
        'title-small-tracking': 'var(--_enabled-headline-tracking)',
    },
))

export const NavigationDrawerStyles = [
    // Token injection
    css`
        :host {
            ${overrideTab};
            ${overrideElevation};
            ${overrideTypography};
            ${modalString};
        }
        :host([variant="modal"]) {
            ${modalString};
        }
        :host([variant="standard"]) {
            ${standardString};
        }
        :host([variant="permanent"]) {
            ${permanentString};
        }
    `,
    // Base structural layout
    css`
        :host {
            display: inline-flex;
            position: relative;
            box-sizing: border-box;
            vertical-align: top;
            z-index: 0;
        }

        /* ── Modal Variant ────────────────────────────────────────── */
        :host([variant="modal"]),
        :host(:not([variant])) {
            position: fixed;
            inset: 0;
            z-index: 20;
            pointer-events: none;
            width: 100vw;
            height: 100vh;
            height: 100dvh;
        }
        :host([variant="modal"]:not([open])),
        :host(:not([variant]):not([open])) {
            display: none;
        }

        dialog {
            all: unset;
            color-scheme: inherit;
            display: flex;
            flex-direction: column;
            position: relative;
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            border: none;
            outline: none;
            height: 100%;
            width: inherit;
            overflow: visible;
            z-index: 1;
            border-radius: 0;
        }
        dialog::backdrop,
        ::backdrop {
            background: none;
            display: none;
        }

        :host([variant="modal"]) dialog,
        :host(:not([variant])) dialog {
            position: fixed;
            inset: 0;
            height: 100vh;
            height: 100dvh;
            width: 100vw;
            max-width: 100vw;
            pointer-events: none;
            display: block !important;
            overflow: hidden;
            background: transparent;
            border-radius: 0;
        }

        .scrim {
            position: absolute;
            inset: 0;
            background: var(--_scrim-color);
            opacity: 0;
            pointer-events: none;
            z-index: 0;
            -webkit-tap-highlight-color: transparent;
            border-radius: 0;
        }
        :host([variant="modal"][open]) dialog .scrim,
        :host(:not([variant])[open]) dialog .scrim,
        :host([open]) dialog.modal .scrim {
            opacity: var(--_scrim-opacity);
            pointer-events: auto;
        }
        dialog.standard .scrim,
        dialog.permanent .scrim,
        :host([variant="standard"]) .scrim,
        :host([variant="permanent"]) .scrim {
            display: none !important;
        }

        /* ── Standard Variant ─────────────────────────────────────── */
        :host([variant="standard"]) {
            display: flex;
            flex-direction: column;
            height: 100%;
            position: relative;
            width: var(--_enabled-container-width);
            transition: width 0.3s ease, margin 0.3s ease;
        }
        :host([variant="standard"]:not([open])) {
            width: 0;
            overflow: hidden;
        }

        /* ── Permanent Variant ────────────────────────────────────── */
        :host([variant="permanent"]) {
            display: flex;
            flex-direction: column;
            height: 100%;
            position: relative;
            width: var(--_enabled-container-width);
            border-inline-end: 1px solid var(--_enabled-divider-color);
        }

        /* ── Suppress Transitions ─────────────────────────────────── */
        :host([quick]) {
            transition: none !important;
        }

        /* ── Container Surface ────────────────────────────────────── */
        .container {
            display: flex;
            flex-direction: column;
            width: var(--_enabled-container-width);
            max-width: 100%;
            height: 100%;
            flex-grow: 1;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            pointer-events: auto;
            touch-action: pan-y;
        }

        :host([variant="modal"]) .container,
        :host(:not([variant])) .container {
            position: absolute;
            top: 0;
            bottom: 0;
            height: 100%;
            z-index: 1;
            pointer-events: auto;
        }
        :host([variant="modal"][drawer-edge="start"]) .container,
        :host([variant="modal"]:not([drawer-edge])) .container,
        :host(:not([variant])[drawer-edge="start"]) .container,
        :host(:not([variant]):not([drawer-edge])) .container {
            inset-inline-start: 0;
            inset-inline-end: auto;
        }
        :host([variant="modal"][drawer-edge="end"]) .container,
        :host(:not([variant])[drawer-edge="end"]) .container {
            inset-inline-end: 0;
            inset-inline-start: auto;
        }

        :host([drawer-edge="start"]) .container,
        :host(:not([drawer-edge])) .container {
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
        }
        :host([drawer-edge="end"]) .container {
            border-start-start-radius: var(--_enabled-container-shape-start-end);
            border-start-end-radius: var(--_enabled-container-shape-start-start);
            border-end-end-radius: var(--_enabled-container-shape-end-start);
            border-end-start-radius: var(--_enabled-container-shape-end-end);
        }
        :host([dragged]) .container {
            border-start-start-radius: var(--_dragged-container-shape-start-start);
            border-start-end-radius: var(--_dragged-container-shape-start-end);
            border-end-end-radius: var(--_dragged-container-shape-end-end);
            border-end-start-radius: var(--_dragged-container-shape-end-start);
        }

        .background {
            position: absolute;
            inset: 0;
            z-index: -1;
            background: var(--_enabled-container-color);
            border-radius: inherit;
            pointer-events: none;
        }

        /* ── Header Section ───────────────────────────────────────── */
        .header {
            display: none;
            padding-inline-start: var(--_header-container-inline-leading-padding-space);
            padding-inline-end: var(--_header-container-inline-trailing-padding-space);
            padding-block-start: var(--_header-container-block-leading-padding-space);
            padding-block-end: var(--_header-container-block-trailing-padding-space);
            flex-shrink: 0;
            box-sizing: border-box;
        }
        dialog.has-header .header {
            display: flex;
            flex-direction: column;
        }

        /* ── Headline Section ─────────────────────────────────────── */
        .headline-section {
            display: none;
            padding-inline-start: var(--_headline-container-inline-leading-padding-space);
            padding-inline-end: var(--_headline-container-inline-trailing-padding-space);
            padding-block-start: var(--_headline-container-block-leading-padding-space);
            padding-block-end: var(--_headline-container-block-trailing-padding-space);
            flex-shrink: 0;
            box-sizing: border-box;
            color: var(--_enabled-headline-color);
            font-family: var(--_enabled-headline-font);
            font-size: var(--_enabled-headline-size);
            font-weight: var(--_enabled-headline-weight);
            line-height: var(--_enabled-headline-line-height);
            letter-spacing: var(--_enabled-headline-tracking);
        }
        dialog.has-headline .headline-section {
            display: flex;
            align-items: center;
        }
        .headline-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* ── Scroller & Destinations ──────────────────────────────── */
        .scroller-section {
            position: relative;
            flex: 1;
            min-height: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .scroller {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            height: 100%;
            display: flex;
            flex-direction: column;
            overscroll-behavior: contain;
        }
        .destination {
            display: flex;
            flex-direction: column;
            gap: var(--_content-item-gap);
            padding-inline-start: var(--_content-container-inline-leading-padding-space);
            padding-inline-end: var(--_content-container-inline-trailing-padding-space);
            padding-block-start: var(--_content-container-block-leading-padding-space);
            padding-block-end: var(--_content-container-block-trailing-padding-space);
            position: relative;
            min-height: min-content;
            box-sizing: border-box;
        }

        ::slotted(mdc-divider),
        ::slotted(hr) {
            margin-block-start: 16px;
            margin-block-end: 16px;
            margin-inline-start: 16px;
            margin-inline-end: 16px;
            display: block;
        }

        ::slotted([role="heading"]),
        ::slotted(h1),
        ::slotted(h2),
        ::slotted(h3),
        ::slotted(h4),
        ::slotted(h5),
        ::slotted(h6),
        ::slotted(.section-title),
        ::slotted(.section-header),
        ::slotted(.subheader) {
            padding-inline-start: 16px;
            padding-inline-end: 16px;
            margin-block-start: 16px;
            margin-block-end: 12px;
            font-family: var(--_enabled-headline-font);
            font-size: var(--_enabled-headline-size);
            font-weight: var(--_enabled-headline-weight);
            line-height: var(--_enabled-headline-line-height);
            letter-spacing: var(--_enabled-headline-tracking);
            color: var(--_enabled-headline-color);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            box-sizing: border-box;
        }

        /* ── Footer Section ───────────────────────────────────────── */
        .footer {
            display: none;
            padding-inline-start: var(--_footer-container-inline-leading-padding-space);
            padding-inline-end: var(--_footer-container-inline-trailing-padding-space);
            padding-block-start: var(--_footer-container-block-leading-padding-space);
            padding-block-end: var(--_footer-container-block-trailing-padding-space);
            flex-shrink: 0;
            box-sizing: border-box;
        }
        dialog.has-footer .footer {
            display: flex;
            flex-direction: column;
        }

        /* ── Dividers & Anchors ───────────────────────────────────── */
        mdc-divider {
            position: absolute;
            left: 0;
            right: 0;
            height: 1px;
            opacity: 0;
            transition-property: opacity, background;
            transition-duration: 150ms;
            z-index: 1;
        }
        mdc-divider.top {
            top: 0;
        }
        mdc-divider.bottom {
            bottom: 0;
        }
        .show-top-divider mdc-divider.top,
        .show-bottom-divider mdc-divider.bottom {
            opacity: 1;
        }

        .anchor {
            position: absolute;
            width: 1px;
            height: 1px;
            pointer-events: none;
            opacity: 0;
        }
        .top.anchor {
            top: 0;
        }
        .bottom.anchor {
            bottom: 0;
        }
    `,
]
