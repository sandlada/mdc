/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'
import {
    ConnectedButtonGroupDefinition,
    StandardButtonGroupDefinition,
} from '../../component-definitions/button-group.definition'

const standardTokenRecord = defineTokenRefsRecord(StandardButtonGroupDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-standard-button-group',
})
const standardTokenString = unsafeCSS(defineVars(standardTokenRecord, true).join(''))

const connectedTokenRecord = defineTokenRefsRecord(ConnectedButtonGroupDefinition, {
    expandShapes: true,
    useBaseFallback: true,
    prefix: '--mdc-connected-button-group',
})
const connectedTokenString = unsafeCSS(defineVars(connectedTokenRecord, true).join(''))

type TSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'

const SIZES: TSize[] = ['extra-small', 'small', 'medium', 'large', 'extra-large']

/**
 * Build the per-position CSS overrides that morph a connected group's slotted
 * children's border radii. The connected outer corners use the group's round or
 * square corner radii; sides that meet a sibling use the inner-shape (squared)
 * so the buttons visually dock into a single pill shape.
 *
 * For each position we also mirror the same values into the toggle-selected
 * shape tokens so that a SELECTED toggle button still respects the group's
 * position-based shape (overriding its default selected pill).
 */
function getConnectedShapeTokensString(
    size: TSize,
    position: 'start' | 'middle' | 'end' | 'single',
    orientation: 'horizontal' | 'vertical',
): string {
    // `inner-shape` keys are auto-expanded by `defineTokenRefsRecord({ expandShapes: true })`
    // into 4 logical-corner CSS variables on :host (the shorthand var itself is NOT
    // emitted). Read each corner individually so the CSS resolves.
    const innerShapeStartStart = `var(--_enabled-${size}-inner-shape-start-start)`
    const innerShapeStartEnd = `var(--_enabled-${size}-inner-shape-start-end)`
    const innerShapeEndStart = `var(--_enabled-${size}-inner-shape-end-start)`
    const innerShapeEndEnd = `var(--_enabled-${size}-inner-shape-end-end)`

    const outerRound = `var(--_enabled-${size}-outer-shape-round)`
    const outerSquare = `var(--_enabled-${size}-outer-shape-square)`

    let roundStartStart = outerRound
    let roundStartEnd = outerRound
    let roundEndStart = outerRound
    let roundEndEnd = outerRound

    let squareStartStart = outerSquare
    let squareStartEnd = outerSquare
    let squareEndStart = outerSquare
    let squareEndEnd = outerSquare

    if (position === 'start') {
        if (orientation === 'horizontal') {
            roundStartEnd = innerShapeStartEnd
            roundEndEnd = innerShapeEndEnd
            squareStartEnd = innerShapeStartEnd
            squareEndEnd = innerShapeEndEnd
        } else {
            roundEndStart = innerShapeEndStart
            roundEndEnd = innerShapeEndEnd
            squareEndStart = innerShapeEndStart
            squareEndEnd = innerShapeEndEnd
        }
    } else if (position === 'middle') {
        roundStartStart = innerShapeStartStart
        roundStartEnd = innerShapeStartEnd
        roundEndStart = innerShapeEndStart
        roundEndEnd = innerShapeEndEnd
        squareStartStart = innerShapeStartStart
        squareStartEnd = innerShapeStartEnd
        squareEndStart = innerShapeEndStart
        squareEndEnd = innerShapeEndEnd
    } else if (position === 'end') {
        if (orientation === 'horizontal') {
            roundStartStart = innerShapeStartStart
            roundEndStart = innerShapeEndStart
            squareStartStart = innerShapeStartStart
            squareEndStart = innerShapeEndStart
        } else {
            roundStartStart = innerShapeStartStart
            roundStartEnd = innerShapeStartEnd
            squareStartStart = innerShapeStartStart
            squareEndStart = innerShapeEndStart
        }
    }

    return `
        --mdc-button-${size}-container-shape-round-start-start: ${roundStartStart};
        --mdc-button-${size}-container-shape-round-start-end: ${roundStartEnd};
        --mdc-button-${size}-container-shape-round-end-start: ${roundEndStart};
        --mdc-button-${size}-container-shape-round-end-end: ${roundEndEnd};

        --mdc-button-${size}-container-shape-round-toggle-selected-start-start: ${roundStartStart};
        --mdc-button-${size}-container-shape-round-toggle-selected-start-end: ${roundStartEnd};
        --mdc-button-${size}-container-shape-round-toggle-selected-end-start: ${roundEndStart};
        --mdc-button-${size}-container-shape-round-toggle-selected-end-end: ${roundEndEnd};

        --mdc-button-${size}-container-shape-square-start-start: ${squareStartStart};
        --mdc-button-${size}-container-shape-square-start-end: ${squareStartEnd};
        --mdc-button-${size}-container-shape-square-end-start: ${squareEndStart};
        --mdc-button-${size}-container-shape-square-end-end: ${squareEndEnd};

        --mdc-button-${size}-container-shape-square-toggle-selected-start-start: ${squareStartStart};
        --mdc-button-${size}-container-shape-square-toggle-selected-start-end: ${squareStartEnd};
        --mdc-button-${size}-container-shape-square-toggle-selected-end-start: ${squareEndStart};
        --mdc-button-${size}-container-shape-square-toggle-selected-end-end: ${squareEndEnd};

        --mdc-icon-button-${size}-container-shape-round-start-start: ${roundStartStart};
        --mdc-icon-button-${size}-container-shape-round-start-end: ${roundStartEnd};
        --mdc-icon-button-${size}-container-shape-round-end-start: ${roundEndStart};
        --mdc-icon-button-${size}-container-shape-round-end-end: ${roundEndEnd};

        --mdc-icon-button-${size}-container-shape-round-selected-start-start: ${roundStartStart};
        --mdc-icon-button-${size}-container-shape-round-selected-start-end: ${roundStartEnd};
        --mdc-icon-button-${size}-container-shape-round-selected-end-start: ${roundEndStart};
        --mdc-icon-button-${size}-container-shape-round-selected-end-end: ${roundEndEnd};

        --mdc-icon-button-${size}-container-shape-square-start-start: ${squareStartStart};
        --mdc-icon-button-${size}-container-shape-square-start-end: ${squareStartEnd};
        --mdc-icon-button-${size}-container-shape-square-end-start: ${squareEndStart};
        --mdc-icon-button-${size}-container-shape-square-end-end: ${squareEndEnd};

        --mdc-icon-button-${size}-container-shape-square-selected-start-start: ${squareStartStart};
        --mdc-icon-button-${size}-container-shape-square-selected-start-end: ${squareStartEnd};
        --mdc-icon-button-${size}-container-shape-square-selected-end-start: ${squareEndStart};
        --mdc-icon-button-${size}-container-shape-square-selected-end-end: ${squareEndEnd};
    `
}

