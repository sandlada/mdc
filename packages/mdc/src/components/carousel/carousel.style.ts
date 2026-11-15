/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Styles for `mdc-carousel` — the Material Design 3 scroll-snap carousel.
 */
import { css } from 'lit'
import { stringifyTokens } from '../../utils/style'
import { CarouselDefinition } from './carousel.definition'

const Tokens = stringifyTokens('--mdc-carousel')(CarouselDefinition)

const StylePart = css`
    @layer mdc.carousel.component {
        :host {
            position: relative;
            display: block;
            box-sizing: border-box;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            overscroll-behavior-x: contain;
            touch-action: pan-y;
            outline: none;
            scrollbar-width: none;
            user-select: none;
            -webkit-user-drag: none;
            cursor: grab;
        }
        :host::-webkit-scrollbar {
            display: none;
        }

        :host([data-dragging]) {
            cursor: grabbing;
            scroll-snap-type: none;
        }

        /* Invisible snap track driving native scroll-snap & scrollWidth for keylined variants. */
        .snap-track {
            position: absolute;
            inset-block-start: 0;
            inset-inline-start: 0;
            height: 1px;
            display: flex;
            pointer-events: none;
        }

        .snap-stop {
            flex: none;
            height: 1px;
            scroll-snap-align: start;
            scroll-snap-stop: always;
        }

        /* Sticky viewport stays pinned while :host scrolls horizontally. */
        .viewport {
            position: sticky;
            inset-inline-start: 0;
            width: 100%;
            box-sizing: border-box;
            overflow: hidden;
            padding-inline-start: var(--_container-padding-inline-start);
            padding-inline-end: var(--_container-padding-inline-end);
            padding-block-start: var(--_container-padding-block-start);
            padding-block-end: var(--_container-padding-block-end);
        }

        .track {
            position: relative;
            width: 100%;
        }

        :host(:not([variant='uncontained'])) ::slotted(mdc-carousel-item) {
            position: absolute;
            inset-block-start: 0;
            inset-inline-start: 0;
            will-change: transform, width;
        }

        /* Uncontained: uniform items flow natively without keyline morphing or snap. */
        :host([variant='uncontained']) {
            scroll-snap-type: none;
        }

        :host([variant='uncontained']) .snap-track {
            display: none;
        }

        :host([variant='uncontained']) .viewport {
            position: static;
            width: max-content;
            min-width: 100%;
            overflow: visible;
        }

        :host([variant='uncontained']) .track {
            display: flex;
            align-items: stretch;
            gap: var(--_item-spacing);
        }

        :host([variant='uncontained']) ::slotted(mdc-carousel-item) {
            flex: none;
        }

        :host(:focus-visible) {
            outline: 2px solid var(--md-sys-color-primary);
            outline-offset: 2px;
            border-radius: 4px;
        }
    }

    @layer mdc.carousel.a11y {
        @media (forced-colors: active) {
            :host(:focus-visible) {
                outline: 2px solid Highlight;
            }
        }
    }

    @layer mdc.carousel.motion {
        @media (prefers-reduced-motion: reduce) {
            :host {
                scroll-behavior: auto;
            }
        }
    }
`

export const CarouselStyles = [
    css`
        @layer mdc.carousel {
            @layer variable, component, a11y, motion;
        }
    `,
    css`@layer mdc.carousel.variable { :host { ${Tokens}; } }`,
    StylePart,
]
