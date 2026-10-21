/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { overrideComponentTokens, stringifyTokens, stringTokens } from '../../utils/style'
import type { NavigationRailVerticalTabDefinition } from '../navigation-tab/navigation-tab.definition'
import { NavigationRailDefinition } from './navigation-rail.definition'

const railString = stringifyTokens('--mdc-navigation-rail')(NavigationRailDefinition)

export const NavigationRailTransitionDuration: number = 300

/**
 * Duration of the floating rail exit motion. It is shorter than the entrance
 * motion — an exit should never outlast the interaction that started it.
 */
const NavigationRailFloatingExitDuration: number = 200

const emphasizedDecelerateEasing = unsafeCSS(Easing.EmphasizedDecelerate.ToCSSValue())
const emphasizedAccelerateEasing = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())

const overrideTab = {
    collapsed: stringTokens(overrideComponentTokens<keyof typeof NavigationRailVerticalTabDefinition>('--mdc-navigation-tab', {
        'enabled-container-width': `var(--_collapsed-container-width)`,
    })),
    expandedDocked: stringTokens(overrideComponentTokens<keyof typeof NavigationRailVerticalTabDefinition>('--mdc-navigation-tab', {
        'enabled-container-width': `100%`,
    })),
    expandedFloating: stringTokens(overrideComponentTokens<keyof typeof NavigationRailVerticalTabDefinition>('--mdc-navigation-tab', {
        'enabled-container-width': `100%`,
    })),
    xr: stringTokens(overrideComponentTokens<keyof typeof NavigationRailVerticalTabDefinition>('--mdc-navigation-tab', {
        'enabled-container-width': `var(--_xr-container-width)`,
    })),
}

/*
 * 1. dialog.collapsed[.open|.closed]
 * 2. dialog.expanded-docked[.open|.closed]
 * 3. dialog.expanded-floating[.open|.closed]
 * 4. dialog.xr[.open|.closed]
 */
