/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { ElevatedCardDefinition, FilledCardDefinition, OutlinedCardDefinition } from '../../component-definitions/card.definition'
import type { ElevationDefinition } from '../../definitions'
import { createWrappedTokens, overrideComponentTokens, stringTokens } from '../../utils'

type TVariant = 'filled' | 'outlined' | 'elevated'

const ft = createWrappedTokens('--mdc-f-card', FilledCardDefinition)
const fts = stringTokens(ft)
const ot = createWrappedTokens('--mdc-card', OutlinedCardDefinition)
const ots = stringTokens(ot)
const et = createWrappedTokens('--mdc-e-card', ElevatedCardDefinition)
const ets = stringTokens(et)

const host = css`
    :host {
        vertical-align: top;
        display: inline-flex;
        box-sizing: border-box;
        margin-inline-start: var(--_container-margin-inline-start);
        margin-inline-end: var(--_container-margin-inline-end);
        margin-block-start: var(--_container-margin-block-start);
        margin-block-end: var(--_container-margin-block-end);
    }
`

const container = css`
    .container {
        position: relative;
        display: flex;
        outline: none;
        border: none;
        z-index: 0;
        border-start-start-radius: var(--_container-shape-start-start);
        border-start-end-radius: var(--_container-shape-start-end);
        border-end-start-radius: var(--_container-shape-end-start);
        border-end-end-radius: var(--_container-shape-end-end);
        padding-inline-start: var(--_container-padding-inline-start);
        padding-inline-end: var(--_container-padding-inline-end);
        padding-block-start: var(--_container-padding-block-start);
        padding-block-end: var(--_container-padding-block-end);
    }
`

const background = css`
    .container>.background {
        box-sizing: border-box;
        border-start-start-radius: inherit;
        border-start-end-radius: inherit;
        border-end-start-radius: inherit;
        border-end-end-radius: inherit;
        position: absolute;
        inset: 0;
        z-index: -1;
    }
    .container>.background { background: var(--_container-color); }
`

const outline = css`
    .container>.outline {
        box-sizing: border-box;
        position: absolute;
        inset: 0;
        outline: none;
        border-style: solid;
        border-color: var(--_outline-color);
        border-width: var(--_outline-width);
        border-start-start-radius: inherit;
        border-start-end-radius: inherit;
        border-end-start-radius: inherit;
        border-end-end-radius: inherit;
        z-index: -1;
    }
    .container.disabled {
        border-color: var(--_disabled-outline-color);
    }
    .container:hover {
        border-color: var(--_hovered-outline-color);
    }
    .container:focus-within {
        border-color: var(--_focused-outline-color);
    }
    .container:active {
        border-color: var(--_pressed-outline-color);
    }
`

const elevation = css`
    .container mdc-elevation {transition-duration: 0ms;${stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', { level: `var(--_container-elevation)`, 'shadow-color': `var(--_container-shadow-color)` }))};}
    .container.disabled mdc-elevation {transition: none;${stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', { level: `var(--_disabled-container-elevation)` }))};}
    .container:focus-within mdc-elevation {${stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', { level: `var(--_focused-container-elevation)` }))};}
    .container:active mdc-elevation {${stringTokens(overrideComponentTokens<keyof typeof ElevationDefinition>('--mdc-elevation', { level: `var(--_pressed-container-elevation)` }))};}
`

export const cardStyles = [
    css`
        .container.filled {${fts};}
        .container.outlined {${ots};}
        .container.elevated {${ets};}
    `,
    host,
    container,
    background,
    outline,
    elevation,
]
