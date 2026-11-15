/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Easing } from '@sandlada/mdk'
import { css, unsafeCSS } from 'lit'
import { overrideTokens, stringifyTokens } from '../../utils/style'
import type { IconDefinition } from '../icon/icon.definition'
import type { RippleDefinition } from '../ripple/ripple.definition'
import { ListItemDefinition } from './list.definition'

const ListItemTokens = stringifyTokens('--mdc-list-item')(ListItemDefinition)

const EmphasizedEasing = unsafeCSS(Easing.Emphasized.ToCSSValue())

const RippleStyles = overrideTokens<typeof RippleDefinition>('--mdc-ripple')({
    'enabled-hovered-color': `var(--_hovered-state-layer-color)`,
    'enabled-focused-color': `var(--_focused-state-layer-color)`,
    'enabled-pressed-color': `var(--_pressed-state-layer-color)`,
    'enabled-hovered-opacity': `var(--_hovered-state-layer-opacity)`,
    'enabled-focused-opacity': `var(--_focused-state-layer-opacity)`,
    'enabled-pressed-opacity': `var(--_pressed-state-layer-opacity)`,
})()

const LeadingIconStyles = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'enabled-size': `var(--_leading-icon-size)`,
})()

const TrailingIconStyles = overrideTokens<typeof IconDefinition>('--mdc-icon')({
    'enabled-size': `var(--_trailing-icon-size)`,
})()