function getConnectedShapeStyles() {
    const rules: string[] = []

    for (const size of SIZES) {
        // Horizontal
        rules.push(`
            .container.connected.horizontal.${size} ::slotted([data-group-position="single"]),
            .container.connected.horizontal.${size} ::slotted(.single) {
                ${getConnectedShapeTokensString(size, 'single', 'horizontal')}
            }

            .container.connected.horizontal.${size} ::slotted([data-group-position="start"]),
            .container.connected.horizontal.${size} ::slotted(.start-side) {
                ${getConnectedShapeTokensString(size, 'start', 'horizontal')}
            }

            .container.connected.horizontal.${size} ::slotted([data-group-position="middle"]),
            .container.connected.horizontal.${size} ::slotted(.middle) {
                ${getConnectedShapeTokensString(size, 'middle', 'horizontal')}
            }

            .container.connected.horizontal.${size} ::slotted([data-group-position="end"]),
            .container.connected.horizontal.${size} ::slotted(.end-side) {
                ${getConnectedShapeTokensString(size, 'end', 'horizontal')}
            }
        `)

        // Vertical
        rules.push(`
            .container.connected.vertical.${size} ::slotted([data-group-position="single"]),
            .container.connected.vertical.${size} ::slotted(.single) {
                ${getConnectedShapeTokensString(size, 'single', 'vertical')}
            }

            .container.connected.vertical.${size} ::slotted([data-group-position="start"]),
            .container.connected.vertical.${size} ::slotted(.start-side) {
                ${getConnectedShapeTokensString(size, 'start', 'vertical')}
            }

            .container.connected.vertical.${size} ::slotted([data-group-position="middle"]),
            .container.connected.vertical.${size} ::slotted(.middle) {
                ${getConnectedShapeTokensString(size, 'middle', 'vertical')}
            }

            .container.connected.vertical.${size} ::slotted([data-group-position="end"]),
            .container.connected.vertical.${size} ::slotted(.end-side) {
                ${getConnectedShapeTokensString(size, 'end', 'vertical')}
            }
        `)
    }

    return unsafeCSS(rules.join('\n'))
}

