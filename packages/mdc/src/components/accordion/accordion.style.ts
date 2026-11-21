/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import type { IconDefinition } from '../icon/icon.definition'
import type { RippleDefinition } from '../ripple/ripple.definition'
import {
    AccordionDefinition,
    ElevatedExpansionPanelDefinition,
    ExpansionPanelDefinition,
    FilledExpansionPanelDefinition,
    FlatExpansionPanelDefinition,
    OutlinedExpansionPanelDefinition,
} from './accordion.definition'

// ─── Token Strings ──────────────────────────────────────────────────────────

const AccordionTokenString = stringifyTokens('--mdc-accordion')(AccordionDefinition)

const StringifyPanel = stringifyTokens('--mdc-expansion-panel')
const PanelTokenString = StringifyPanel(ExpansionPanelDefinition)
const OutlinedTokenString = StringifyPanel(OutlinedExpansionPanelDefinition)
const ElevatedTokenString = StringifyPanel(ElevatedExpansionPanelDefinition)
const FilledTokenString = StringifyPanel(FilledExpansionPanelDefinition)
const FlatTokenString = StringifyPanel(FlatExpansionPanelDefinition)

// ─── Easings ────────────────────────────────────────────────────────────────

const EmphasizedDecelerateEasing = unsafeCSS(Easing.EmphasizedDecelerate.ToCSSValue())
const StandardEasing = unsafeCSS(Easing.Standard.ToCSSValue())
const StandardDecelerateEasing = unsafeCSS(Easing.StandardDecelerate.ToCSSValue())

// ─── Sub-component Token Overrides ──────────────────────────────────────────

const IconStyles = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'enabled-size': `var(--_icon-size)`,
})()

const ExpandIconStyles = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'enabled-size': `var(--_expand-icon-size)`,
})()

const RippleStyles = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'hovered-color'  : `var(--_state-layer-color)`,
    'hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'pressed-color'  : `var(--_state-layer-color)`,
    'pressed-opacity': `var(--_pressed-state-layer-opacity)`,
})()

const ElevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level'       : `var(--_enabled-container-elevation)`,
    'shadow-color': `var(--_container-shadow-color)`,
})()

const ExpandedElevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level'       : `var(--_expanded-container-elevation)`,
    'shadow-color': `var(--_container-shadow-color)`,
})()

// ─── Accordion Styles ───────────────────────────────────────────────────────

export const AccordionStyles = css`
    @layer mdc.accordion.variable {
        :host {
            ${AccordionTokenString};
        }
    }

    @layer mdc.accordion.base {
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
            gap: var(--_medium-panel-gap);
        }

        :host([size='small']) {
            gap: var(--_small-panel-gap);
        }

        :host([size='large']) {
            gap: var(--_large-panel-gap);
        }

        :host([connected]) {
            gap: 0px;
        }
    }
`

// ─── Expansion Panel Styles ─────────────────────────────────────────────────

