/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Styles for `mdc-tabs` — the tab bar container and its trailing divider.
 */
import { css } from 'lit'
import { TabsDefinition } from './tabs.definition'
import { stringifyTokens } from '../../utils/style'

const TokenString = stringifyTokens('--mdc-tabs')(TabsDefinition)

export const TabsStyles = css`
    :host {
        ${TokenString};
    }

    @layer mdc.tabs.layout {
        :host {
            display: inline-flex;
            flex-direction: column;
            box-sizing: border-box;
            width: 100%;
            background-color: var(--_enabled-container-color);
            color: inherit;
        }

        .tabs {
            display: flex;
            position: relative;
            box-sizing: border-box;
            width: 100%;
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }
        .tabs::-webkit-scrollbar {
            display: none;
        }

        :host(:not([mode="scrollable"])) ::slotted([mdc-tab]) {
            flex: 1 1 0%;
        }

        .tabs.scrollable {
            padding-inline-start: var(--_scrollable-edge-padding);
        }

        :host([mode="scrollable"]) ::slotted([mdc-tab]) {
            flex: 0 0 auto;
        }

        .divider {
            box-sizing: border-box;
            flex: 0 0 var(--_divider-height);
            width: 100%;
            height: var(--_divider-height);
            background-color: var(--_enabled-divider-color);
        }

        :host([no-divider]) .divider,
        :host([variant="floating"]) .divider {
            display: none;
        }
    }

    @layer mdc.tabs.contrast {
        @media (prefers-contrast: more) {
            .divider {
                background-color: CanvasText;
            }
        }
    }

    @layer mdc.tabs.hcm {
        @media (forced-colors: active) {
            .divider {
                background-color: CanvasText;
            }
        }
    }
`