export const buttonGroupStyles = css`
    :host {
        ${standardTokenString}
        ${connectedTokenString}

        display: inline-flex;
        vertical-align: middle;
        max-width: 100%;
    }

    :host([hidden]) {
        display: none !important;
    }

    .container {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        position: relative;
        box-sizing: border-box;
    }

    .container.vertical {
        flex-direction: column;
    }

    /* ── Standard Variant Spacing (Accessible minimum touch target) ─ */

    .container.standard {
        gap: var(--_enabled-space-between);
    }
    .container.standard.extra-small {
        gap: var(--_enabled-extra-small-space-between);
    }
    .container.standard.small {
        gap: var(--_enabled-small-space-between);
    }
    .container.standard.medium {
        gap: var(--_enabled-medium-space-between);
    }
    .container.standard.large {
        gap: var(--_enabled-large-space-between);
    }
    .container.standard.extra-large {
        gap: var(--_enabled-extra-large-space-between);
    }

    /* ── Connected Variant Spacing (2dp inner padding) ───────────── */

    .container.connected {
        gap: var(--_enabled-space-between);
    }
    .container.connected.extra-small {
        gap: var(--_enabled-extra-small-space-between);
    }
    .container.connected.small {
        gap: var(--_enabled-small-space-between);
    }
    .container.connected.medium {
        gap: var(--_enabled-medium-space-between);
    }
    .container.connected.large {
        gap: var(--_enabled-large-space-between);
    }
    .container.connected.extra-large {
        gap: var(--_enabled-extra-large-space-between);
    }

    /* ── Minimum Widths for Touch Targets (48dp for XS & S) ──────── */

    .container.connected.extra-small ::slotted(*) {
        min-width: var(--_enabled-extra-small-min-width);
    }
    .container.connected.small ::slotted(*) {
        min-width: var(--_enabled-small-min-width);
    }

    /* ── Slotted Button Transitions ─────────────────────────────── */

    ::slotted(*) {
        transition:
            border-radius 250ms cubic-bezier(0.2, 0, 0, 1),
            flex-grow 250ms cubic-bezier(0.2, 0, 0, 1),
            transform 200ms cubic-bezier(0.2, 0, 0, 1),
            background-color 200ms ease,
            color 200ms ease;
    }

    /* ── Expressive Width Expansion ──────────────────────────────── */
    /*
       The actual flex-grow morph is applied via inline style by
       base-button-group.ts.applyExpandOnActiveMorph on press / selection
       change. CSS rules here are a baseline that visually agrees with
       inline-style overrides; the :has() pseudo-class cannot be used
       with ::slotted() (silently dropped by Chromium).
    */

    /* ── Connected Shape Distributions ───────────────────────────── */

    ${getConnectedShapeStyles()}

    /* ── Disabled Container ──────────────────────────────────────── */

    .container.disabled {
        pointer-events: none;
        opacity: 0.38;
    }
`