export const NavigationRailStyles = [
    // Token injection
    css`@layer mdc.navigation-rail.variables {:host {${railString};}}`,
    // ExpandedFloating Scrim
    css`
        @layer mdc.navigation-rail.component {
            .scrim {
                position: fixed;
                inset: 0px;
                opacity: 0;
                display: none;
                pointer-events: none;
                z-index: 0;
                background: var(--_scrim-color);

                transition-property: display, opacity;
                transition-behavior: allow-discrete;
                transition-duration: 150ms;
                transition-timing-function: linear;

                @starting-style {
                    opacity: var(--_scrim-opacity);
                }
            }
            .scrim:has(~ dialog.expanded-floating.open) {
                transition-duration: 500ms;
                display: flex;
                opacity: var(--_scrim-opacity);
                pointer-events: auto;
                @starting-style {
                    opacity: 0;
                }
            }

            .scrim:has(~ dialog:not(.expanded-floating)) {
                display: none;
                pointer-events: none;
            }
            :host([quick]) {
                .scrim {
                    transition-duration: 0ms;
                    transition-property: none;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .scrim {
                    transition-duration: 0ms;
                    transition-property: none;
                }
            }
        }
    `,
    // Expanded Floating
    css`
        @layer mdc.navigation-rail.component {
            :host([variant="expanded-floating"]) {
                position: static;
                display: contents;
            }

            dialog.expanded-floating {
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
            ::backdrop {
                background: none;
            }

            /*
             * The floating rail is painted only while it is open. The
             * display transition uses allow-discrete so the dialog stays
             * rendered until the exit motion finished — without it the rail
             * would vanish before the slide-out could be seen. The duration
             * follows the motion of the container (see the expanded floating
             * state block below), the dialog must not outlast it.
             */
            dialog.expanded-floating.closed {
                display: none;
                transition: display ${NavigationRailFloatingExitDuration}ms allow-discrete;
            }

            dialog.expanded-floating.open {
                display: flex;
                transition: display ${NavigationRailTransitionDuration}ms allow-discrete;
            }

            :host([quick]) dialog.expanded-floating {
                transition: none !important;
            }

            @media (prefers-reduced-motion: reduce) {
                dialog.expanded-floating.closed,
                dialog.expanded-floating.open {
                    transition: none;
                }
            }
        }
    `,
    // ExpandedDocked
    css`
        @layer mdc.navigation-rail.component {
        }
    `,
    // Expanded* Divider
    css`
        @layer mdc.navigation-rail.component {
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
        }
    `,
    // XR
    css`
        @layer mdc.navigation-rail.component {
            :host([variant="xr"]) {
                height: fit-content;
            }
        }
    `,
    // Base layout
    css`
        @layer mdc.navigation-rail.component {
            :host {
                position: relative;
                vertical-align: top;
                display: inline-flex;
                height: 100%;
                box-sizing: border-box;
                z-index: 0;
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

            .container {
                display: flex;
                flex-direction: column;
                height: 100%;
                flex-grow: 1;
                overflow: hidden;
                position: relative;
                box-sizing: border-box;
                transform-origin: top start;
                transition: width ${NavigationRailTransitionDuration}ms cubic-bezier(0.2, 0, 0, 1);
            }

            :host([quick]) .container {
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
                height: fit-content;
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

            .anchor {
                position: absolute;
                left: 0px;
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
        }
    `,
    // Collapsed State
    css`
        @layer mdc.navigation-rail.component {
            :host:has(dialog.collapsed),
            :host([variant="collapsed"]) {
                ${overrideTab.collapsed};
            }

            dialog.collapsed .container {
                gap: var(--_collapsed-container-item-gap);
                width: var(--_collapsed-container-width);
                border-start-start-radius: var(--_collapsed-container-shape-start-start);
                border-start-end-radius: var(--_collapsed-container-shape-start-end);
                border-end-end-radius: var(--_collapsed-container-shape-end-end);
                border-end-start-radius: var(--_collapsed-container-shape-end-start);
                padding-block-start: var(--_collapsed-container-padding-block-start);
                padding-block-end: var(--_collapsed-container-padding-block-end);
                padding-inline-start: var(--_collapsed-container-padding-inline-start);
                padding-inline-end: var(--_collapsed-container-padding-inline-end);
            }

            dialog.collapsed .container .background {
                background: var(--_collapsed-container-color);
            }

            /*
             * The collapsed rail keeps its content inside a frame that is pinned to
             * the inline start and sized to the collapsed container width. The
             * container width animates between the collapsed and expanded widths,
             * so without a fixed frame the collapsed content would be re-centered
             * inside the still-expanded container and jump to the middle of the
             * rail before sliding back.
             */
            dialog.collapsed .container .header-section,
            dialog.collapsed .container .scroller-section,
            dialog.collapsed .container .end-section {
                width: var(--_collapsed-container-width);
                align-self: flex-start;
            }

            dialog.collapsed .container .header-section {
                align-items: center;
                gap: var(--_collapsed-menu-and-fab-item-gap);
                padding-block-start: var(--_collapsed-menu-and-fab-padding-block-start);
                padding-block-end: var(--_collapsed-menu-and-fab-padding-block-end);
                padding-inline-start: var(--_collapsed-menu-and-fab-padding-inline-start);
                padding-inline-end: var(--_collapsed-menu-and-fab-padding-inline-end);
            }

            dialog.collapsed .container .header-section .menu,
            dialog.collapsed .container .header-section .fab,
            dialog.collapsed .container .header-section .header {
                justify-content: center;
                align-items: center;
            }

            dialog.collapsed .container .destination {
                align-items: center;
                gap: var(--_collapsed-segments-item-gap);
                padding-block-start: var(--_collapsed-segments-padding-block-start);
                padding-block-end: var(--_collapsed-segments-padding-block-end);
                padding-inline-start: var(--_collapsed-segments-padding-inline-start);
                padding-inline-end: var(--_collapsed-segments-padding-inline-end);
            }

            dialog.collapsed .container .end-section {
                align-items: center;
            }

            dialog.collapsed .container .end-section .end,
            dialog.collapsed .container .end-section .footer {
                justify-content: center;
                align-items: center;
            }
        }
    `,
    // Expanded Docked State
    css`
        @layer mdc.navigation-rail.component {
            :host:has(dialog.expanded-docked),
            :host([variant="expanded-docked"]) {
                ${overrideTab.expandedDocked};
            }

            dialog.expanded-docked .container {
                gap: var(--_expanded-docked-container-item-gap);
                width: var(--_expanded-docked-container-width);
                border-start-start-radius: var(--_expanded-docked-container-shape-start-start);
                border-start-end-radius: var(--_expanded-docked-container-shape-start-end);
                border-end-end-radius: var(--_expanded-docked-container-shape-end-end);
                border-end-start-radius: var(--_expanded-docked-container-shape-end-start);
                padding-block-start: var(--_expanded-docked-container-padding-block-start);
                padding-block-end: var(--_expanded-docked-container-padding-block-end);
                padding-inline-start: var(--_expanded-docked-container-padding-inline-start);
                padding-inline-end: var(--_expanded-docked-container-padding-inline-end);
            }

            dialog.expanded-docked .container .background {
                background: var(--_expanded-docked-container-color);
            }

            dialog.expanded-docked .container .header-section {
                align-items: flex-start;
                gap: var(--_expanded-docked-menu-and-fab-item-gap);
                padding-block-start: var(--_expanded-docked-menu-and-fab-padding-block-start);
                padding-block-end: var(--_expanded-docked-menu-and-fab-padding-block-end);
                padding-inline-start: var(--_expanded-docked-menu-and-fab-padding-inline-start);
                padding-inline-end: var(--_expanded-docked-menu-and-fab-padding-inline-end);
            }

            dialog.expanded-docked .container .header-section .menu,
            dialog.expanded-docked .container .header-section .fab,
            dialog.expanded-docked .container .header-section .header {
                justify-content: flex-start;
                align-items: center;
            }

            dialog.expanded-docked .container .destination {
                align-items: stretch;
                gap: var(--_expanded-docked-segments-item-gap);
                padding-block-start: var(--_expanded-docked-segments-padding-block-start);
                padding-block-end: var(--_expanded-docked-segments-padding-block-end);
                padding-inline-start: var(--_expanded-docked-segments-padding-inline-start);
                padding-inline-end: var(--_expanded-docked-segments-padding-inline-end);
            }

            dialog.expanded-docked .container .end-section {
                align-items: flex-start;
            }

            dialog.expanded-docked .container .end-section .end,
            dialog.expanded-docked .container .end-section .footer {
                justify-content: flex-start;
                align-items: center;
            }
        }
    `,
    // Expanded Floating State
    css`
        @layer mdc.navigation-rail.component {
            :host:has(dialog.expanded-floating),
            :host([variant="expanded-floating"]) {
                ${overrideTab.expandedFloating};
            }

            dialog.expanded-floating .container {
                gap: var(--_expanded-floating-container-item-gap);
                width: var(--_expanded-floating-container-width);
                border-start-start-radius: var(--_expanded-floating-container-shape-start-start);
                border-start-end-radius: var(--_expanded-floating-container-shape-start-end);
                border-end-end-radius: var(--_expanded-floating-container-shape-end-end);
                border-end-start-radius: var(--_expanded-floating-container-shape-end-start);
                padding-block-start: var(--_expanded-floating-container-padding-block-start);
                padding-block-end: var(--_expanded-floating-container-padding-block-end);
                padding-inline-start: var(--_expanded-floating-container-padding-inline-start);
                padding-inline-end: var(--_expanded-floating-container-padding-inline-end);

                /*
                 * Floating rail motion: the container parks one container
                 * width off the docked edge and slides in when the rail
                 * opens. The off-dock direction is PHYSICAL (sign * width) —
                 * the rail is docked to the inline-start edge, so it enters
                 * from the left under ltr and from the right under rtl.
                 * Pixel offsets are mandatory — Chrome resolves a
                 * starting-style percentage transform against the
                 * destination frame and never paints the slide.
                 *
                 * The width transition of the base rule is kept so the
                 * container can still morph when the variant changes.
                 */
                --_rail-off-dock-sign: -1;
                transform: translateX(calc(var(--_rail-off-dock-sign) * var(--_expanded-floating-container-width)));
                opacity: 0.6;
                transition-property: width, transform, opacity;
                transition-duration:
                    ${NavigationRailTransitionDuration}ms,
                    ${NavigationRailFloatingExitDuration}ms,
                    ${NavigationRailFloatingExitDuration}ms;
                transition-timing-function:
                    cubic-bezier(0.2, 0, 0, 1),
                    ${emphasizedAccelerateEasing},
                    ${emphasizedAccelerateEasing};
            }

            :host(:dir(rtl)) dialog.expanded-floating .container {
                --_rail-off-dock-sign: 1;
            }

            dialog.expanded-floating.open .container {
                transform: translateX(0);
                opacity: 1;
                transition-property: width, transform, opacity;
                transition-duration:
                    ${NavigationRailTransitionDuration}ms,
                    ${NavigationRailTransitionDuration}ms,
                    ${NavigationRailTransitionDuration}ms;
                transition-timing-function:
                    cubic-bezier(0.2, 0, 0, 1),
                    ${emphasizedDecelerateEasing},
                    ${emphasizedDecelerateEasing};
            }

            /*
             * Starting styles for the open transition. Declared after the
             * main rules: starting-style declarations take part in the
             * normal cascade, so a block placed earlier would lose to the
             * matching open-state rules and the before-change value would
             * equal the open value, killing the transition.
             */
            @starting-style {
                dialog.expanded-floating.open .container {
                    transform: translateX(calc(var(--_rail-off-dock-sign) * var(--_expanded-floating-container-width)));
                    opacity: 0.6;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                dialog.expanded-floating .container,
                dialog.expanded-floating.open .container {
                    transition: none;
                }
            }

            dialog.expanded-floating .container .background {
                background: var(--_expanded-floating-container-color);
            }

            dialog.expanded-floating .container .header-section {
                align-items: flex-start;
                gap: var(--_expanded-floating-menu-and-fab-item-gap);
                padding-block-start: var(--_expanded-floating-menu-and-fab-padding-block-start);
                padding-block-end: var(--_expanded-floating-menu-and-fab-padding-block-end);
                padding-inline-start: var(--_expanded-floating-menu-and-fab-padding-inline-start);
                padding-inline-end: var(--_expanded-floating-menu-and-fab-padding-inline-end);
            }

            dialog.expanded-floating .container .header-section .menu,
            dialog.expanded-floating .container .header-section .fab,
            dialog.expanded-floating .container .header-section .header {
                justify-content: flex-start;
                align-items: center;
            }

            dialog.expanded-floating .container .destination {
                align-items: stretch;
                gap: var(--_expanded-floating-segments-item-gap);
                padding-block-start: var(--_expanded-floating-segments-padding-block-start);
                padding-block-end: var(--_expanded-floating-segments-padding-block-end);
                padding-inline-start: var(--_expanded-floating-segments-padding-inline-start);
                padding-inline-end: var(--_expanded-floating-segments-padding-inline-end);
            }

            dialog.expanded-floating .container .end-section {
                align-items: flex-start;
            }

            dialog.expanded-floating .container .end-section .end,
            dialog.expanded-floating .container .end-section .footer {
                justify-content: flex-start;
                align-items: center;
            }
        }
    `,
    // XR State
    css`
        @layer mdc.navigation-rail.component {
            :host:has(dialog.xr),
            :host([variant="xr"]) {
                ${overrideTab.xr};
            }

            dialog.xr .container {
                gap: var(--_xr-container-item-gap);
                width: var(--_xr-container-width);
                border-start-start-radius: var(--_xr-container-shape-start-start);
                border-start-end-radius: var(--_xr-container-shape-start-end);
                border-end-end-radius: var(--_xr-container-shape-end-end);
                border-end-start-radius: var(--_xr-container-shape-end-start);
                padding-block-start: var(--_xr-container-padding-block-start);
                padding-block-end: var(--_xr-container-padding-block-end);
                padding-inline-start: var(--_xr-container-padding-inline-start);
                padding-inline-end: var(--_xr-container-padding-inline-end);
            }

            dialog.xr .container .background {
                background: var(--_xr-container-color);
            }

            dialog.xr .container .header-section {
                align-items: center;
                gap: var(--_xr-menu-and-fab-item-gap);
            }

            dialog.xr .container .destination {
                align-items: center;
                gap: var(--_xr-segments-item-gap);
            }

            dialog.xr .container .end-section {
                align-items: center;
            }
        }
    `,
]