const PanelBase = css`
    @layer mdc.expansion-panel.variable {
        :host {
            ${PanelTokenString};
        }
    }

    @layer mdc.expansion-panel.base {
        :host {
            display: block;
            width: 100%;
            box-sizing: border-box;
            position: relative;
            isolation: isolate;
            -webkit-tap-highlight-color: transparent;
        }

        [hidden] {
            display: none !important;
        }

        .panel {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
            background-color: var(--_enabled-container-color);
            border-start-start-radius: var(--_round-container-shape-start-start);
            border-start-end-radius: var(--_round-container-shape-start-end);
            border-end-start-radius: var(--_round-container-shape-end-start);
            border-end-end-radius: var(--_round-container-shape-end-end);
            transition: background-color 200ms ${StandardEasing}, border-radius 200ms ${StandardEasing};
        }

        :host([expanded]) .panel {
            background-color: var(--_expanded-container-color);
        }

        /* Shape axis */
        :host([shape='square']) .panel {
            border-start-start-radius: var(--_square-container-shape-start-start);
            border-start-end-radius: var(--_square-container-shape-start-end);
            border-end-start-radius: var(--_square-container-shape-end-start);
            border-end-end-radius: var(--_square-container-shape-end-end);
        }

        /* Connected group radius & divider overrides */
        :host([data-connected]:not([data-first])) .panel {
            border-start-start-radius: 0px;
            border-start-end-radius: 0px;
        }

        :host([data-connected]:not([data-last])) .panel {
            border-end-start-radius: 0px;
            border-end-end-radius: 0px;
        }

        /* Outlined border */
        :host([variant='outlined']) .panel,
        :host(:not([variant])) .panel {
            border: var(--_outline-width) solid var(--_enabled-outline-color);
        }

        :host([data-connected][variant='outlined']:not([data-first])) .panel,
        :host([data-connected]:not([variant]):not([data-first])) .panel {
            margin-block-start: calc(var(--_outline-width) * -1);
        }

        /* Flat bottom hairline divider */
        :host([variant='flat']) .panel {
            border-radius: 0px;
            border-block-end: var(--_divider-thickness) solid var(--_enabled-divider-color);
        }

        :host([variant='flat'][no-divider]) .panel,
        :host([variant='flat'][data-last]) .panel {
            border-block-end: none;
        }

        /* Connected filled divider between stacked items */
        :host([data-connected][variant='filled']:not([data-last])) .panel {
            border-block-end: var(--_divider-thickness) solid var(--_enabled-divider-color);
        }

        /* Elevation */
        mdc-elevation {
            ${ElevationStyles};
            border-radius: inherit;
            z-index: -1;
        }

        :host([expanded]) mdc-elevation {
            ${ExpandedElevationStyles};
        }

        /* Header button */
        .header-heading {
            margin: 0;
            padding: 0;
            font: inherit;
            display: block;
        }

        .header {
            all: unset;
            position: relative;
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
            min-height: var(--_medium-header-min-height);
            gap: var(--_medium-header-gap);
            padding-block-start: var(--_medium-header-padding-block-start);
            padding-block-end: var(--_medium-header-padding-block-end);
            padding-inline-start: var(--_medium-header-padding-inline-start);
            padding-inline-end: var(--_medium-header-padding-inline-end);
            border-radius: inherit;
            cursor: pointer;
            user-select: none;
            text-align: start;
        }

        :host([expanded]) .header {
            border-end-start-radius: 0px;
            border-end-end-radius: 0px;
        }

        :host([disabled]) .header {
            cursor: default;
            pointer-events: none;
        }

        :host([disabled]) .header-content,
        :host([disabled]) .leading-icon,
        :host([disabled]) .trailing,
        :host([disabled]) .expand-icon {
            opacity: var(--_disabled-content-opacity);
        }

        .header mdc-ripple {
            ${RippleStyles};
            border-radius: inherit;
        }

        .header mdc-focus-ring {
            border-radius: inherit;
        }

        /* Leading icon */
        .leading-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--_enabled-icon-color);
        }

        .leading-icon mdc-icon {
            ${IconStyles};
        }

        /* Header text block */
        .header-text {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 0;
            gap: var(--_header-text-gap);
        }

        .headline {
            color: var(--_enabled-headline-color);
            font-family: var(--_headline-font);
            font-size: var(--_headline-size);
            line-height: var(--_headline-leading);
            font-weight: var(--_headline-weight);
            letter-spacing: var(--_headline-tracking);
        }

        .supporting-text {
            color: var(--_enabled-supporting-text-color);
            font-family: var(--_supporting-text-font);
            font-size: var(--_supporting-text-size);
            line-height: var(--_supporting-text-leading);
            font-weight: var(--_supporting-text-weight);
            letter-spacing: var(--_supporting-text-tracking);
        }

        :host([hide-summary-on-expand][expanded]) .supporting-text {
            display: none;
        }

        /* Trailing metadata & expand indicator */
        .trailing {
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;
        }

        .expand-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--_enabled-expand-icon-color);
            transform: rotate(0deg);
        }

        .expand-icon mdc-icon {
            ${ExpandIconStyles};
        }

        :host([expanded]) .expand-icon {
            transform: rotate(180deg);
        }

        /* Collapsible body region (grid-template-rows 0fr -> 1fr) */
        .collapse {
            display: grid;
            grid-template-rows: 0fr;
            opacity: 0;
            visibility: hidden;
        }

        :host([expanded]) .collapse {
            grid-template-rows: 1fr;
            opacity: 1;
            visibility: visible;
        }

        .collapse-inner {
            min-height: 0;
            overflow: hidden;
        }

        .body {
            color: var(--_enabled-body-color);
            font-family: var(--_body-font);
            font-size: var(--_body-size);
            line-height: var(--_body-leading);
            font-weight: var(--_body-weight);
            letter-spacing: var(--_body-tracking);
            padding-block-start: var(--_medium-body-padding-block-start);
            padding-block-end: var(--_medium-body-padding-block-end);
            padding-inline-start: var(--_medium-body-padding-inline-start);
            padding-inline-end: var(--_medium-body-padding-inline-end);
        }

        .actions {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-end;
            flex-wrap: wrap;
            gap: var(--_actions-gap);
            padding-block-start: var(--_medium-actions-padding-block-start);
            padding-block-end: var(--_medium-actions-padding-block-end);
            padding-inline-start: var(--_medium-actions-padding-inline-start);
            padding-inline-end: var(--_medium-actions-padding-inline-end);
            border-block-start: var(--_divider-thickness) solid var(--_enabled-divider-color);
        }

        :host([no-divider]) .actions {
            border-block-start: none;
        }

        /* Size variants */
        :host([size='small']) .header {
            min-height: var(--_small-header-min-height);
            gap: var(--_small-header-gap);
            padding-block-start: var(--_small-header-padding-block-start);
            padding-block-end: var(--_small-header-padding-block-end);
            padding-inline-start: var(--_small-header-padding-inline-start);
            padding-inline-end: var(--_small-header-padding-inline-end);
        }

        :host([size='small']) .body {
            padding-block-start: var(--_small-body-padding-block-start);
            padding-block-end: var(--_small-body-padding-block-end);
            padding-inline-start: var(--_small-body-padding-inline-start);
            padding-inline-end: var(--_small-body-padding-inline-end);
        }

        :host([size='small']) .actions {
            padding-block-start: var(--_small-actions-padding-block-start);
            padding-block-end: var(--_small-actions-padding-block-end);
            padding-inline-start: var(--_small-actions-padding-inline-start);
            padding-inline-end: var(--_small-actions-padding-inline-end);
        }

        :host([size='large']) .header {
            min-height: var(--_large-header-min-height);
            gap: var(--_large-header-gap);
            padding-block-start: var(--_large-header-padding-block-start);
            padding-block-end: var(--_large-header-padding-block-end);
            padding-inline-start: var(--_large-header-padding-inline-start);
            padding-inline-end: var(--_large-header-padding-inline-end);
        }

        :host([size='large']) .body {
            padding-block-start: var(--_large-body-padding-block-start);
            padding-block-end: var(--_large-body-padding-block-end);
            padding-inline-start: var(--_large-body-padding-inline-start);
            padding-inline-end: var(--_large-body-padding-inline-end);
        }

        :host([size='large']) .actions {
            padding-block-start: var(--_large-actions-padding-block-start);
            padding-block-end: var(--_large-actions-padding-block-end);
            padding-inline-start: var(--_large-actions-padding-inline-start);
            padding-inline-end: var(--_large-actions-padding-inline-end);
        }

        /* Motion */
        @media (prefers-reduced-motion: no-preference) {
            :host(:not([quick])) .collapse {
                transition:
                    grid-template-rows 250ms ${StandardDecelerateEasing},
                    opacity 180ms ${StandardDecelerateEasing},
                    visibility 250ms allow-discrete;
            }

            :host([expanded]:not([quick])) .collapse {
                transition:
                    grid-template-rows 300ms ${EmphasizedDecelerateEasing},
                    opacity 220ms ${EmphasizedDecelerateEasing},
                    visibility 300ms allow-discrete;
            }

            :host(:not([quick])) .expand-icon {
                transition: transform 250ms ${StandardEasing};
            }
        }
    }
`

