/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Styles for `mdc-carousel-item` — a morphing cell of an `mdc-carousel`.
 */
import { css } from 'lit'

export const CarouselItemStyles = css`
    @layer mdc.carousel-item.component {
        :host {
            position: relative;
            display: flex;
            box-sizing: border-box;
            overflow: hidden;
            flex: none;
            height: var(--_item-height);
            border-start-start-radius: calc(
                var(--_small-item-shape-start-start) +
                (var(--_large-item-shape-start-start) - var(--_small-item-shape-start-start)) * var(--_carousel-item-ratio, 1)
            );
            border-start-end-radius: calc(
                var(--_small-item-shape-start-end) +
                (var(--_large-item-shape-start-end) - var(--_small-item-shape-start-end)) * var(--_carousel-item-ratio, 1)
            );
            border-end-start-radius: calc(
                var(--_small-item-shape-end-start) +
                (var(--_large-item-shape-end-start) - var(--_small-item-shape-end-start)) * var(--_carousel-item-ratio, 1)
            );
            border-end-end-radius: calc(
                var(--_small-item-shape-end-end) +
                (var(--_large-item-shape-end-end) - var(--_small-item-shape-end-end)) * var(--_carousel-item-ratio, 1)
            );
        }

        .content {
            position: relative;
            display: flex;
            flex: 1;
            min-width: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        :host(:not([active])) {
            cursor: pointer;
        }

        ::slotted(*) {
            flex: 1;
            min-width: 0;
        }

        ::slotted(img),
        ::slotted(picture),
        ::slotted(video) {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            pointer-events: none;
        }

        .caption {
            position: absolute;
            inset-block-end: 0;
            inset-inline-start: 0;
            min-width: var(--_carousel-focal-width, 100%);
            box-sizing: border-box;
            padding-block-start: calc(var(--_caption-padding-block-start) * 2);
            padding-block-end: var(--_caption-padding-block-end);
            padding-inline-start: var(--_caption-padding-inline-start);
            padding-inline-end: var(--_caption-padding-inline-end);
            background: linear-gradient(to top, var(--_caption-scrim-color), transparent);
            color: var(--_caption-color);
            font-family: var(--_caption-text-font);
            font-size: var(--_caption-text-size);
            line-height: var(--_caption-text-leading);
            font-weight: var(--_caption-text-weight);
            letter-spacing: var(--_caption-text-tracking);
            opacity: clamp(0, calc((var(--_carousel-item-ratio, 1) - 0.35) / 0.45), 1);
            pointer-events: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    @layer mdc.carousel-item.a11y {
        @media (forced-colors: active) {
            :host {
                outline: 1px solid CanvasText;
            }
            :host([active]) {
                outline: 2px solid Highlight;
            }
        }

        @media (prefers-contrast: more) {
            :host {
                outline: 1px solid currentColor;
            }
        }
    }
`
