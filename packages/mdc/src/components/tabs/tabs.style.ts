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
import { stringifyTokens } from '@sandlada/styles/adapters/lit'

const tokenString = stringifyTokens('--mdc-tabs')(TabsDefinition)

export const TabsStyles = css`
    :host {
        ${tokenString};
    }
    :host {
        display: inline-flex;
        flex-direction: column;
        box-sizing: border-box;
        width: 100%;
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

    .divider {
        box-sizing: border-box;
        flex: 0 0 var(--_divider-height);
        width: 100%;
        height: var(--_divider-height);
        background-color: var(--_enabled-divider-color);
    }
`
