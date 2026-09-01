/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css } from 'lit'
import { IconDefinition } from '../../component-definitions/icon.definition'
import { createStyleSheet, pipe, stringifyTokens } from '../../utils/styles'

const tokens = stringifyTokens('--mdc-icon')(IconDefinition)

const iconStyles = pipe(
    tokens,
    createStyleSheet
)(IconDefinition)(() => css`
:host {
    font-size: var(--_size);
    width: var(--_size);
    height: var(--_size);
    font-family: var(--_font);
}
`)

export const styles = [
    iconStyles,
    css`
:host {
    color: inherit;
    font-variation-settings: inherit;
    font-weight: 400;
    display: inline-flex;
    font-style: normal;
    place-items: center;
    place-content: center;
    line-height: 1;
    overflow: hidden;
    letter-spacing: normal;
    text-transform: none;
    user-select: none;
    white-space: nowrap;
    word-wrap: normal;
    flex-shrink: 0;

    /* Support for all WebKit browsers. */
    -webkit-font-smoothing: antialiased;
    /* Support for Safari and Chrome. */
    text-rendering: optimizeLegibility;
    /* Support for Firefox. */
    -moz-osx-font-smoothing: grayscale;
}

.icon-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    direction: ltr;
    -webkit-font-feature-settings: 'liga';
}

::slotted(svg) {
    fill: currentColor;
}

::slotted(*) {
    display: block;
    height: 100%;
    width: 100%;
}
`
]
