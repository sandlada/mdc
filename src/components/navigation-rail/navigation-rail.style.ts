import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import { css, unsafeCSS } from 'lit'
import { NavigationRailCollapsedDefinition, NavigationRailCollapsedXRDefinition, NavigationRailExpandedDefinition, NavigationRailVerticalTabDefinition } from '../../definitions'
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
        "container-width": `var(--_standard-container-width)`
    })),
    expandedStandard: stringTokens(overrideComponentTokens<keyof typeof NavigationRailVerticalTabDefinition>('--mdc-navigation-tab', {
        "container-width": `var(--_standard-container-width)`
    })),
    expandedModal: stringTokens(overrideComponentTokens<keyof typeof NavigationRailVerticalTabDefinition>('--mdc-navigation-tab', {
        "container-width": `var(--_modal-container-width)`
    })),
    collapsedXR: stringTokens(overrideComponentTokens<keyof typeof NavigationRailVerticalTabDefinition>('--mdc-navigation-tab', {
        "container-width": `var(--_standard-container-width)`
    })),
}

/**
 * State-based style layers:
 *   .container                → Base layout (always applied)
 *   .container.expanded       → Expanded token set on host
 *   .container.collapsed      → Collapsed token set on host
 *   .container.standard       → Standard-mode styles
 *   .container.modal          → Modal-mode styles
 *   .container.expanded.standard → Expanded standard overrides
 *   .container.expanded.modal    → Expanded modal overrides
 *   .container.collapsed         → Collapsed layout overrides
 *
 * Width transitions between collapsed ↔ expanded are handled by
 * CSS `transition` on `.container`. Modal enter/exit animations
 * use WAAPI via `NavigationRail.animateHost()`.
 */
