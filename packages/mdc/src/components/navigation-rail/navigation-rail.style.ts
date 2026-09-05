/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { css, unsafeCSS } from 'lit'
import {
    NavigationRailCollapsedDefinition,
    NavigationRailCollapsedXRDefinition,
    NavigationRailExpandedDefinition,
    NavigationRailVerticalTabDefinition,
} from '../../definitions'
import { overrideComponentTokens, stringTokens } from '../../utils'

const expanded = defineTokenRefsRecord(NavigationRailExpandedDefinition, {
    expandShapes: true,
    prefix: '--mdc-navigation-rail',
    useBaseFallback: true,
})
const expandedString = unsafeCSS(defineVars(expanded, true).join(''))

const collapsed = defineTokenRefsRecord(NavigationRailCollapsedDefinition, {
    expandShapes: true,
    prefix: '--mdc-navigation-rail',
    useBaseFallback: true,
})
const collapsedString = unsafeCSS(defineVars(collapsed, true).join(''))

const collapsedXR = defineTokenRefsRecord(NavigationRailCollapsedXRDefinition, {
    expandShapes: true,
    prefix: '--mdc-navigation-rail',
    useBaseFallback: true,
})
const collapsedXRString = unsafeCSS(defineVars(collapsedXR, true).join(''))

const overrideTab = {
    collapsed: stringTokens(overrideComponentTokens<keyof typeof NavigationRailVerticalTabDefinition>('--mdc-navigation-tab', {
        'container-width': `var(--_standard-container-width)`,
    })),
    expandedStandard: stringTokens(overrideComponentTokens<keyof typeof NavigationRailVerticalTabDefinition>('--mdc-navigation-tab', {
        'container-width': `100%`,
    })),
    expandedModal: stringTokens(overrideComponentTokens<keyof typeof NavigationRailVerticalTabDefinition>('--mdc-navigation-tab', {
        'container-width': `100%`,
    })),
    collapsedXR: stringTokens(overrideComponentTokens<keyof typeof NavigationRailVerticalTabDefinition>('--mdc-navigation-tab', {
        'container-width': `var(--_standard-container-width)`,
    })),
}

