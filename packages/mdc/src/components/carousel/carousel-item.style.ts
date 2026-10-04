/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Styles for `mdc-carousel-item` — a sized cell of an `mdc-carousel`.
 *
 * The item declares no tokens of its own: the owning carousel publishes the
 * per-size `--_small/medium/large-item-width` and `--_*-item-shape-*` custom
 * properties (see `carousel.definition.ts`) and they inherit across the
 * shadow boundary into this light-DOM child. The cell's height is uniform
 * (`--_item-height`) and stretched to the tallest item by the carousel's
 * `align-items: stretch`.
 */
import { css } from 'lit'

export const CarouselItemStyles = css`
    :host {
        display: flex;
        box-sizing: border-box;
        overflow: hidden;
        flex: none;
        height: var(--_item-height);
    }

    :host([size='large']) {
        width: var(--_large-item-width);
        border-start-start-radius: var(--_large-item-shape-start-start);
        border-start-end-radius: var(--_large-item-shape-start-end);
        border-end-start-radius: var(--_large-item-shape-end-start);
        border-end-end-radius: var(--_large-item-shape-end-end);
    }

    :host([size='medium']) {
        width: var(--_medium-item-width);
        border-start-start-radius: var(--_medium-item-shape-start-start);
        border-start-end-radius: var(--_medium-item-shape-start-end);
        border-end-start-radius: var(--_medium-item-shape-end-start);
        border-end-end-radius: var(--_medium-item-shape-end-end);
    }

    :host([size='small']) {
        width: var(--_small-item-width);
        border-start-start-radius: var(--_small-item-shape-start-start);
        border-start-end-radius: var(--_small-item-shape-start-end);
        border-end-start-radius: var(--_small-item-shape-end-start);
        border-end-end-radius: var(--_small-item-shape-end-end);
    }

    /* Slotted content fills the cell. */
    ::slotted(*) {
        flex: 1;
        min-width: 0;
    }
`
