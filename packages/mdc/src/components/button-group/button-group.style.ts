/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { css, unsafeCSS } from 'lit'
import { stringifyTokens } from '../../utils/style'
import {
    ConnectedButtonGroupDefinition,
    StandardButtonGroupDefinition,
} from './button-group.definition'
import { ButtonGroupSizes, type ButtonGroupSize } from './button-group.interface'

const StandardTokenString = stringifyTokens('--mdc-standard-button-group')(StandardButtonGroupDefinition)

const ConnectedTokenString = stringifyTokens('--mdc-connected-button-group')(ConnectedButtonGroupDefinition)

/**
 * Emits the 4 logical-corner overrides for `--mdc-button`, `--mdc-toggle-button`,
 * and `--mdc-icon-button` for a given prefix + state suffix.
 */
function emitCornerTokens(
    size: ButtonGroupSize,
    state: string,
    ss: string,
    se: string,
    es: string,
    ee: string,
): string {
    return `
        --mdc-button-${size}-container-shape-${state}-start-start: ${ss};
        --mdc-button-${size}-container-shape-${state}-start-end: ${se};
        --mdc-button-${size}-container-shape-${state}-end-start: ${es};
        --mdc-button-${size}-container-shape-${state}-end-end: ${ee};

        --mdc-toggle-button-${size}-container-shape-${state}-start-start: ${ss};
        --mdc-toggle-button-${size}-container-shape-${state}-start-end: ${se};
        --mdc-toggle-button-${size}-container-shape-${state}-end-start: ${es};
        --mdc-toggle-button-${size}-container-shape-${state}-end-end: ${ee};

        --mdc-icon-button-${size}-container-shape-${state}-start-start: ${ss};
        --mdc-icon-button-${size}-container-shape-${state}-start-end: ${se};
        --mdc-icon-button-${size}-container-shape-${state}-end-start: ${es};
        --mdc-icon-button-${size}-container-shape-${state}-end-end: ${ee};
    `
}

/**
 * Build the per-position CSS overrides that morph a connected group's slotted
 * children's border radii.
 *
 * - Unselected outer corners use the group's round (`Shape.Full`) or square corner radii;
 *   sides that meet a sibling use the size-scaled inner-shape (`4px`..`20px`).
 * - Selected (`checked`) items morph all four corners to `Shape.Full` (pill) per M3 Expressive
 *   Connected Button Group spec.
 * - Pressed items morph to the size-scaled pressed corner radius.
 */
function getConnectedShapeTokensString(
    size: ButtonGroupSize,
    position: 'start' | 'middle' | 'end' | 'single',
    orientation: 'horizontal' | 'vertical',
): string {
    const innerShapeStartStart = `var(--_enabled-${size}-inner-shape-start-start)`
    const innerShapeStartEnd = `var(--_enabled-${size}-inner-shape-start-end)`
    const innerShapeEndStart = `var(--_enabled-${size}-inner-shape-end-start)`
    const innerShapeEndEnd = `var(--_enabled-${size}-inner-shape-end-end)`

    const outerRound = `var(--_enabled-${size}-outer-shape-round)`
    const outerSquare = `var(--_enabled-${size}-outer-shape-square)`
    const selectedShape = `var(--_enabled-selected-shape)`
    const pressedShape = `var(--_enabled-${size}-pressed-shape)`

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
            squareStartEnd = innerShapeStartEnd
        }
    }

    return [
        emitCornerTokens(size, 'round', roundStartStart, roundStartEnd, roundEndStart, roundEndEnd),
        emitCornerTokens(size, 'square', squareStartStart, squareStartEnd, squareEndStart, squareEndEnd),
        emitCornerTokens(size, 'round-selected', selectedShape, selectedShape, selectedShape, selectedShape),
        emitCornerTokens(size, 'square-selected', selectedShape, selectedShape, selectedShape, selectedShape),
        emitCornerTokens(size, 'pressed-morph', pressedShape, pressedShape, pressedShape, pressedShape),
    ].join('\n')
}

function getConnectedShapeStyles() {
    const rules: string[] = []

    for (const size of ButtonGroupSizes) {
        for (const orientation of ['horizontal', 'vertical'] as const) {
            rules.push(`
                .container.connected.${orientation}.${size} ::slotted([data-group-position="single"]),
                .container.connected.${orientation}.${size} ::slotted(.single) {
                    ${getConnectedShapeTokensString(size, 'single', orientation)}
                }

                .container.connected.${orientation}.${size} ::slotted([data-group-position="start"]),
                .container.connected.${orientation}.${size} ::slotted(.start-side) {
                    ${getConnectedShapeTokensString(size, 'start', orientation)}
                }

                .container.connected.${orientation}.${size} ::slotted([data-group-position="middle"]),
                .container.connected.${orientation}.${size} ::slotted(.middle) {
                    ${getConnectedShapeTokensString(size, 'middle', orientation)}
                }

                .container.connected.${orientation}.${size} ::slotted([data-group-position="end"]),
                .container.connected.${orientation}.${size} ::slotted(.end-side) {
                    ${getConnectedShapeTokensString(size, 'end', orientation)}
                }
            `)
        }
    }

    return unsafeCSS(rules.join('\n'))
}

export const ButtonGroupStyles = css`
    @layer mdc.button-group {
        :host {
            ${StandardTokenString}
            ${ConnectedTokenString}

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
            align-items: stretch;
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
                width 250ms cubic-bezier(0.38, 1.21, 0.22, 1),
                min-width 250ms cubic-bezier(0.38, 1.21, 0.22, 1),
                flex-basis 250ms cubic-bezier(0.38, 1.21, 0.22, 1),
                flex-grow 250ms cubic-bezier(0.38, 1.21, 0.22, 1),
                border-radius 250ms cubic-bezier(0.2, 0, 0, 1),
                background-color 200ms ease,
                color 200ms ease;
        }

        /* ── Connected Shape Distributions ───────────────────────────── */

        ${getConnectedShapeStyles()}

        /* ── Disabled Container ──────────────────────────────────────── */

        .container.disabled {
            pointer-events: none;
            opacity: 0.38;
        }

        /* ── Accessibility ───────────────────────────────────────────── */

        @media (prefers-reduced-motion: reduce) {
            ::slotted(*) {
                transition: none;
            }
        }

        @media (forced-colors: active) {
            .container {
                forced-color-adjust: auto;
            }
        }
    }
`