export const ListItemStyles = css`
    @layer mdc.list-item.variable {
        :host { ${ListItemTokens}; }
    }

    @layer mdc.list-item.base {
        :host {
            display: block;
            outline: none;
        }

        .swipe-row {
            display: flex;
            align-items: stretch;
            width: 100%;
            position: relative;
        }

        :host([has-swipe-actions]) .swipe-row {
            touch-action: pan-y;
        }

        :host([swiping]) .swipe-row {
            user-select: none;
        }

        .container {
            all: unset;
            position: relative;
            box-sizing: border-box;
            display: flex;
            align-items: stretch;
            flex: 1 1 0%;
            min-width: 0;
            overflow: hidden;
            min-height: var(--_one-line-container-height);
            padding-inline-start: var(--_enabled-container-padding-inline-start);
            padding-inline-end: var(--_enabled-container-padding-inline-end);
            padding-block-start: var(--_enabled-container-padding-block-start);
            padding-block-end: var(--_enabled-container-padding-block-end);
            border-start-start-radius: var(--_enabled-container-shape-start-start);
            border-start-end-radius: var(--_enabled-container-shape-start-end);
            border-end-start-radius: var(--_enabled-container-shape-end-start);
            border-end-end-radius: var(--_enabled-container-shape-end-end);
            background-color: var(--_enabled-container-color);
            color: var(--_enabled-label-color);
            text-align: start;
            outline: none;
            transition:
                background-color 200ms ${EmphasizedEasing},
                border-radius 200ms ${EmphasizedEasing};
        }

        .container.button,
        .container.link {
            cursor: pointer;
        }

        .container.one-line {
            min-height: var(--_one-line-container-height);
        }
        .container.two-line {
            min-height: var(--_two-line-container-height);
        }
        .container.three-line {
            min-height: var(--_three-line-container-height);
        }

        .container:is(.button, .link):not(.disabled):hover {
            background-color: var(--_hovered-container-color);
        }
        .container:is(.button, .link):not(.disabled):focus-visible {
            background-color: var(--_focused-container-color);
        }
        .container:is(.button, .link):not(.disabled):active {
            background-color: var(--_pressed-container-color);
        }

        /* Segmented variant resting container & position-aware shapes */
        :host([variant='segmented']) .container {
            background-color: var(--_enabled-segmented-container-color);
        }
        :host([variant='segmented'][position='single']) .container {
            border-start-start-radius: var(--_enabled-segmented-single-container-shape-start-start);
            border-start-end-radius: var(--_enabled-segmented-single-container-shape-start-end);
            border-end-start-radius: var(--_enabled-segmented-single-container-shape-end-start);
            border-end-end-radius: var(--_enabled-segmented-single-container-shape-end-end);
        }
        :host([variant='segmented'][position='first']) .container {
            border-start-start-radius: var(--_enabled-segmented-first-container-shape-start-start);
            border-start-end-radius: var(--_enabled-segmented-first-container-shape-start-end);
            border-end-start-radius: var(--_enabled-segmented-first-container-shape-end-start);
            border-end-end-radius: var(--_enabled-segmented-first-container-shape-end-end);
        }
        :host([variant='segmented'][position='middle']) .container {
            border-start-start-radius: var(--_enabled-segmented-middle-container-shape-start-start);
            border-start-end-radius: var(--_enabled-segmented-middle-container-shape-start-end);
            border-end-start-radius: var(--_enabled-segmented-middle-container-shape-end-start);
            border-end-end-radius: var(--_enabled-segmented-middle-container-shape-end-end);
        }
        :host([variant='segmented'][position='last']) .container {
            border-start-start-radius: var(--_enabled-segmented-last-container-shape-start-start);
            border-start-end-radius: var(--_enabled-segmented-last-container-shape-start-end);
            border-end-start-radius: var(--_enabled-segmented-last-container-shape-end-start);
            border-end-end-radius: var(--_enabled-segmented-last-container-shape-end-end);
        }

        /* Expressive interactive state shape morphing for segmented items */
        :host([variant='segmented']) .container:is(.button, .link):not(.disabled):hover {
            border-start-start-radius: var(--_hovered-container-shape-start-start);
            border-start-end-radius: var(--_hovered-container-shape-start-end);
            border-end-start-radius: var(--_hovered-container-shape-end-start);
            border-end-end-radius: var(--_hovered-container-shape-end-end);
        }
        :host([variant='segmented']) .container:is(.button, .link):not(.disabled):focus-visible {
            border-start-start-radius: var(--_focused-container-shape-start-start);
            border-start-end-radius: var(--_focused-container-shape-start-end);
            border-end-start-radius: var(--_focused-container-shape-end-start);
            border-end-end-radius: var(--_focused-container-shape-end-end);
        }
        :host([variant='segmented']) .container:is(.button, .link):not(.disabled):active {
            border-start-start-radius: var(--_pressed-container-shape-start-start);
            border-start-end-radius: var(--_pressed-container-shape-start-end);
            border-end-start-radius: var(--_pressed-container-shape-end-start);
            border-end-end-radius: var(--_pressed-container-shape-end-end);
        }

        .container.disabled {
            cursor: default;
            pointer-events: none;
            background-color: var(--_disabled-container-color);
        }
        :host([variant='segmented']) .container.disabled {
            background-color: var(--_disabled-segmented-container-color);
        }

        /* Swiping / swiped-open foreground card morphs to SurfaceContainer + Shape.Large */
        .container.swiped:not(.disabled),
        :host([swiping]) .container:not(.disabled) {
            background-color: var(--_enabled-swiped-container-color);
            border-start-start-radius: var(--_enabled-swiped-container-shape-start-start);
            border-start-end-radius: var(--_enabled-swiped-container-shape-start-end);
            border-end-start-radius: var(--_enabled-swiped-container-shape-end-start);
            border-end-end-radius: var(--_enabled-swiped-container-shape-end-end);
        }
        :host([swiping]) .container:not(.disabled) {
            transition: none;
        }
        :host([variant='segmented'][swiping]) .container:not(.disabled),
        :host([variant='segmented'][swiping]) .container:is(.button, .link):not(.disabled):hover,
        :host([variant='segmented'][swiping]) .container:is(.button, .link):not(.disabled):focus-visible,
        :host([variant='segmented'][swiping]) .container:is(.button, .link):not(.disabled):active,
        :host([variant='segmented']) .container.swiped:is(.button, .link):not(.disabled):hover,
        :host([variant='segmented']) .container.swiped:is(.button, .link):not(.disabled):focus-visible,
        :host([variant='segmented']) .container.swiped:is(.button, .link):not(.disabled):active {
            border-start-start-radius: var(--_enabled-swiped-container-shape-start-start);
            border-start-end-radius: var(--_enabled-swiped-container-shape-start-end);
            border-end-start-radius: var(--_enabled-swiped-container-shape-end-start);
            border-end-end-radius: var(--_enabled-swiped-container-shape-end-end);
        }
    }

    @layer mdc.list-item.base.layout {
        .item-clip {
            position: relative;
            z-index: 1;
            flex: 1 1 0%;
            min-width: 0;
            align-self: stretch;
            overflow: hidden;
            display: flex;
            align-items: center;
        }

        .container.three-line .item-clip {
            align-items: flex-start;
        }

        .item {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            flex: 0 0 calc(100% + var(--_swipe-content-extra, 0px));
            min-width: 0;
            gap: var(--_enabled-between-space);
            transform: translateX(var(--_swipe-content-shift, 0px));
            transition:
                flex-basis 250ms ${EmphasizedEasing},
                transform 250ms ${EmphasizedEasing};
        }

        :host([swipe-state='open-end']) {
            --_swipe-content-extra: calc(var(--_swipe-end-intrinsic, 0px) + var(--_enabled-swipe-gap));
            --_swipe-content-shift: calc(-1 * var(--_swipe-dir, 1) * (var(--_swipe-end-intrinsic, 0px) + var(--_enabled-swipe-gap)));
        }
        :host([swipe-state='open-start']) {
            --_swipe-content-extra: calc(var(--_swipe-start-intrinsic, 0px) + var(--_enabled-swipe-gap));
            --_swipe-content-shift: 0px;
        }
        :host([swiping]) .container,
        :host([swiping]) .item,
        :host([swiping]) .swipe-actions,
        :host([swiping]) .swipe-actions-track {
            transition: none;
        }

        .swipe-actions {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            overflow: hidden;
            width: 0px;
            opacity: 0;
            pointer-events: none;
            transition:
                width 250ms ${EmphasizedEasing},
                margin-inline 250ms ${EmphasizedEasing},
                opacity 200ms ${EmphasizedEasing};
        }
        .swipe-actions.measuring {
            width: max-content;
            max-width: none;
        }
        .swipe-actions.start {
            justify-content: flex-start;
        }
        .swipe-actions.end {
            justify-content: flex-end;
        }
        .swipe-actions {
            --_mdc-swipe-action-icon-opacity: 0;
            --_mdc-swipe-action-icon-transition: 120ms;
        }
        :host([swipe-state='open-start']) .swipe-actions.start {
            width: var(--_swipe-start-intrinsic, 0px);
            margin-inline-end: var(--_enabled-swipe-gap);
            opacity: 1;
            pointer-events: auto;
            --_mdc-swipe-action-icon-opacity: 1;
            --_mdc-swipe-action-icon-transition: 120ms;
        }
        :host([swipe-state='open-end']) .swipe-actions.end {
            width: var(--_swipe-end-intrinsic, 0px);
            margin-inline-start: var(--_enabled-swipe-gap);
            opacity: 1;
            pointer-events: auto;
            --_mdc-swipe-action-icon-opacity: 1;
            --_mdc-swipe-action-icon-transition: 120ms;
        }
        :host([swiping]) .swipe-actions.start {
            width: var(--_swipe-drag-start-width, 0px);
            margin-inline-end: var(--_swipe-drag-start-gap, 0px);
            opacity: var(--_swipe-drag-start-opacity, 0);
            --_mdc-swipe-action-icon-opacity: var(--_swipe-drag-start-icon-opacity, 0);
            --_mdc-swipe-action-icon-transition: 0ms;
        }
        :host([swiping]) .swipe-actions.end {
            width: var(--_swipe-drag-end-width, 0px);
            margin-inline-start: var(--_swipe-drag-end-gap, 0px);
            opacity: var(--_swipe-drag-end-opacity, 0);
            --_mdc-swipe-action-icon-opacity: var(--_swipe-drag-end-icon-opacity, 0);
            --_mdc-swipe-action-icon-transition: 0ms;
        }

        .swipe-actions-track {
            display: flex;
            align-items: center;
            width: 100%;
            gap: var(--_enabled-swipe-actions-gap);
            height: 100%;
        }
        .swipe-actions.start .swipe-actions-track {
            justify-content: flex-start;
        }
        .swipe-actions.end .swipe-actions-track {
            justify-content: flex-end;
        }
        .swipe-actions.measuring .swipe-actions-track {
            width: max-content;
        }

        .swipe-actions ::slotted(*) {
            flex: 0 1 auto;
            min-width: 0;
            border-radius: 9999px;
            overflow: hidden;
            transition:
                flex-grow 200ms ${EmphasizedEasing};
        }
        .swipe-actions.measuring ::slotted(*) {
            flex: 0 0 auto;
        }
        :host([swipe-primary-mode='indirect'][swiping]) .swipe-actions.is-primary-active ::slotted([data-swipe-primary]),
        :host([swipe-primary-mode='direct'][swiping]) .swipe-actions.is-primary-active ::slotted([data-swipe-primary]),
        :host([swipe-primary-ready]) .swipe-actions.is-primary-active ::slotted([data-swipe-primary]) {
            flex-grow: 1;
            --_mdc-swipe-action-grow: 1;
        }
        .swipe-actions ::slotted(button) {
            all: unset;
            box-sizing: border-box;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: var(--_swipe-action-min-width);
            height: var(--_swipe-action-height);
            padding-inline: 16px;
            border-start-start-radius: var(--_swipe-action-shape-start-start);
            border-start-end-radius: var(--_swipe-action-shape-start-end);
            border-end-start-radius: var(--_swipe-action-shape-end-start);
            border-end-end-radius: var(--_swipe-action-shape-end-end);
            background-color: var(--_enabled-swipe-action-container-color);
            color: var(--_enabled-swipe-action-label-color);
            cursor: pointer;
        }
        .swipe-actions ::slotted(button[data-primary]) {
            background-color: var(--_enabled-swipe-primary-action-container-color);
            color: var(--_enabled-swipe-primary-action-label-color);
        }

        .container.three-line .item {
            align-items: flex-start;
        }

        .leading {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            min-width: 0;
            color: var(--_enabled-leading-icon-color);
            ${LeadingIconStyles};
        }

        .container:not(.has-control):not(.has-start) .leading {
            display: none;
        }

        ::slotted([slot='start']),
        ::slotted([slot='control']) {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        ::slotted(img[slot='start']) {
            width: var(--_leading-image-width);
            height: var(--_leading-image-height);
            object-fit: cover;
            border-start-start-radius: var(--_leading-image-shape-start-start);
            border-start-end-radius: var(--_leading-image-shape-start-end);
            border-end-start-radius: var(--_leading-image-shape-end-start);
            border-end-end-radius: var(--_leading-image-shape-end-end);
        }

        ::slotted(video[slot='start']) {
            width: var(--_leading-video-width);
            height: var(--_leading-video-height);
            object-fit: cover;
            border-start-start-radius: var(--_leading-video-shape-start-start);
            border-start-end-radius: var(--_leading-video-shape-start-end);
            border-end-start-radius: var(--_leading-video-shape-end-start);
            border-end-end-radius: var(--_leading-video-shape-end-end);
        }

        ::slotted([slot='start'][data-avatar]) {
            width: var(--_leading-avatar-size);
            height: var(--_leading-avatar-size);
            border-start-start-radius: var(--_leading-avatar-shape-start-start);
            border-start-end-radius: var(--_leading-avatar-shape-start-end);
            border-end-start-radius: var(--_leading-avatar-shape-end-start);
            border-end-end-radius: var(--_leading-avatar-shape-end-end);
            background-color: var(--_enabled-leading-avatar-color);
            color: var(--_enabled-leading-avatar-label-color);
            font-family: var(--_enabled-leading-avatar-label-font);
            font-size: var(--_enabled-leading-avatar-label-size);
            font-weight: var(--_enabled-leading-avatar-label-weight);
            letter-spacing: var(--_enabled-leading-avatar-label-tracking);
            line-height: var(--_enabled-leading-avatar-label-leading);
        }

        .content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-self: stretch;
            flex: 1;
            min-width: 0;
        }

        .trailing {
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;
            gap: var(--_enabled-trailing-gap);
        }

        .container:not(.has-trailing-supporting-text):not(.has-end):not(.expandable) .trailing {
            display: none;
        }

        .end {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            min-width: 0;
            color: var(--_enabled-trailing-icon-color);
            ${TrailingIconStyles};
        }

        .container:not(.has-end):not(.expandable) .end {
            display: none;
        }

        .expand-indicator {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: var(--_expand-indicator-width);
            height: var(--_expand-indicator-height);
            border-start-start-radius: var(--_expand-indicator-shape-start-start);
            border-start-end-radius: var(--_expand-indicator-shape-start-end);
            border-end-start-radius: var(--_expand-indicator-shape-end-start);
            border-end-end-radius: var(--_expand-indicator-shape-end-end);
            background-color: var(--_enabled-expand-indicator-container-color);
            color: var(--_enabled-expand-indicator-icon-color);
            transition:
                background-color 200ms ${EmphasizedEasing},
                color 200ms ${EmphasizedEasing};
        }

        .expand-indicator svg {
            width: var(--_expand-indicator-icon-size);
            height: var(--_expand-indicator-icon-size);
            fill: currentColor;
            transition: transform 250ms ${EmphasizedEasing};
        }

        :host([expanded]) .expand-indicator {
            background-color: var(--_enabled-expand-indicator-container-color-expanded);
            color: var(--_enabled-expand-indicator-icon-color-expanded);
        }

        :host([expanded]) .expand-indicator svg {
            transform: rotate(180deg);
        }

        .children-collapse {
            display: grid;
            grid-template-rows: 0fr;
            margin-block-start: 0px;
            opacity: 0;
            transition:
                grid-template-rows 250ms ${EmphasizedEasing},
                margin-block-start 250ms ${EmphasizedEasing},
                opacity 200ms ${EmphasizedEasing};
        }

        :host([expanded]) .children-collapse.has-children {
            grid-template-rows: 1fr;
            margin-block-start: var(--_enabled-standard-children-gap);
            opacity: 1;
        }

        :host([variant='segmented'][expanded]) .children-collapse.has-children {
            margin-block-start: var(--_enabled-segmented-children-gap);
        }

        .children {
            overflow: hidden;
            min-height: 0;
            display: flex;
            flex-direction: column;
            gap: var(--_enabled-standard-children-gap);
        }

        :host([variant='segmented']) .children {
            gap: var(--_enabled-segmented-children-gap);
        }

        .container:not(.has-overline) .overline,
        .container:not(.has-supporting-text) .supporting-text,
        .container:not(.has-trailing-supporting-text) .trailing-supporting-text {
            display: none;
        }

        .touch-target {
            position: absolute;
            top: 50%;
            left: 50%;
            height: var(--_min-touch-target-size);
            width: 100%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }
    }

    @layer mdc.list-item.base.label {
        .headline,
        .overline,
        .trailing-supporting-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .supporting-text {
            overflow: hidden;
            overflow-wrap: break-word;
            white-space: normal;
        }

        .headline {
            display: block;
            font-family: var(--_enabled-label-font);
            font-size: var(--_enabled-label-size);
            font-weight: var(--_enabled-label-weight);
            letter-spacing: var(--_enabled-label-tracking);
            line-height: var(--_enabled-label-leading);
            color: var(--_enabled-label-color);
        }

        .overline {
            font-family: var(--_enabled-overline-font);
            font-size: var(--_enabled-overline-size);
            font-weight: var(--_enabled-overline-weight);
            letter-spacing: var(--_enabled-overline-tracking);
            line-height: var(--_enabled-overline-leading);
            color: var(--_enabled-overline-color);
        }

        .supporting-text {
            font-family: var(--_enabled-supporting-text-font);
            font-size: var(--_enabled-supporting-text-size);
            font-weight: var(--_enabled-supporting-text-weight);
            letter-spacing: var(--_enabled-supporting-text-tracking);
            line-height: var(--_enabled-supporting-text-leading);
            color: var(--_enabled-supporting-text-color);
        }

        .trailing-supporting-text {
            font-family: var(--_enabled-trailing-supporting-text-font);
            font-size: var(--_enabled-trailing-supporting-text-size);
            font-weight: var(--_enabled-trailing-supporting-text-weight);
            letter-spacing: var(--_enabled-trailing-supporting-text-tracking);
            line-height: var(--_enabled-trailing-supporting-text-leading);
            color: var(--_enabled-trailing-supporting-text-color);
        }
    }

    @layer mdc.list-item.composite.ripple {
        .container mdc-ripple {
            border-radius: inherit;
            z-index: 0;
            ${RippleStyles};
        }
    }

    @layer mdc.list-item.composite.focus-ring {
        .container mdc-focus-ring {
            border-radius: inherit;
            z-index: 1;
        }
    }

    @layer mdc.list-item.composite.selected {
        .container.selected:not(.disabled) {
            background-color: var(--_enabled-container-color-selected);
            color: var(--_enabled-label-color-selected);
            border-start-start-radius: var(--_enabled-selected-container-shape-start-start);
            border-start-end-radius: var(--_enabled-selected-container-shape-start-end);
            border-end-start-radius: var(--_enabled-selected-container-shape-end-start);
            border-end-end-radius: var(--_enabled-selected-container-shape-end-end);
        }
        .container.selected:is(.button, .link):not(.disabled):hover {
            background-color: var(--_hovered-container-color-selected);
        }
        .container.selected:is(.button, .link):not(.disabled):focus-visible {
            background-color: var(--_focused-container-color-selected);
        }
        .container.selected:is(.button, .link):not(.disabled):active {
            background-color: var(--_pressed-container-color-selected);
        }

        .container.selected.disabled {
            background-color: color-mix(in srgb, var(--_disabled-container-color-selected) 38%, transparent);
            border-start-start-radius: var(--_enabled-selected-container-shape-start-start);
            border-start-end-radius: var(--_enabled-selected-container-shape-start-end);
            border-end-start-radius: var(--_enabled-selected-container-shape-end-start);
            border-end-end-radius: var(--_enabled-selected-container-shape-end-end);
        }

        .container.selected:not(.disabled) .headline {
            color: var(--_enabled-label-color-selected);
        }
        .container.selected:not(.disabled) .overline {
            color: var(--_enabled-overline-color-selected);
        }
        .container.selected:not(.disabled) .supporting-text {
            color: var(--_enabled-supporting-text-color-selected);
        }
        .container.selected:not(.disabled) .trailing-supporting-text {
            color: var(--_enabled-trailing-supporting-text-color-selected);
        }
        .container.selected:not(.disabled) .leading {
            color: var(--_enabled-leading-icon-color-selected);
        }
        .container.selected:not(.disabled) .end {
            color: var(--_enabled-trailing-icon-color-selected);
        }
    }

    @layer mdc.list-item.composite.disabled {
        .container.disabled .headline {
            color: var(--_disabled-label-color);
            opacity: var(--_disabled-label-opacity);
        }
        .container.disabled .overline {
            color: var(--_disabled-overline-color);
            opacity: var(--_disabled-label-opacity);
        }
        .container.disabled .supporting-text {
            color: var(--_disabled-supporting-text-color);
            opacity: var(--_disabled-label-opacity);
        }
        .container.disabled .trailing-supporting-text {
            color: var(--_disabled-trailing-supporting-text-color);
            opacity: var(--_disabled-label-opacity);
        }
        .container.disabled .leading {
            color: var(--_disabled-leading-icon-color);
            opacity: var(--_disabled-label-opacity);
        }
        .container.disabled .end {
            color: var(--_disabled-trailing-icon-color);
            opacity: var(--_disabled-label-opacity);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .container,
        .item,
        .swipe-actions,
        .swipe-actions-track,
        .expand-indicator,
        .expand-indicator svg,
        .children-collapse {
            transition: none;
        }
    }

    @media (prefers-contrast: more) {
        :host([variant='segmented']) .container {
            outline: 1px solid CanvasText;
            outline-offset: -1px;
        }
        .container.selected {
            outline: 2px solid CanvasText;
            outline-offset: -2px;
        }
    }

    @media (forced-colors: active) {
        :host([variant='segmented']) .container {
            border: 1px solid CanvasText;
        }
        .container.selected {
            background-color: Highlight;
            color: HighlightText;
        }
        .container.selected .headline,
        .container.selected .overline,
        .container.selected .supporting-text,
        .container.selected .trailing-supporting-text,
        .container.selected .leading,
        .container.selected .end {
            color: HighlightText;
        }
        .container.disabled .headline,
        .container.disabled .overline,
        .container.disabled .supporting-text,
        .container.disabled .trailing-supporting-text,
        .container.disabled .leading,
        .container.disabled .end {
            opacity: 1;
            color: GrayText;
        }
    }
`