export const NavigationRailStyles = [
    // Token injection layers
    css`
        :host {
            ${collapsedString};
        }
        :host([expanded]),
        :host:has(dialog.expanded) {
            ${expandedString};
        }
        :host([xr]:not([expanded])),
        :host:has(dialog.collapsed-xr) {
            ${collapsedXRString};
        }
    `,
    // Base layout
    css`
        :host {
            position: relative;
            vertical-align: top;
            display: inline-flex;
            height: 100%;
            box-sizing: border-box;
            z-index: 0;
        }

        :host([modal]) {
            position: static;
            display: contents;
        }

        .scrim {
            background: var(--_scrim-color);
            display: none;
            inset: 0;
            opacity: 0;
            pointer-events: none;
            position: fixed;
            z-index: 999;
            transition: opacity 250ms linear;
        }

        :host([modal][open]) .scrim,
        dialog.modal.open ~ .scrim,
        :host([modal]) dialog.open ~ .scrim {
            display: block;
            opacity: var(--_scrim-opacity);
            pointer-events: auto;
        }

        dialog {
            all: unset;
            display: flex;
            flex-direction: column;
            position: relative;
            vertical-align: top;
            border: none;
            outline: none;
            height: 100%;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            z-index: 0;
        }

        dialog::backdrop,
        ::backdrop {
            background: none;
        }

        dialog.modal {
            position: fixed;
            inset-block: 0;
            inset-inline-start: 0;
            margin: 0;
            padding: 0;
            border: none;
            background: transparent;
            max-height: 100%;
            max-width: 100%;
            z-index: 1000;
            overflow: visible;
        }

        dialog.modal:not([open]),
        dialog.modal.closed {
            display: none;
        }

        .container {
            display: flex;
            flex-direction: column;
            height: 100%;
            flex-grow: 1;
            overflow: hidden;
            position: relative;
            box-sizing: border-box;
            transform-origin: top start;
            transition: width 300ms cubic-bezier(0.2, 0, 0, 1);
        }

        :host([quick]) .container,
        :host([quick]) .scrim {
            transition: none !important;
        }

        .background {
            border-radius: inherit;
            position: absolute;
            inset: 0;
            z-index: -1;
            pointer-events: none;
        }

        .header-section {
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            flex-shrink: 0;
        }

        .menu,
        .fab,
        .header {
            display: flex;
            box-sizing: border-box;
        }

        .scroller-section {
            position: relative;
            flex: 1;
            min-height: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .scroller {
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            overflow-y: auto;
            height: 100%;
            scrollbar-width: none;
        }

        .scroller::-webkit-scrollbar {
            display: none;
        }

        .destination {
            flex: 1;
            height: min-content;
            min-height: 100%;
            position: relative;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        }

        dialog.align-top .destination,
        :host([alignment="top"]) .destination {
            justify-content: flex-start;
        }

        dialog.align-center .destination,
        :host([alignment="center"]) .destination {
            justify-content: center;
        }

        dialog.align-bottom .destination,
        :host([alignment="bottom"]) .destination {
            justify-content: flex-end;
        }

        .end-section {
            display: flex;
            flex-direction: column;
            margin-block-start: auto;
            box-sizing: border-box;
            flex-shrink: 0;
        }

        .end,
        .footer {
            display: flex;
            box-sizing: border-box;
        }

        mdc-divider {
            position: absolute;
            left: 0;
            right: 0;
            height: 1px;
            opacity: 0;
            transition-property: opacity;
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
            width: 100%;
            height: 1px;
            pointer-events: none;
        }

        .top.anchor {
            top: 0;
        }

        .bottom.anchor {
            bottom: 0;
        }
    `,
    // Collapsed Standard State
    css`
        :host(:has(dialog.collapsed)),
        :host(:not([expanded]):not([modal])) {
            ${overrideTab.collapsed};
        }

        dialog.collapsed .container {
            gap: var(--_standard-container-item-gap);
            width: var(--_standard-container-width);
            border-start-start-radius: var(--_standard-container-shape-start-start);
            border-start-end-radius: var(--_standard-container-shape-start-end);
            border-end-end-radius: var(--_standard-container-shape-end-end);
            border-end-start-radius: var(--_standard-container-shape-end-start);
            padding-block-start: var(--_standard-container-block-leading-space);
            padding-block-end: var(--_standard-container-block-trailing-space);
            padding-inline-start: var(--_standard-container-inline-leading-space);
            padding-inline-end: var(--_standard-container-inline-trailing-space);
        }

        dialog.collapsed .container .background {
            background: var(--_standard-container-color);
        }

        dialog.collapsed .container .header-section {
            align-items: center;
            gap: var(--_standard-menu-and-fab-item-gap);
            padding-block-start: var(--_standard-menu-and-fab-block-leading-space);
            padding-block-end: var(--_standard-menu-and-fab-block-trailing-space);
            padding-inline-start: var(--_standard-menu-and-fab-inline-leading-space);
            padding-inline-end: var(--_standard-menu-and-fab-inline-trailing-space);
        }

        dialog.collapsed .container .header-section .menu,
        dialog.collapsed .container .header-section .fab,
        dialog.collapsed .container .header-section .header {
            justify-content: center;
            align-items: center;
        }

        dialog.collapsed .container .destination {
            align-items: center;
            gap: var(--_standard-segments-item-gap);
            padding-block-start: var(--_standard-segments-block-leading-space);
            padding-block-end: var(--_standard-segments-block-trailing-space);
            padding-inline-start: var(--_standard-segments-inline-leading-space);
            padding-inline-end: var(--_standard-segments-inline-trailing-space);
        }

        dialog.collapsed .container .end-section {
            align-items: center;
        }

        dialog.collapsed .container .end-section .end,
        dialog.collapsed .container .end-section .footer {
            justify-content: center;
            align-items: center;
        }
    `,
    // Expanded Standard State
    css`
        :host(:has(dialog.expanded.standard)),
        :host([expanded]:not([modal])) {
            ${overrideTab.expandedStandard};
        }

        dialog.expanded.standard .container {
            gap: var(--_standard-container-item-gap);
            width: var(--_standard-container-width);
            border-start-start-radius: var(--_standard-container-shape-start-start);
            border-start-end-radius: var(--_standard-container-shape-start-end);
            border-end-end-radius: var(--_standard-container-shape-end-end);
            border-end-start-radius: var(--_standard-container-shape-end-start);
            padding-block-start: var(--_standard-container-block-leading-space);
            padding-block-end: var(--_standard-container-block-trailing-space);
            padding-inline-start: var(--_standard-container-inline-leading-space);
            padding-inline-end: var(--_standard-container-inline-trailing-space);
        }

        dialog.expanded.standard .container .background {
            background: var(--_standard-container-color);
        }

        dialog.expanded.standard .container .header-section {
            align-items: flex-start;
            gap: var(--_standard-menu-and-fab-item-gap);
            padding-block-start: var(--_standard-menu-and-fab-block-leading-space);
            padding-block-end: var(--_standard-menu-and-fab-block-trailing-space);
            padding-inline-start: var(--_standard-menu-and-fab-inline-leading-space);
            padding-inline-end: var(--_standard-menu-and-fab-inline-trailing-space);
        }

        dialog.expanded.standard .container .header-section .menu,
        dialog.expanded.standard .container .header-section .fab,
        dialog.expanded.standard .container .header-section .header {
            justify-content: flex-start;
            align-items: center;
        }

        dialog.expanded.standard .container .destination {
            align-items: stretch;
            gap: var(--_standard-segments-item-gap);
            padding-block-start: var(--_standard-segments-block-leading-space);
            padding-block-end: var(--_standard-segments-block-trailing-space);
            padding-inline-start: var(--_standard-segments-inline-leading-space);
            padding-inline-end: var(--_standard-segments-inline-trailing-space);
        }

        dialog.expanded.standard .container .end-section {
            align-items: flex-start;
        }

        dialog.expanded.standard .container .end-section .end,
        dialog.expanded.standard .container .end-section .footer {
            justify-content: flex-start;
            align-items: center;
        }
    `,
    // Modal State
    css`
        :host(:has(dialog.modal)) {
            ${overrideTab.expandedModal};
        }

        dialog.modal .container {
            gap: var(--_modal-container-item-gap);
            width: var(--_modal-container-width);
            border-start-start-radius: var(--_modal-container-shape-start-start);
            border-start-end-radius: var(--_modal-container-shape-start-end);
            border-end-end-radius: var(--_modal-container-shape-end-end);
            border-end-start-radius: var(--_modal-container-shape-end-start);
            padding-block-start: var(--_modal-container-block-leading-space);
            padding-block-end: var(--_modal-container-block-trailing-space);
            padding-inline-start: var(--_modal-container-inline-leading-space);
            padding-inline-end: var(--_modal-container-inline-trailing-space);
        }

        dialog.modal .container .background {
            background: var(--_modal-container-color);
        }

        dialog.modal .container .header-section {
            align-items: flex-start;
            gap: var(--_modal-menu-and-fab-item-gap);
            padding-block-start: var(--_modal-menu-and-fab-block-leading-space);
            padding-block-end: var(--_modal-menu-and-fab-block-trailing-space);
            padding-inline-start: var(--_modal-menu-and-fab-inline-leading-space);
            padding-inline-end: var(--_modal-menu-and-fab-inline-trailing-space);
        }

        dialog.modal .container .header-section .menu,
        dialog.modal .container .header-section .fab,
        dialog.modal .container .header-section .header {
            justify-content: flex-start;
            align-items: center;
        }

        dialog.modal .container .destination {
            align-items: stretch;
            gap: var(--_modal-segments-item-gap);
            padding-block-start: var(--_modal-segments-block-leading-space);
            padding-block-end: var(--_modal-segments-block-trailing-space);
            padding-inline-start: var(--_modal-segments-inline-leading-space);
            padding-inline-end: var(--_modal-segments-inline-trailing-space);
        }

        dialog.modal .container .end-section {
            align-items: flex-start;
        }

        dialog.modal .container .end-section .end,
        dialog.modal .container .end-section .footer {
            justify-content: flex-start;
            align-items: center;
        }

        dialog.modal.collapsed .container {
            width: var(--_standard-container-width);
        }

        dialog.modal.collapsed .container .header-section,
        dialog.modal.collapsed .container .destination,
        dialog.modal.collapsed .container .end-section {
            align-items: center;
        }
    `,
    // Collapsed XR State
    css`
        :host(:has(dialog.collapsed-xr)),
        :host([xr]:not([expanded])) {
            ${overrideTab.collapsedXR};
        }

        dialog.collapsed-xr .container {
            gap: var(--_standard-container-item-gap);
            width: var(--_standard-container-width);
            border-start-start-radius: var(--_standard-container-shape-start-start);
            border-start-end-radius: var(--_standard-container-shape-start-end);
            border-end-end-radius: var(--_standard-container-shape-end-end);
            border-end-start-radius: var(--_standard-container-shape-end-start);
            padding-block-start: var(--_standard-container-block-leading-space);
            padding-block-end: var(--_standard-container-block-trailing-space);
            padding-inline-start: var(--_standard-container-inline-leading-space);
            padding-inline-end: var(--_standard-container-inline-trailing-space);
        }

        dialog.collapsed-xr .container .background {
            background: var(--_standard-container-color);
        }

        dialog.collapsed-xr .container .header-section {
            align-items: center;
            gap: var(--_standard-menu-and-fab-item-gap);
        }

        dialog.collapsed-xr .container .destination {
            align-items: center;
            gap: var(--_standard-segments-item-gap);
        }

        dialog.collapsed-xr .container .end-section {
            align-items: center;
        }
    `,
]

