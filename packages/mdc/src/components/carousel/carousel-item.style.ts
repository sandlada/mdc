/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Styles for `mdc-carousel-item` — a sized cell of an `mdc-carousel`.
 *
 * For a horizontal carousel the three sizes differ only in width and corner
 * roundness; the width / shape values come from inheritable `--_item-width-*`
 * / `--_item-shape-*` custom properties that the owning carousel publishes.
 * The cell's height is uniform (`--_item-height`) and stretched to the tallest
 * item by the carousel's `align-items: stretch`.
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
        width: var(--_item-width-large);
        border-radius: var(--_item-shape-large);
    }

    :host([size='medium']) {
        width: var(--_item-width-medium);
        border-radius: var(--_item-shape-medium);
    }

    :host([size='small']) {
        width: var(--_item-width-small);
        border-radius: var(--_item-shape-small);
    }

    /* Slotted content fills the cell. */
    ::slotted(*) {
        flex: 1;
        min-width: 0;
    }
`
