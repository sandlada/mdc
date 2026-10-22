/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import type { ElevationDefinition } from '../elevation/elevation.definition'
import { LegacyMenuDefinition } from './legacy-menu.definition'
import { overrideTokens, stringifyTokens } from '../../utils/style'

const emphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSValue())
const emphasizedAccelerateEasing = unsafeCSS(Easing.EmphasizedAccelerate.ToCSSValue())

const legacyMenuTokens = stringifyTokens('--mdc-legacy-menu')(LegacyMenuDefinition)

const elevationStyles = overrideTokens<typeof ElevationDefinition>('--mdc-elevation')({
    'level': `var(--_enabled-container-elevation)`,
})()

export const LegacyMenuStyles = css`
    @layer mdc.legacy-menu.variable {
        :host { ${legacyMenuTokens}; }
    }

    @layer mdc.legacy-menu.base {
        :host {
            display: block;
            outline: none;
            -webkit-tap-highlight-color: transparent;
            interpolate-size: allow-keywords;
        }

        .host {
            position: relative;
            display: inline-block;
            max-width: 100%;
        }

        .anchor {
            display: contents;
        }

        .surface {
            position: relative;
            box-sizing: border-box;
            display: none;
            flex-direction: column;
            min-width: var(--_enabled-container-min-width);
            max-width: var(--_enabled-container-max-width);
            max-height: var(--_enabled-container-max-height);
            overflow: visible;
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            background-color: var(--_enabled-container-color);
            outline: none;
        }

        .items {
            position: relative;
            z-index: 1;
            display: flex;
            flex: 1 1 auto;
            flex-direction: column;
            box-sizing: border-box;
            min-height: 0;
            max-height: inherit;
            overflow: hidden;
            border-radius: inherit;
        }

        .item-padding {
            display: flex;
            flex: 0 0 auto;
            flex-direction: column;
            box-sizing: border-box;
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
        }

    }

    @layer mdc.legacy-menu.layout {
        ::slotted(mdc-divider) {
            display: block;
            flex-shrink: 0;
            margin-block: 8px;
            background-color: var(--_enabled-divider-color);
            height: var(--_enabled-divider-thickness);
        }

        slot[name='section-label']::slotted(*) {
            display: flex;
            align-items: center;
            flex-shrink: 0;
            box-sizing: border-box;
            min-height: var(--_enabled-group-label-container-height);
            padding-inline: 16px;
        }
    }

    @layer mdc.legacy-menu.label {
        slot[name='section-label']::slotted(*) {
            font-family: var(--_enabled-group-label-font);
            font-size: var(--_enabled-group-label-size);
            font-weight: var(--_enabled-group-label-weight);
            letter-spacing: var(--_enabled-group-label-tracking);
            line-height: var(--_enabled-group-label-leading);
            color: var(--_enabled-group-label-color);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    @layer mdc.legacy-menu.composite.elevation {
        .surface mdc-elevation {
            border-radius: inherit;
            position: absolute;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            ${elevationStyles};
        }
    }

    @layer mdc.legacy-menu.motion {
        .surface {
            /* Closed state values: the close transition animates towards these.
            Material shrinks the surface to 35% of its full height before
            hiding it. */
            height: calc-size(auto, size * 0.35);
            opacity: 0;
            transition:
                display 150ms allow-discrete,
                height 150ms ${emphasizedAccelerateEasing},
                opacity 50ms linear 100ms;
        }
        .items {
            transition: overflow 0s allow-discrete;
        }
        :host(:not([open])) .surface {
            display: none;
        }
        :host([open]) .surface,
        .surface.open {
            display: flex;
            height: auto;
            opacity: 1;
            transition:
                display 500ms allow-discrete,
                height 500ms ${emphasizedEasing},
                opacity 50ms linear;
        }
        :host([open]) .items,
        .surface.open .items {
            overflow-y: auto;
            transition: overflow 0s 500ms allow-discrete;
        }
        :host([open][has-overflow]) .items,
        .surface.open.has-overflow .items {
            overflow: visible;
        }
        /* Quick skips all transitions. These rules must stay after the
        open-state blocks to win the specificity tie. */
        :host([open]) .surface.quick,
        .surface.open.quick,
        .surface.quick {
            transition: none;
        }
        .surface.quick .items {
            transition: none;
        }
        /* Starting styles for the open transition. Declared after the main rules:
        starting-style declarations take part in the normal cascade, so a block
        placed earlier would lose to the matching open-state rules and the
        before-change value would equal the open value, killing the transition. */
        @starting-style {
            :host([open]) .surface,
            .surface.open {
                height: 0;
                opacity: 0;
            }
            /* The items surface is first rendered when the menu leaves
            display: none. Keep its overflow clipped for the whole grow
            transition so a scrollbar cannot appear while the box is smaller
            than its content. */
            :host([open]) .items,
            .surface.open .items,
            :host([has-overflow][open]) .items,
            .surface.open.has-overflow .items {
                overflow: hidden;
                transition: overflow 0s 500ms allow-discrete;
            }
        }

        /* Item fade, copied from Material's menu choreography: items enter
        bottom-last over 250ms and leave bottom-first over 50ms, while the
        surface itself expands / contracts. The container supplies the
        count-dependent delay through custom properties. */
        ::slotted(mdc-legacy-menu-item),
        ::slotted(mdc-legacy-menu-submenu) {
            animation: mdc-legacy-menu-item-out 50ms linear forwards;
            animation-delay: var(--_menu-item-close-delay);
        }
        :host([open]) .surface ::slotted(mdc-legacy-menu-item),
        :host([open]) .surface ::slotted(mdc-legacy-menu-submenu),
        .surface.open ::slotted(mdc-legacy-menu-item),
        .surface.open ::slotted(mdc-legacy-menu-submenu) {
            animation-name: mdc-legacy-menu-item-in;
            animation-duration: 250ms;
            animation-timing-function: linear;
            animation-fill-mode: backwards;
            animation-delay: var(--_menu-item-open-delay);
        }
        .surface.quick ::slotted(mdc-legacy-menu-item),
        .surface.quick ::slotted(mdc-legacy-menu-submenu) {
            animation: none;
        }

        @keyframes mdc-legacy-menu-item-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes mdc-legacy-menu-item-out {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .surface,
        :host([open]) .surface,
        .surface.open {
            scroll-behavior: auto;
            transition: none;
        }
        .items {
            transition: none;
        }
        .surface ::slotted(mdc-legacy-menu-item),
        .surface ::slotted(mdc-legacy-menu-submenu) {
            animation: none;
        }
    }

    @media (forced-colors: active) {
        .surface {
            border: 1px solid CanvasText;
        }
        ::slotted(mdc-divider) {
            background-color: CanvasText;
        }
        slot[name='section-label']::slotted(*) {
            color: CanvasText;
        }
    }

    @media (prefers-contrast: more) {
        .surface {
            border: 2px solid CanvasText;
        }
        ::slotted(mdc-divider) {
            background-color: CanvasText;
        }
        slot[name='section-label']::slotted(*) {
            color: CanvasText;
        }
    }

    @media (prefers-contrast: less) {
        .surface {
            border: 1px solid GrayText;
        }
        ::slotted(mdc-divider) {
            background-color: GrayText;
        }
        slot[name='section-label']::slotted(*) {
            color: GrayText;
        }
    }

    @media (prefers-reduced-transparency: reduce) {
        .surface {
            backdrop-filter: none;
            opacity: 1;
        }
    }
`
