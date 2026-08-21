/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Styles for `mdc-carousel` — the scroll-snap container.
 *
 * The host is the scroll container: a `flex` row with horizontal overflow and
 * scroll snapping. Item widths are derived at runtime (see `base-carousel.ts`)
 * and re-exposed here as inheritable `--_item-width-*` / `--_item-shape-*`
 * custom properties so the slotted `mdc-carousel-item` cells can read them
 * across the shadow boundary. Users may override every value through the
 * public `--mdc-carousel-*` properties.
 */
import { css, unsafeCSS } from 'lit'
import { CarouselDefinition } from '../../component-definitions/carousel.definition'
import { defineTokenRefsRecord, defineVars } from '@sandlada/jss'

const tokenRecord = defineTokenRefsRecord(CarouselDefinition, {
    expandShapes: false,
    useBaseFallback: true,
    prefix: '--mdc-carousel',
})
const tokenString = unsafeCSS(defineVars(tokenRecord, true).join(''))

export const CarouselStyles = css`
    :host {
        ${tokenString};

        /* Item sizes — widths are computed in base-carousel.ts; shapes come
           from CarouselDefinition. Both inherit to the slotted items. */
        --_item-width-large: var(--mdc-carousel-large-item-width, var(--_carousel-computed-large));
        --_item-width-medium: var(--mdc-carousel-medium-item-width, var(--_carousel-computed-medium));
        --_item-width-small: var(--mdc-carousel-small-item-width, var(--_carousel-computed-small));
        --_item-height: var(--mdc-carousel-item-height);

        display: flex;
        box-sizing: border-box;
        align-items: stretch;
        overflow-x: auto;
        overflow-y: hidden;
        gap: var(--_item-spacing);
        padding-inline: var(--_container-inline-leading-padding-space) var(--_container-inline-trailing-padding-space);
        padding-block: var(--_container-block-leading-padding-space) var(--_container-block-trailing-padding-space);
        /* Items snap their start edge to the leading keyline (the inline
           padding position), matching the Compose keyline alignment. */
        scroll-snap-type: x mandatory;
        scroll-padding-inline: var(--_container-inline-leading-padding-space) var(--_container-inline-trailing-padding-space);
        overscroll-behavior-x: contain;
        outline: none;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    :host::-webkit-scrollbar {
        display: none;
    }

    /* Uncontained: fixed-width items, free scrolling — no snap. */
    :host([variant='uncontained']) {
        scroll-snap-type: none;
    }
    :host([variant='uncontained']) ::slotted(mdc-carousel-item) {
        scroll-snap-align: none;
    }

    ::slotted(mdc-carousel-item) {
        flex: none;
        scroll-snap-align: start;
        /* One item per fling, mirroring Compose's single-advance behavior. */
        scroll-snap-stop: always;
    }
`