const PanelVariants = css`
    @layer mdc.expansion-panel.variant {
        :host([variant='outlined']) { ${OutlinedTokenString}; }
        :host([variant='elevated']) { ${ElevatedTokenString}; }
        :host([variant='filled']) { ${FilledTokenString}; }
        :host([variant='flat']) { ${FlatTokenString}; }
    }
`

const PanelAccessibility = css`
    @layer mdc.expansion-panel.accessibility {
        @media (prefers-reduced-motion: reduce) {
            .panel,
            .collapse,
            .expand-icon {
                transition: none !important;
            }
        }

        @media (prefers-contrast: more) {
            :host([variant='outlined']) .panel,
            :host(:not([variant])) .panel,
            :host([variant='filled']) .panel,
            :host([variant='elevated']) .panel {
                border: 2px solid var(--_enabled-outline-color);
            }

            .header:focus-visible {
                outline: 2px solid currentColor;
                outline-offset: 2px;
            }
        }

        @media (prefers-contrast: less) {
            :host([variant='outlined']) .panel,
            :host(:not([variant])) .panel {
                border-color: color-mix(in srgb, var(--_enabled-outline-color) 60%, transparent);
            }
        }

        @media (prefers-reduced-transparency: reduce) {
            .panel {
                backdrop-filter: none;
            }
        }

        @media (forced-colors: active) {
            .panel {
                background-color: Canvas;
                color: CanvasText;
                border: 1px solid CanvasText;
                forced-color-adjust: none;
            }

            :host([variant='flat']) .panel {
                border: none;
                border-block-end: 1px solid CanvasText;
            }

            .header {
                color: ButtonText;
            }

            .headline,
            .supporting-text,
            .body,
            .leading-icon,
            .expand-icon {
                color: CanvasText;
            }

            :host([disabled]) .panel {
                border-color: GrayText;
            }

            :host([disabled]) .headline,
            :host([disabled]) .supporting-text,
            :host([disabled]) .body,
            :host([disabled]) .leading-icon,
            :host([disabled]) .expand-icon {
                color: GrayText;
                opacity: 1;
            }

            .header:focus-visible {
                outline: 2px solid Highlight;
                outline-offset: -2px;
            }
        }
    }
`

export const ExpansionPanelStyles = [
    PanelBase,
    PanelVariants,
    PanelAccessibility,
]