export const NavigationRailStyles = [
    css`
        :host:has(dialog.expanded) {${expandedString};}
        :host:has(dialog.collapsed) {${collapsedString};}
        :host:has(dialog.collapsed-xr) {${collapsedXRString};}
    `,
    // Base — Shared layout for all states
    css`
        :host {
            position: relative;
            vertical-align: top;
            display: inline-flex;
            z-index: 0;
        }

        .scrim {
            background: var(--_scrim-color);
            display: none;
            inset: 0;
            opacity: var(--_scrim-opacity);
            pointer-events: none;
            position: fixed;
            z-index: 0;
        }
        :host([modal][expanded]) .scrim {
            display: flex;
        }

        dialog {
            all: unset;
            display: flex;
            flex-direction: column;
            position: relative;
            vertical-align: top;
            border: none;
            outline: none;
            height: inherit;
            margin: inherit;
            max-height: inherit;
            max-width: inherit;
            min-height: inherit;
            min-width: inherit;
            overflow: visible;
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
            flex-grow: 1;
            overflow: hidden;
            position: relative;
            transform-origin: top;
            /* Smooth width transition between collapsed ↔ expanded.
               Suppressed when the host has the quick attribute
               (handled via :host([quick]) selector below). */
            transition: width 0.3s ease;
        }

        .expanded-xr .container {
            height: fit-content;
        }

        .background {
            border-radius: inherit;
            position: absolute;
            inset: 0;
            z-index: -1;
            background: var(--_standard-container-color);
        }
        .scroller-section {
            position: relative;
            flex: 1;
            overflow: hidden;
        }
        .scroller {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            height: 100%;
        }
        dialog.scrollable .scroller {
            overflow-y: scroll;
        }
        .destination {
            flex: 1;
            height: min-content;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        .menu-and-fab {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        /* Suppress width transition when quick is set */
        :host([quick]) .container {
            transition: none;
        }

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
        }
        .top.anchor {
            top: 0;
        }
        .bottom.anchor {
            bottom: 0;
        }
    `,
    // Expanded - Standard
    css`
        :host {${overrideTab.expandedModal};}
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
        dialog.expanded.standard .container .content .destination {
            align-items: flex-start;
            gap: var(--_standard-segments-item-gap);
            padding-block-start: var(--_standard-segments-block-leading-space);
            padding-block-end: var(--_standard-segments-block-trailing-space);
            padding-inline-start: var(--_standard-segments-inline-leading-space);
            padding-inline-end: var(--_standard-segments-inline-trailing-space);
        }

        dialog.expanded.standard .container .menu-and-fab {
            align-items: flex-start;
            gap: var(--_standard-menu-and-fab-item-gap);
            padding-block-start: var(--_standard-menu-and-fab-block-leading-space);
            padding-block-end: var(--_standard-menu-and-fab-block-trailing-space);
            padding-inline-start: var(--_standard-menu-and-fab-inline-leading-space);
            padding-inline-end: var(--_standard-menu-and-fab-inline-trailing-space);
        }
    `,
    // Expanded - Modal
    css`
        :host {${overrideTab.expandedStandard};}
        dialog.expanded.modal .container {
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
        dialog.expanded.modal .container .background {
            background: var(--_modal-container-color);
        }
        dialog.expanded.modal .container .content .destination {
            align-items: flex-start;
            gap: var(--_modal-segments-item-gap);
            padding-block-start: var(--_modal-segments-block-leading-space);
            padding-block-end: var(--_modal-segments-block-trailing-space);
            padding-inline-start: var(--_modal-segments-inline-leading-space);
            padding-inline-end: var(--_modal-segments-inline-trailing-space);
        }

        dialog.expanded.modal .container .menu-and-fab {
            align-items: flex-start;
            gap: var(--_modal-menu-and-fab-item-gap);
            padding-block-start: var(--_modal-menu-and-fab-block-leading-space);
            padding-block-end: var(--_modal-menu-and-fab-block-trailing-space);
            padding-inline-start: var(--_modal-menu-and-fab-inline-leading-space);
            padding-inline-end: var(--_modal-menu-and-fab-inline-trailing-space);
        }
    `,
    // Collapsed
    css`
        :host {${overrideTab.collapsed};}
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
        dialog.collapsed .container .content .destination {
            gap: var(--_standard-segments-item-gap);
            padding-block-start: var(--_standard-segments-block-leading-space);
            padding-block-end: var(--_standard-segments-block-trailing-space);
            padding-inline-start: var(--_standard-segments-inline-leading-space);
            padding-inline-end: var(--_standard-segments-inline-trailing-space);
        }

        dialog.collapsed .container .menu-and-fab {
            gap: var(--_standard-menu-and-fab-item-gap);
            padding-block-start: var(--_standard-menu-and-fab-block-leading-space);
            padding-block-end: var(--_standard-menu-and-fab-block-trailing-space);
            padding-inline-start: var(--_standard-menu-and-fab-inline-leading-space);
            padding-inline-end: var(--_standard-menu-and-fab-inline-trailing-space);
        }
    `,
    // CollapsedXR
    css`
        :host {${overrideTab.collapsedXR};}
        dialog.expanded-xr .container {
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
        dialog.expanded.modal .container .background {
            background: var(--_standard-container-color);
        }
        dialog.expanded.modal .container .content .destination {
            align-items: flex-start;
            gap: var(--_standard-segments-item-gap);
            padding-block-start: var(--_standard-segments-block-leading-space);
            padding-block-end: var(--_standard-segments-block-trailing-space);
            padding-inline-start: var(--_standard-segments-inline-leading-space);
            padding-inline-end: var(--_standard-segments-inline-trailing-space);
        }

        dialog.expanded.modal .container .menu-and-fab {
            align-items: flex-start;
            gap: var(--_standard-menu-and-fab-item-gap);
            padding-block-start: var(--_standard-menu-and-fab-block-leading-space);
            padding-block-end: var(--_standard-menu-and-fab-block-trailing-space);
            padding-inline-start: var(--_standard-menu-and-fab-inline-leading-space);
            padding-inline-end: var(--_standard-menu-and-fab-inline-trailing-space);
        }
    `
]
