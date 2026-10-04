/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Styles for `mdc-carousel` — the scroll-snap container.
 *
 * The host is the scroll container: a `flex` row with horizontal overflow and
 * scroll snapping. Item widths are derived at runtime (see
 * `internal/base-carousel.ts`) and chained into the definition's per-size
 * `--_*-item-width` custom properties, so the slotted `mdc-carousel-item`
 * cells can read them across the shadow boundary. Users may override every
 * value through the public `--mdc-carousel-*` properties.
 */
import { css } from 'lit'
import { createStyleSheet, stringifyTokens } from '@sandlada/styles/adapters/lit'
import { CarouselDefinition } from './carousel.definition'

const tokens = stringifyTokens('--mdc-carousel')(CarouselDefinition)

const stylePart = createStyleSheet(CarouselDefinition)(() => css`
    @layer mdc.carousel.component {
        :host {
            display: flex;
            box-sizing: border-box;
            align-items: stretch;
            overflow-x: auto;
            overflow-y: hidden;
            gap: var(--_item-spacing);
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
            /* Items snap their start edge to the leading keyline (the inline
               padding position), matching the Compose keyline alignment. */
            scroll-snap-type: x mandatory;
            scroll-padding-inline-start: var(--_container-padding-inline-start);
            scroll-padding-inline-end: var(--_container-padding-inline-end);
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
    }

    @layer mdc.carousel.motion {
        @media (prefers-reduced-motion: reduce) {
            :host {
                scroll-behavior: auto;
            }
        }
    }
`)

export const CarouselStyles = [
    css`
        @layer mdc.carousel {
            @layer variable, component, motion;
        }
    `,
    css`@layer mdc.carousel.variable { :host { ${tokens}; } }`,
    stylePart,
]
